package com.example.moviesmcp;

import java.nio.file.Path;

public class Main {
    public static void main(String[] args) throws Exception {
        Config config = Config.fromArgs(args);

        Database database = new Database(config.dbPath());
        database.initialize();

        if (config.webEnabled()) {
            WebServer webServer = new WebServer(database, config.webHost(), config.webPort());
            webServer.start();
            System.err.println("Web UI running at " + webServer.baseUrl());
        }

        McpServer server = new McpServer(database);
        server.start(System.in, System.out);
    }

    private record Config(Path dbPath, boolean webEnabled, String webHost, int webPort) {
        static Config fromArgs(String[] args) {
            Path dbPath = Path.of("movies.db");
            boolean webEnabled = true;
            String webHost = "127.0.0.1";
            int webPort = 8080;

            for (String arg : args) {
                if (arg.startsWith("--db=")) {
                    dbPath = Path.of(arg.substring("--db=".length()));
                }
                if (arg.equals("--no-web")) {
                    webEnabled = false;
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

            return new Config(dbPath, webEnabled, webHost, webPort);
        }
    }
}
