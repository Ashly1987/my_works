package com.example.moviesmcp;

import java.net.URI;
import java.net.URISyntaxException;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

public class Main {
    private static final String DEFAULT_LIST_URL = "https://moviesda18.com/tamil-2026-movies/";
    private static final int DEFAULT_TOTAL_PAGES = 8;
    private static final int DEFAULT_MAX_DEPTH = 2;

    public static void main(String[] args) throws Exception {
        Config config = Config.fromArgs(args);

        Database database = config.jdbcUrl() != null && !config.jdbcUrl().isBlank()
                ? new Database(config.jdbcUrl())
                : new Database(config.dbPath());
        database.initialize();

        if (config.startupRefreshEnabled()) {
            runStartupRefreshAsync(database, config.startupBaseUrl(), config.startupPages(), config.startupMaxDepth());
        }

        if (config.webEnabled()) {
            WebServer webServer = new WebServer(database, config.webHost(), config.webPort());
            webServer.start();
            System.err.println("Web UI running at " + webServer.baseUrl());
        }

        McpServer server = new McpServer(database);
        server.start(System.in, System.out);
    }

    private static void runStartupRefreshAsync(Database database, String baseUrl, int pages, int maxDepth) {
        Thread refreshThread = new Thread(() -> {
            try {
                System.err.println("Startup refresh started in background.");
                MovieIndexer indexer = new MovieIndexer(baseUrl, pages, maxDepth);
                List<MovieRecord> movies = indexer.fetchAllMovies();
                database.upsertMovies(movies);
                System.err.println("Startup refresh completed. Upserted " + movies.size() + " records.");
            } catch (Exception e) {
                System.err.println("Startup refresh failed: " + e.getMessage());
            }
        }, "startup-refresh");
        refreshThread.setDaemon(true);
        refreshThread.start();
    }

