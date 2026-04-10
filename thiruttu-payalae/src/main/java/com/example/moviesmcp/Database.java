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
                    image_url TEXT,
                    rating REAL,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
                """);
            stmt.execute("CREATE INDEX IF NOT EXISTS idx_movies_title ON movies(title)");

            ensureColumn(stmt, "movies", "image_url", "TEXT");
            ensureColumn(stmt, "movies", "rating", "REAL");
        }
    }

    private static void ensureColumn(Statement stmt, String table, String column, String type) throws SQLException {
        try {
            stmt.execute("ALTER TABLE " + table + " ADD COLUMN " + column + " " + type);
        } catch (SQLException ignored) {
            // Column already exists.
        }
    }

    public int countMovies() throws SQLException {
        try (Connection conn = connect(); Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM movies")) {
            return rs.next() ? rs.getInt(1) : 0;
        }
    }

    public void upsertMovies(List<MovieRecord> movies) throws SQLException {
        final String sql = "INSERT INTO movies (title, url, year, page, image_url, rating) VALUES (?, ?, ?, ?, ?, ?) " +
            "ON CONFLICT(url) DO UPDATE SET title = excluded.title, year = excluded.year, page = excluded.page, " +
            "image_url = COALESCE(excluded.image_url, movies.image_url), rating = COALESCE(excluded.rating, movies.rating)";

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
                ps.setString(5, movie.imageUrl());
                if (movie.rating() != null) {
                    ps.setDouble(6, movie.rating());
                } else {
                    ps.setNull(6, java.sql.Types.REAL);
                }
                ps.addBatch();
            }
            ps.executeBatch();
            conn.commit();
        }
    }

    public List<MovieRecord> searchMovies(String query, int limit) throws SQLException {
        final String sql = """
            SELECT title, url, year, page, image_url, rating
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
                            rs.getInt("page"),
                            rs.getString("image_url"),
                            (Double) rs.getObject("rating")
                    ));
                }
            }
        }

        return results;
    }

    public int countMoviesByQuery(String query) throws SQLException {
        final String sql = """
            SELECT COUNT(*)
            FROM movies
            WHERE lower(title) LIKE lower(?)
            """;

        String like = "%" + query.trim() + "%";
        try (Connection conn = connect(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, like);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? rs.getInt(1) : 0;
            }
        }
    }

    public List<MovieRecord> listMovies(String query, int limit, int offset) throws SQLException {
        final String sql = """
            SELECT title, url, year, page, image_url, rating
            FROM movies
            WHERE lower(title) LIKE lower(?)
            ORDER BY
                CASE WHEN image_url IS NOT NULL AND trim(image_url) <> '' THEN 1 ELSE 0 END DESC,
                CASE WHEN rating IS NOT NULL THEN 1 ELSE 0 END DESC,
                created_at DESC,
                id DESC
            LIMIT ? OFFSET ?
            """;

        String like = "%" + query.trim() + "%";
        List<MovieRecord> results = new ArrayList<>();

        try (Connection conn = connect(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, like);
            ps.setInt(2, Math.max(1, Math.min(limit, 100)));
            ps.setInt(3, Math.max(0, offset));
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    results.add(new MovieRecord(
                            rs.getString("title"),
                            rs.getString("url"),
                            (Integer) rs.getObject("year"),
                            rs.getInt("page"),
                            rs.getString("image_url"),
                            (Double) rs.getObject("rating")
                    ));
                }
            }
        }

        return results;
    }
}
