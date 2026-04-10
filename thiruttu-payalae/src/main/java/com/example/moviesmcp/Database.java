package com.example.moviesmcp;

import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

public class Database {
    private final String jdbcUrl;

    public Database(Path dbFile) {
        this.jdbcUrl = "jdbc:sqlite:" + dbFile.toAbsolutePath();
    }

    public Connection connect() throws SQLException {
        return DriverManager.getConnection(jdbcUrl);
    }

    public void initialize() throws SQLException {
        try (Connection conn = connect(); Statement stmt = conn.createStatement()) {
            stmt.execute("""
                CREATE TABLE IF NOT EXISTS movies (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    url TEXT NOT NULL UNIQUE,
                    year INTEGER,
                    page INTEGER,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
                """);
            stmt.execute("CREATE INDEX IF NOT EXISTS idx_movies_title ON movies(title)");
        }
    }

    public int countMovies() throws SQLException {
        try (Connection conn = connect(); Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM movies")) {
            return rs.next() ? rs.getInt(1) : 0;
        }
    }

    public void upsertMovies(List<MovieRecord> movies) throws SQLException {
        final String sql = "INSERT INTO movies (title, url, year, page) VALUES (?, ?, ?, ?) " +
                "ON CONFLICT(url) DO UPDATE SET title = excluded.title, year = excluded.year, page = excluded.page";

        try (Connection conn = connect(); PreparedStatement ps = conn.prepareStatement(sql)) {
            conn.setAutoCommit(false);
            for (MovieRecord movie : movies) {
                ps.setString(1, movie.title());
                ps.setString(2, movie.url());
                if (movie.year() != null) {
                    ps.setInt(3, movie.year());
                } else {
                    ps.setNull(3, java.sql.Types.INTEGER);
                }
                ps.setInt(4, movie.page());
                ps.addBatch();
            }
            ps.executeBatch();
            conn.commit();
        }
    }

    public List<MovieRecord> searchMovies(String query, int limit) throws SQLException {
        final String sql = """
            SELECT title, url, year, page
            FROM movies
            WHERE lower(title) LIKE lower(?)
            ORDER BY title ASC
            LIMIT ?
            """;

        String like = "%" + query.trim() + "%";
        List<MovieRecord> results = new ArrayList<>();

        try (Connection conn = connect(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, like);
            ps.setInt(2, Math.max(1, Math.min(limit, 100)));
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    results.add(new MovieRecord(
                            rs.getString("title"),
                            rs.getString("url"),
                            (Integer) rs.getObject("year"),
                            rs.getInt("page")
                    ));
                }
            }
        }

        return results;
    }
}
