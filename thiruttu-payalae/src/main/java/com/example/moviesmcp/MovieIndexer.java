package com.example.moviesmcp;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.regex.Matcher;

public class MovieIndexer {
    private static final Pattern YEAR_PATTERN = Pattern.compile("\\((\\d{4})\\)");
    private static final Pattern MOVIE_URL_PATTERN = Pattern.compile("/(?:[^/]+-)?tamil-(?:movie|web-series|dubbed-movie)/?$", Pattern.CASE_INSENSITIVE);

    private final String baseUrl;
    private final int maxPagesPerList;
    private final int maxDepth;

    public MovieIndexer(String baseUrl, int maxPagesPerList) {
        this(baseUrl, maxPagesPerList, 2);
    }

    public MovieIndexer(String baseUrl, int maxPagesPerList, int maxDepth) {
        this.baseUrl = baseUrl;
        this.maxPagesPerList = Math.max(1, maxPagesPerList);
        this.maxDepth = Math.max(0, maxDepth);
    }

    public List<MovieRecord> fetchAllMovies() throws IOException {
        List<MovieRecord> records = new ArrayList<>();
        Set<String> visitedPages = new HashSet<>();
        Set<String> visitedFolders = new HashSet<>();
        crawlList(baseUrl, 0, records, visitedPages, visitedFolders);
        return records;
    }

    private void crawlList(String listUrl, int depth, List<MovieRecord> records, Set<String> visitedPages, Set<String> visitedFolders) throws IOException {
        if (depth > maxDepth) {
            return;
        }

        for (int page = 1; page <= maxPagesPerList; page++) {
            String url = page == 1 ? listUrl : listUrl + "?page=" + page;
            if (!visitedPages.add(url)) {
                continue;
            }

            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (MCP Movie Indexer)")
                    .timeout(20_000)
                    .get();

            // Capture "latest updates" links on pages like homepage.
            Elements latestBlocks = doc.select("main div.latest");
            for (Element latest : latestBlocks) {
                Element anchor = latest.selectFirst("a[href]");
                if (anchor == null) {
                    continue;
                }
                Element strong = latest.selectFirst("strong");
                String title = strong != null ? strong.text().trim() : anchor.text().trim();
                String absoluteUrl = toAbsoluteUrl(url, anchor.attr("href").trim());
                Integer year = extractYear(title);
                if (!title.isEmpty() && !absoluteUrl.isEmpty()) {
                    records.add(new MovieRecord(title, absoluteUrl, year, page));
                }
            }

            // Capture folder and movie links from category blocks.
            Elements links = doc.select("main div.f a[href]");
            for (Element anchor : links) {
                String title = anchor.text().trim();
                String href = anchor.attr("href").trim();
                String absoluteUrl = toAbsoluteUrl(url, href);
                if (absoluteUrl.isEmpty()) {
                    continue;
                }

                if (isLikelyMovieUrl(absoluteUrl)) {
                    Integer year = extractYear(title);
                    if (!title.isEmpty()) {
                        records.add(new MovieRecord(title, absoluteUrl, year, page));
                    }
                    continue;
                }

                // Recurse into discovered folders.
                if (depth < maxDepth && visitedFolders.add(absoluteUrl)) {
                    crawlList(absoluteUrl, depth + 1, records, visitedPages, visitedFolders);
                }
            }
        }
    }

    private static boolean isLikelyMovieUrl(String absoluteUrl) {
        try {
            URI uri = new URI(absoluteUrl);
            String path = uri.getPath() == null ? "" : uri.getPath();
            return MOVIE_URL_PATTERN.matcher(path).find();
        } catch (URISyntaxException e) {
            return false;
        }
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