    private record Config(Path dbPath, String jdbcUrl, boolean webEnabled, String webHost, int webPort,
                          boolean startupRefreshEnabled, String startupBaseUrl, int startupPages, int startupMaxDepth) {
        static Config fromArgs(String[] args) {
            Path dbPath = Path.of("movies.db");
            String jdbcUrl = null;
            boolean webEnabled = true;
            String webHost = "127.0.0.1";
            int webPort = 8080;
            boolean startupRefreshEnabled = true;
            String startupBaseUrl = DEFAULT_LIST_URL;
            int startupPages = DEFAULT_TOTAL_PAGES;
            int startupMaxDepth = DEFAULT_MAX_DEPTH;

            String envJdbc = System.getenv("DATABASE_URL");
            if (envJdbc != null && !envJdbc.isBlank()) {
                jdbcUrl = normalizeJdbcUrl(envJdbc);
            }
            String envPort = System.getenv("PORT");
            if (envPort != null && !envPort.isBlank()) {
                try {
                    int candidate = Integer.parseInt(envPort.trim());
                    if (candidate >= 1 && candidate <= 65535) {
                        webPort = candidate;
                    }
                } catch (NumberFormatException ignored) {
                    // Ignore invalid PORT values and keep default.
                }
            }
            String envStartupRefresh = System.getenv("STARTUP_REFRESH");
            if (envStartupRefresh != null && !envStartupRefresh.isBlank()) {
                startupRefreshEnabled = !"false".equalsIgnoreCase(envStartupRefresh.trim());
            }
            String envStartupBaseUrl = System.getenv("STARTUP_BASE_URL");
            if (envStartupBaseUrl != null && !envStartupBaseUrl.isBlank()) {
                startupBaseUrl = envStartupBaseUrl.trim();
            }
            String envStartupPages = System.getenv("STARTUP_PAGES");
            if (envStartupPages != null && !envStartupPages.isBlank()) {
                startupPages = parseIntRange(envStartupPages, DEFAULT_TOTAL_PAGES, 1, 200);
            }
            String envStartupMaxDepth = System.getenv("STARTUP_MAX_DEPTH");
            if (envStartupMaxDepth != null && !envStartupMaxDepth.isBlank()) {
                startupMaxDepth = parseIntRange(envStartupMaxDepth, DEFAULT_MAX_DEPTH, 0, 10);
            }

            for (String arg : args) {
                if (arg.startsWith("--db=")) {
                    dbPath = Path.of(arg.substring("--db=".length()));
                }
                if (arg.startsWith("--jdbc-url=")) {
                    String parsed = arg.substring("--jdbc-url=".length()).trim();
                    if (!parsed.isEmpty()) {
                        jdbcUrl = normalizeJdbcUrl(parsed);
                    }
                }
                if (arg.equals("--no-web")) {
                    webEnabled = false;
                }
                if (arg.equals("--skip-startup-refresh")) {
                    startupRefreshEnabled = false;
                }
                if (arg.startsWith("--startup-base-url=")) {
                    String parsed = arg.substring("--startup-base-url=".length()).trim();
                    if (!parsed.isEmpty()) {
                        startupBaseUrl = parsed;
                    }
                }
                if (arg.startsWith("--startup-pages=")) {
                    String parsed = arg.substring("--startup-pages=".length()).trim();
                    startupPages = parseIntRange(parsed, DEFAULT_TOTAL_PAGES, 1, 200);
                }
                if (arg.startsWith("--startup-max-depth=")) {
                    String parsed = arg.substring("--startup-max-depth=".length()).trim();
                    startupMaxDepth = parseIntRange(parsed, DEFAULT_MAX_DEPTH, 0, 10);
                }
                if (arg.startsWith("--web-host=")) {
                    String parsed = arg.substring("--web-host=".length()).trim();
                    if (!parsed.isEmpty()) {
                        webHost = parsed;
                    }
                }
                if (arg.startsWith("--web-port=")) {
                    String rawPort = arg.substring("--web-port=".length()).trim();
                    try {
                        int candidate = Integer.parseInt(rawPort);
                        if (candidate >= 1 && candidate <= 65535) {
                            webPort = candidate;
                        }
                    } catch (NumberFormatException ignored) {
                        // Ignore invalid port values and keep default.
                    }
                }
            }

            return new Config(dbPath, jdbcUrl, webEnabled, webHost, webPort,
                    startupRefreshEnabled, startupBaseUrl, startupPages, startupMaxDepth);
        }

        private static int parseIntRange(String raw, int fallback, int min, int max) {
            try {
                int parsed = Integer.parseInt(raw.trim());
                if (parsed < min) {
                    return min;
                }
                return Math.min(parsed, max);
            } catch (NumberFormatException e) {
                return fallback;
            }
        }

        private static String normalizeJdbcUrl(String rawUrl) {
            String value = rawUrl.trim();
            if (value.startsWith("jdbc:")) {
                return value;
            }
            if (value.startsWith("postgresql://") || value.startsWith("postgres://")) {
                return toJdbcPostgresUrl(value);
            }
            return value;
        }

        private static String toJdbcPostgresUrl(String rawUrl) {
            String normalized = rawUrl.startsWith("postgres://")
                    ? "postgresql://" + rawUrl.substring("postgres://".length())
                    : rawUrl;

            try {
                URI uri = new URI(normalized);
                String host = uri.getHost();
                if (host == null || host.isBlank()) {
                    return "jdbc:" + normalized;
                }

                String path = uri.getRawPath();
                if (path == null || path.isBlank()) {
                    path = "/postgres";
                }

                StringBuilder jdbc = new StringBuilder("jdbc:postgresql://").append(host);
                if (uri.getPort() > 0) {
                    jdbc.append(':').append(uri.getPort());
                }
                jdbc.append(path);

                String rawQuery = uri.getRawQuery();
                String userInfo = uri.getRawUserInfo();
                List<String> queryParts = new ArrayList<>();
                if (rawQuery != null && !rawQuery.isBlank()) {
                    queryParts.add(rawQuery);
                }

                if (userInfo != null && !userInfo.isBlank()) {
                    String[] split = userInfo.split(":", 2);
                    String user = split[0];
                    String password = split.length > 1 ? split[1] : "";

                    if (!hasQueryParam(rawQuery, "user") && !user.isBlank()) {
                        queryParts.add("user=" + user);
                    }
                    if (!hasQueryParam(rawQuery, "password") && !password.isBlank()) {
                        queryParts.add("password=" + password);
                    }
                }

                if (!queryParts.isEmpty()) {
                    jdbc.append('?').append(String.join("&", queryParts));
                }

                return jdbc.toString();
            } catch (URISyntaxException e) {
                return "jdbc:" + normalized;
            }
        }

        private static boolean hasQueryParam(String query, String key) {
            if (query == null || query.isBlank()) {
                return false;
            }
            String[] parts = query.split("&");
            for (String part : parts) {
                if (part.equals(key) || part.startsWith(key + "=")) {
                    return true;
                }
            }
            return false;
        }
    }
}
