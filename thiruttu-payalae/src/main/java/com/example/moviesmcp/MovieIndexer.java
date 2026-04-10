package com.example.moviesmcp;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class MovieIndexer {
    private static final Pattern YEAR_PATTERN = Pattern.compile("\\((\\d{4})\\)");

    private final String baseUrl;
    private final int totalPages;

    public MovieIndexer(String baseUrl, int totalPages) {
        this.baseUrl = baseUrl;
        this.totalPages = totalPages;
    }

    public List<MovieRecord> fetchAllMovies() throws IOException {
        List<MovieRecord> records = new ArrayList<>();

        for (int page = 1; page <= totalPages; page++) {
            String url = page == 1 ? baseUrl : baseUrl + "?page=" + page;
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (MCP Movie Indexer)")
                    .timeout(20_000)
                    .get();

            Elements folders = doc.select("main div.f a[href]");
            for (Element anchor : folders) {
                String title = anchor.text().trim();
                String href = anchor.attr("href").trim();
                String absoluteUrl = toAbsoluteUrl(url, href);
                Integer year = extractYear(title);

                if (!title.isEmpty() && !absoluteUrl.isEmpty()) {
                    records.add(new MovieRecord(title, absoluteUrl, year, page));
                }
            }
        }

        return records;
    }

    private static Integer extractYear(String title) {
        Matcher matcher = YEAR_PATTERN.matcher(title);
        if (matcher.find()) {
            return Integer.parseInt(matcher.group(1));
        }
        return null;
    }

    private static String toAbsoluteUrl(String sourcePage, String href) {
        try {
            URI source = new URI(sourcePage);
            return source.resolve(href).toString();
        } catch (URISyntaxException e) {
            return href;
        }
    }
}
