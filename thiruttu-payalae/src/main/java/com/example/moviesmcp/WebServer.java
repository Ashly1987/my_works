package com.example.moviesmcp;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.InputStream;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Executors;

public class WebServer {
    private final Database database;
    private final ObjectMapper mapper = new ObjectMapper();
    private final String host;
    private final int port;

    private HttpServer server;

    public WebServer(Database database, String host, int port) {
        this.database = database;
        this.host = host;
        this.port = port;
    }

    public void start() throws IOException {
        server = HttpServer.create(new InetSocketAddress(host, port), 0);
        server.createContext("/", this::serveIndex);
        server.createContext("/index.html", this::serveIndex);
        server.createContext("/styles.css", serveStatic("web/styles.css", "text/css; charset=utf-8"));
        server.createContext("/app.js", serveStatic("web/app.js", "application/javascript; charset=utf-8"));
        server.createContext("/api/movies", this::handleMoviesApi);
        server.setExecutor(Executors.newCachedThreadPool());
        server.start();
    }

    public String baseUrl() {
        return "http://" + host + ":" + port;
    }

    public void stop() {
        if (server != null) {
            server.stop(0);
        }
    }

    private void serveIndex(HttpExchange exchange) throws IOException {
        if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
            sendText(exchange, 405, "Method Not Allowed", "text/plain; charset=utf-8");
            return;
        }
        serveStatic("web/index.html", "text/html; charset=utf-8").handle(exchange);
    }

    private HttpHandler serveStatic(String classpathFile, String contentType) {
        return exchange -> {
            if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendText(exchange, 405, "Method Not Allowed", "text/plain; charset=utf-8");
                return;
            }

            try (InputStream stream = getClass().getClassLoader().getResourceAsStream(classpathFile)) {
                if (stream == null) {
                    sendText(exchange, 404, "Not Found", "text/plain; charset=utf-8");
                    return;
                }

                byte[] body = stream.readAllBytes();
                Headers headers = exchange.getResponseHeaders();
                headers.set("Content-Type", contentType);
                headers.set("Cache-Control", "no-cache");
                exchange.sendResponseHeaders(200, body.length);
                exchange.getResponseBody().write(body);
            } finally {
                exchange.close();
            }
        };
    }

    private void handleMoviesApi(HttpExchange exchange) throws IOException {
        if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
            sendText(exchange, 405, "Method Not Allowed", "application/json; charset=utf-8");
            return;
        }

        URI requestUri = exchange.getRequestURI();
        Map<String, String> params = parseQuery(requestUri.getRawQuery());
        String query = params.getOrDefault("query", "").trim();
        int limit = parseInt(params.get("limit"), 24, 1, 100);
        int page = parseInt(params.get("page"), 1, 1, 10_000);
        int offset = (page - 1) * limit;

        try {
            List<MovieRecord> movies = database.listMovies(query, limit, offset);
            int total = database.countMoviesByQuery(query);
            int totalPages = total == 0 ? 0 : (int) Math.ceil((double) total / limit);

            Map<String, Object> payload = new HashMap<>();
            payload.put("query", query);
            payload.put("page", page);
            payload.put("limit", limit);
            payload.put("total", total);
            payload.put("totalPages", totalPages);
            payload.put("results", movies);

            byte[] body = mapper.writeValueAsBytes(payload);
            Headers headers = exchange.getResponseHeaders();
            headers.set("Content-Type", "application/json; charset=utf-8");
            headers.set("Cache-Control", "no-cache");
            exchange.sendResponseHeaders(200, body.length);
            exchange.getResponseBody().write(body);
        } catch (SQLException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to fetch movies");
            error.put("detail", e.getMessage());
            byte[] body = mapper.writeValueAsBytes(error);
            Headers headers = exchange.getResponseHeaders();
            headers.set("Content-Type", "application/json; charset=utf-8");
            exchange.sendResponseHeaders(500, body.length);
            exchange.getResponseBody().write(body);
        } finally {
            exchange.close();
        }
    }

    private static Map<String, String> parseQuery(String rawQuery) {
        Map<String, String> params = new HashMap<>();
        if (rawQuery == null || rawQuery.isBlank()) {
            return params;
        }

        String[] pairs = rawQuery.split("&");
        for (String pair : pairs) {
            if (pair.isBlank()) {
                continue;
            }
            String[] split = pair.split("=", 2);
            String key = decode(split[0]);
            String value = split.length > 1 ? decode(split[1]) : "";
            params.put(key, value);
        }

        return params;
    }

    private static String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }

    private static int parseInt(String value, int defaultValue, int min, int max) {
        if (value == null || value.isBlank()) {
            return defaultValue;
        }
        try {
            int parsed = Integer.parseInt(value.trim());
            if (parsed < min) {
                return min;
            }
            return Math.min(parsed, max);
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    private static void sendText(HttpExchange exchange, int status, String message, String contentType) throws IOException {
        byte[] body = message.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", contentType);
        exchange.sendResponseHeaders(status, body.length);
        exchange.getResponseBody().write(body);
        exchange.close();
    }
}
