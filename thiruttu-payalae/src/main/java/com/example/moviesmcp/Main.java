package com.example.moviesmcp;

import java.nio.file.Path;

public class Main {
    public static void main(String[] args) throws Exception {
        Config config = Config.fromArgs(args);

        Database database = new Database(config.dbPath());
        database.initialize();

        McpServer server = new McpServer(database);
        server.start(System.in, System.out);
    }

    private record Config(Path dbPath) {
        static Config fromArgs(String[] args) {
            Path dbPath = Path.of("movies.db");

            for (String arg : args) {
                if (arg.startsWith("--db=")) {
                    dbPath = Path.of(arg.substring("--db=".length()));
                }
            }

            return new Config(dbPath);
        }
    }
}
