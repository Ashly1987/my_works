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
    public record DailyView(String day, int views) {
    }

    public record ViewStats(int todayViews, int totalViews, List<DailyView> report) {
    }

    private enum Dialect {
        SQLITE,
        POSTGRES
    }

    private final String jdbcUrl;
    private final Dialect dialect;

    public Database(Path dbFile) {
        this("jdbc:sqlite:" + dbFile.toAbsolutePath());
    }

    public Database(String jdbcUrl) {
        this.jdbcUrl = jdbcUrl;
        this.dialect = jdbcUrl.startsWith("jdbc:postgresql:") ? Dialect.POSTGRES : Dialect.SQLITE;
    }

    public Connection connect() throws SQLException {
        loadDriver();
        return DriverManager.getConnection(jdbcUrl);
    }

    private void loadDriver() throws SQLException {
        String driverClass = dialect == Dialect.POSTGRES ? "org.postgresql.Driver" : "org.sqlite.JDBC";
        try {
            Class.forName(driverClass);
        } catch (ClassNotFoundException e) {
            throw new SQLException("JDBC driver not found: " + driverClass, e);
        }
    }

    public void initialize() throws SQLException {
        try (Connection conn = connect(); Statement stmt = conn.createStatement()) {
            if (dialect == Dialect.POSTGRES) {
                stmt.execute("""
                    CREATE TABLE IF NOT EXISTS movies (
                        id BIGSERIAL PRIMARY KEY,
                        title TEXT NOT NULL,
                        url TEXT NOT NULL UNIQUE,
                        year INTEGER,
                        page INTEGER,
                        image_url TEXT,
                        rating REAL,
                        created_at TIMESTAMPTZ DEFAULT NOW(),
                        updated_at TIMESTAMPTZ DEFAULT NOW()
                    )
                    """);
            } else {
                stmt.execute("""
                    CREATE TABLE IF NOT EXISTS movies (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        title TEXT NOT NULL,
                        url TEXT NOT NULL UNIQUE,
                        year INTEGER,
                        page INTEGER,
                        image_url TEXT,
                        rating REAL,
                        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
                    )
                    """);
            }
            stmt.execute("CREATE INDEX IF NOT EXISTS idx_movies_title ON movies(title)");

            if (dialect == Dialect.POSTGRES) {
                stmt.execute("""
                    CREATE TABLE IF NOT EXISTS view_counts (
                        view_date DATE PRIMARY KEY,
                        view_count INTEGER NOT NULL DEFAULT 0
                    )
                    """);
            } else {
                stmt.execute("""
                    CREATE TABLE IF NOT EXISTS view_counts (
                        view_date TEXT PRIMARY KEY,
                        view_count INTEGER NOT NULL DEFAULT 0
                    )
                    """);
            }

            ensureColumn(stmt, "movies", "image_url", "TEXT", dialect);
            ensureColumn(stmt, "movies", "rating", "REAL", dialect);
            ensureColumn(stmt, "movies", "updated_at", dialect == Dialect.POSTGRES ? "TIMESTAMPTZ DEFAULT NOW()" : "TEXT DEFAULT CURRENT_TIMESTAMP", dialect);
        }
    }

    public void clearMovies() throws SQLException {
        try (Connection conn = connect(); Statement stmt = conn.createStatement()) {
            stmt.execute("DELETE FROM movies");
        }
    }

    private static void ensureColumn(Statement stmt, String table, String column, String type, Dialect dialect) throws SQLException {
        if (dialect == Dialect.POSTGRES) {
            stmt.execute("ALTER TABLE " + table + " ADD COLUMN IF NOT EXISTS " + column + " " + type);
            return;
        }

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
            "image_url = COALESCE(excluded.image_url, movies.image_url), rating = COALESCE(excluded.rating, movies.rating), " +
            "updated_at = CURRENT_TIMESTAMP";

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
                            toInteger(rs.getObject("year")),
                            rs.getInt("page"),
                            rs.getString("image_url"),
                            toDouble(rs.getObject("rating"))
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
                CASE WHEN year IS NULL THEN 0 ELSE 1 END DESC,
                year DESC,
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
                            toInteger(rs.getObject("year")),
                            rs.getInt("page"),
                            rs.getString("image_url"),
                            toDouble(rs.getObject("rating"))
                    ));
                }
            }
        }

        return results;
    }

    public void incrementPageView() throws SQLException {
        final String sql = dialect == Dialect.POSTGRES
            ? "INSERT INTO view_counts (view_date, view_count) VALUES (CURRENT_DATE, 1) ON CONFLICT(view_date) DO UPDATE SET view_count = view_counts.view_count + 1"
            : "INSERT INTO view_counts (view_date, view_count) VALUES (date('now'), 1) ON CONFLICT(view_date) DO UPDATE SET view_count = view_count + 1";

        try (Connection conn = connect(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.executeUpdate();
        }
    }

    public ViewStats getViewStats(int reportDays) throws SQLException {
        final String todaySql = dialect == Dialect.POSTGRES
            ? "SELECT COALESCE(view_count, 0) FROM view_counts WHERE view_date = CURRENT_DATE"
            : "SELECT COALESCE(view_count, 0) FROM view_counts WHERE view_date = date('now')";
        final String totalSql = "SELECT COALESCE(SUM(view_count), 0) FROM view_counts";
        final String reportSql = "SELECT view_date, view_count FROM view_counts ORDER BY view_date DESC LIMIT ?";

        int safeDays = Math.max(1, Math.min(reportDays, 365));

        try (Connection conn = connect()) {
            int todayViews;
            try (PreparedStatement ps = conn.prepareStatement(todaySql); ResultSet rs = ps.executeQuery()) {
                todayViews = rs.next() ? rs.getInt(1) : 0;
            }

            int totalViews;
            try (PreparedStatement ps = conn.prepareStatement(totalSql); ResultSet rs = ps.executeQuery()) {
                totalViews = rs.next() ? rs.getInt(1) : 0;
            }

            List<DailyView> report = new ArrayList<>();
            try (PreparedStatement ps = conn.prepareStatement(reportSql)) {
                ps.setInt(1, safeDays);
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        report.add(new DailyView(String.valueOf(rs.getObject("view_date")), rs.getInt("view_count")));
                    }
                }
            }

            return new ViewStats(todayViews, totalViews, report);
        }
    }

    private static Integer toInteger(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number number) {
            return number.intValue();
        }
        return Integer.valueOf(value.toString());
    }

    private static Double toDouble(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        return Double.valueOf(value.toString());
    }
}
