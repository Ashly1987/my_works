package com.example.moviesmcp;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.io.BufferedInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class McpServer {
    private static final String PROTOCOL_VERSION = "2024-11-05";
    private static final String DEFAULT_LIST_URL = "https://moviesda18.com/tamil-2026-movies/";
    private static final int DEFAULT_TOTAL_PAGES = 8;

    private enum FramingMode {
        UNKNOWN,
        NEWLINE_JSON,
        CONTENT_LENGTH
    }

    private final ObjectMapper mapper = new ObjectMapper();
    private final Database database;
    private FramingMode framingMode = FramingMode.UNKNOWN;

    public McpServer(Database database) {
        this.database = database;
    }

    public void start(InputStream in, OutputStream out) throws IOException {
        BufferedInputStream input = new BufferedInputStream(in);
        while (true) {
            JsonNode request = readMessage(input);
            if (request == null) {
                return;
            }

            JsonNode id = request.get("id");
            String method = request.path("method").asText("");
            JsonNode params = request.get("params");

            if (id == null || id.isNull()) {
                continue;
            }

            try {
                JsonNode result = handleRequest(method, params);
                ObjectNode response = mapper.createObjectNode();
                response.put("jsonrpc", "2.0");
                response.set("id", id);
                response.set("result", result);
                writeMessage(out, response);
            } catch (Exception e) {
                ObjectNode error = mapper.createObjectNode();
                error.put("code", -32603);
                error.put("message", e.getMessage() != null ? e.getMessage() : "Internal error");

                ObjectNode response = mapper.createObjectNode();
                response.put("jsonrpc", "2.0");
                response.set("id", id);
                response.set("error", error);
                writeMessage(out, response);
            }
        }
    }

    private JsonNode handleRequest(String method, JsonNode params) throws Exception {
        return switch (method) {
            case "initialize" -> initialize();
            case "tools/list" -> listTools();
            case "tools/call" -> callTool(params);
            case "ping" -> mapper.createObjectNode();
            default -> {
                throw new IllegalArgumentException("Unsupported method: " + method);
            }
        };
    }

    private JsonNode initialize() {
        ObjectNode result = mapper.createObjectNode();
        result.put("protocolVersion", PROTOCOL_VERSION);

        ObjectNode capabilities = mapper.createObjectNode();
        ObjectNode tools = mapper.createObjectNode();
        tools.put("listChanged", false);
        capabilities.set("tools", tools);
        result.set("capabilities", capabilities);

        ObjectNode serverInfo = mapper.createObjectNode();
        serverInfo.put("name", "moviesda-mcp-java");
        serverInfo.put("version", "1.0.0");
        result.set("serverInfo", serverInfo);

        return result;
    }

    private JsonNode listTools() {
        ObjectNode result = mapper.createObjectNode();
        ArrayNode tools = mapper.createArrayNode();

        ObjectNode searchTool = mapper.createObjectNode();
        searchTool.put("name", "search_movie");
        searchTool.put("description", "Search movies by title and return matching links.");

        ObjectNode inputSchema = mapper.createObjectNode();
        inputSchema.put("type", "object");
        ObjectNode properties = mapper.createObjectNode();

        ObjectNode query = mapper.createObjectNode();
        query.put("type", "string");
        query.put("description", "Movie name to search for.");
        properties.set("query", query);

        ObjectNode limit = mapper.createObjectNode();
        limit.put("type", "integer");
        limit.put("description", "Maximum results to return (1-100).");
        limit.put("default", 10);
        properties.set("limit", limit);

        inputSchema.set("properties", properties);
        ArrayNode required = mapper.createArrayNode();
        required.add("query");
        inputSchema.set("required", required);

        searchTool.set("inputSchema", inputSchema);
        tools.add(searchTool);

        ObjectNode refreshTool = mapper.createObjectNode();
        refreshTool.put("name", "refresh_index");
        refreshTool.put("description", "Manually scrape and upsert latest movie links into SQLite.");

        ObjectNode refreshInputSchema = mapper.createObjectNode();
        refreshInputSchema.put("type", "object");
        ObjectNode refreshProperties = mapper.createObjectNode();

        ObjectNode baseUrl = mapper.createObjectNode();
        baseUrl.put("type", "string");
        baseUrl.put("description", "Base list URL to scrape.");
        baseUrl.put("default", DEFAULT_LIST_URL);
        refreshProperties.set("baseUrl", baseUrl);

        ObjectNode pages = mapper.createObjectNode();
        pages.put("type", "integer");
        pages.put("description", "Number of paginated list pages to scrape.");
        pages.put("default", DEFAULT_TOTAL_PAGES);
        refreshProperties.set("pages", pages);

        ObjectNode maxDepth = mapper.createObjectNode();
        maxDepth.put("type", "integer");
        maxDepth.put("description", "Folder recursion depth for nested category crawling.");
        maxDepth.put("default", 2);
        refreshProperties.set("maxDepth", maxDepth);

        refreshInputSchema.set("properties", refreshProperties);
        refreshTool.set("inputSchema", refreshInputSchema);
        tools.add(refreshTool);

        result.set("tools", tools);
        return result;
    }

    private JsonNode callTool(JsonNode params) throws Exception {
        String name = params != null ? params.path("name").asText("") : "";
        JsonNode argumentsNode = params != null ? params.path("arguments") : mapper.createObjectNode();

        if ("search_movie".equals(name)) {
            String query = argumentsNode.path("query").asText("").trim();
            int limit = argumentsNode.path("limit").asInt(10);
            if (query.isEmpty()) {
                throw new IllegalArgumentException("'query' is required.");
            }

            List<MovieRecord> results = database.searchMovies(query, limit);
            return searchResponse(results);
        }

        if ("refresh_index".equals(name)) {
            String baseUrl = argumentsNode.path("baseUrl").asText(DEFAULT_LIST_URL).trim();
            int pages = argumentsNode.path("pages").asInt(DEFAULT_TOTAL_PAGES);
            int maxDepth = argumentsNode.path("maxDepth").asInt(2);
            if (baseUrl.isEmpty()) {
                baseUrl = DEFAULT_LIST_URL;
            }
            pages = Math.max(1, pages);
            maxDepth = Math.max(0, maxDepth);

            MovieIndexer indexer = new MovieIndexer(baseUrl, pages, maxDepth);
            List<MovieRecord> movies = indexer.fetchAllMovies();
            database.upsertMovies(movies);

            ObjectNode response = mapper.createObjectNode();
            ArrayNode content = mapper.createArrayNode();
            ObjectNode textEntry = mapper.createObjectNode();
            textEntry.put("type", "text");
            textEntry.put("text", "Refresh completed. Upserted " + movies.size() + " records.");
            content.add(textEntry);
            response.set("content", content);

            Map<String, Object> structured = new HashMap<>();
            structured.put("upserted", movies.size());
            structured.put("baseUrl", baseUrl);
            structured.put("pages", pages);
            structured.put("maxDepth", maxDepth);
            response.set("structuredContent", mapper.valueToTree(structured));
            response.put("isError", false);
            return response;
        }

        throw new IllegalArgumentException("Unknown tool: " + name);
    }

    private JsonNode searchResponse(List<MovieRecord> results) {
        ObjectNode response = mapper.createObjectNode();
        ArrayNode content = mapper.createArrayNode();

        ObjectNode textEntry = mapper.createObjectNode();
        textEntry.put("type", "text");
        textEntry.put("text", formatText(results));
        content.add(textEntry);

        response.set("content", content);

        Map<String, Object> structured = new HashMap<>();
        structured.put("count", results.size());
        structured.put("results", results);
        response.set("structuredContent", mapper.valueToTree(structured));
        response.put("isError", false);

        return response;
    }

    private static String formatText(List<MovieRecord> results) {
        if (results.isEmpty()) {
            return "No matches found.";
        }
        StringBuilder sb = new StringBuilder("Matches:\n");
        for (MovieRecord record : results) {
            sb.append("- ")
                    .append(record.title())
                    .append(" -> ")
                    .append(record.url())
                    .append('\n');
        }
        return sb.toString().trim();
    }

    private JsonNode readMessage(InputStream in) throws IOException {
        while (true) {
            String firstLine = readLineFlexible(in);
            if (firstLine == null) {
                return null;
            }

            String trimmed = firstLine.trim();
            if (trimmed.isEmpty()) {
                continue;
            }

            // MCP stdio transport uses newline-delimited JSON-RPC messages.
            if (trimmed.startsWith("{")) {
                framingMode = FramingMode.NEWLINE_JSON;
                return mapper.readTree(trimmed);
            }

            // Backward-compatible fallback for clients that still use Content-Length framing.
            int contentLength = -1;
            if (isContentLengthHeader(firstLine)) {
                contentLength = parseContentLengthValue(firstLine);
            }

            while (true) {
                String line = readLineFlexible(in);
                if (line == null) {
                    return null;
                }
                if (line.isEmpty()) {
                    break;
                }
                if (isContentLengthHeader(line)) {
                    contentLength = parseContentLengthValue(line);
                }
            }

            if (contentLength <= 0) {
                continue;
            }

            byte[] body = in.readNBytes(contentLength);
            if (body.length < contentLength) {
                return null;
            }

            framingMode = FramingMode.CONTENT_LENGTH;
            return mapper.readTree(body);
        }
    }

    private static boolean isContentLengthHeader(String line) {
        int colon = line.indexOf(':');
        if (colon <= 0) {
            return false;
        }
        String name = line.substring(0, colon).trim();
        return "content-length".equalsIgnoreCase(name);
    }

    private static int parseContentLengthValue(String line) {
        int colon = line.indexOf(':');
        if (colon <= 0) {
            return -1;
        }
        String value = line.substring(colon + 1).trim();
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException ignored) {
            return -1;
        }
    }

    private static String readLineFlexible(InputStream in) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        while (true) {
            int b = in.read();
            if (b == -1) {
                if (baos.size() == 0) {
                    return null;
                }
                return baos.toString(StandardCharsets.UTF_8);
            }

            if (b == '\n') {
                return baos.toString(StandardCharsets.UTF_8);
            }

            if (b == '\r') {
                in.mark(1);
                int next = in.read();
                if (next != '\n' && next != -1) {
                    in.reset();
                }
                return baos.toString(StandardCharsets.UTF_8);
            }

            baos.write(b);
        }
    }

    private void writeMessage(OutputStream out, JsonNode json) throws IOException {
        byte[] body = mapper.writeValueAsBytes(json);
        if (framingMode == FramingMode.CONTENT_LENGTH) {
            String header = "Content-Length: " + body.length + "\r\n\r\n";
            out.write(header.getBytes(StandardCharsets.UTF_8));
            out.write(body);
        } else {
            out.write(body);
            out.write('\n');
        }
        out.flush();
    }
}
