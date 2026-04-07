const fetch = require("node-fetch");

function withTimeoutSignal(timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeout),
  };
}

function toArrayFromResponse(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.items)) {
    return payload.items;
  }

  if (Array.isArray(payload.results)) {
    return payload.results;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  return [];
}

function mapContentItem(raw) {
  const source = raw.show && typeof raw.show === "object" ? raw.show : raw;
  const id = String(raw.id || raw._id || raw.imdbID || raw.slug || "");
  const resolvedId = String(source.id || source._id || source.imdbID || source.slug || id || "");
  const title =
    source.title || source.name || source.original_title || source.originalName || "Untitled";
  const rawDescription =
    source.description ||
    source.overview ||
    source.plot ||
    source.summary ||
    "No description available.";
  const description = String(rawDescription).replace(/<[^>]*>/g, "").trim();

  const genres = Array.isArray(source.genres)
    ? source.genres
    : Array.isArray(source.genre_ids)
    ? source.genre_ids
    : source.genre
    ? [source.genre]
    : ["General"];

  const posterUrl =
    source.posterUrl ||
    source.poster ||
    source.poster_path ||
    source.image?.original ||
    source.image?.medium ||
    source.image ||
    "";
  const downloadUrl =
    source.downloadUrl ||
    source.download_url ||
    source.download ||
    source.downloadLink ||
    source.movieUrl ||
    source.movie_url ||
    source.links?.download ||
    source.url ||
    "";
  const streamUrl =
    source.streamUrl ||
    source.videoUrl ||
    source.video_url ||
    source.playbackUrl ||
    source.playback_url ||
    source.trailerUrl ||
    source.links?.stream ||
    source.links?.watch ||
    "";

  return {
    id: resolvedId,
    title,
    description,
    genre: String(genres[0] || "General"),
    genres: genres.map((g) => String(g)),
    year: source.year || source.releaseYear || source.release_date || source.premiered || null,
    durationMin: Number(source.durationMin || source.runtime || 0) || null,
    posterUrl: String(posterUrl),
    thumbnailUrl: String(posterUrl),
    streamUrl: String(streamUrl),
    downloadUrl: String(downloadUrl),
  };
}

function buildUrl(baseUrl, path, params = {}) {
  const url = new URL(path, baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

function tokenizeSearch(search) {
  return String(search || "")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

function applyCatalogFilters(items, { search, genre }) {
  let filtered = items;

  if (search) {
    const terms = tokenizeSearch(search);
    filtered = filtered.filter((item) => {
      const title = String(item.title || "").toLowerCase();
      return terms.every((term) => title.includes(term));
    });
  }

  if (genre) {
    const targetGenre = String(genre).toLowerCase();
    filtered = filtered.filter((item) => {
      if (String(item.genre || "").toLowerCase() === targetGenre) {
        return true;
      }

      if (!Array.isArray(item.genres)) {
        return false;
      }

      return item.genres.some((entry) => String(entry).toLowerCase() === targetGenre);
    });
  }

  return filtered;
}

function createExternalCatalogSource({
  baseUrl,
  listPath,
  detailPath,
  timeoutMs,
  authHeader,
  authToken,
}) {
  async function requestJson(url) {
    const { signal, clear } = withTimeoutSignal(timeoutMs);
    try {
      const headers = {};
      if (authHeader && authToken) {
        headers[authHeader] = authToken;
      }

      const response = await fetch(url, {
        method: "GET",
        headers,
        signal,
      });

      if (!response.ok) {
        throw new Error(`External catalog request failed with status ${response.status}`);
      }

      return response.json();
    } finally {
      clear();
    }
  }

  async function listCatalog({ search, genre, page, limit }) {
    const url = buildUrl(baseUrl, listPath, { search, genre, page, limit });
    const payload = await requestJson(url);
    const mappedItems = toArrayFromResponse(payload)
      .map(mapContentItem)
      .filter((item) => item.id);
    const filteredItems = applyCatalogFilters(mappedItems, { search, genre });

    const safePage = Number(page) > 0 ? Number(page) : 1;
    const safeLimit = Number(limit) > 0 ? Number(limit) : 25;
    const start = (safePage - 1) * safeLimit;
    const paginatedItems = filteredItems.slice(start, start + safeLimit);

    return {
      items: paginatedItems,
      total: filteredItems.length,
      page: safePage,
      limit: safeLimit,
    };
  }

  async function getContentById(contentId) {
    const normalizedPath = detailPath.includes(":id")
      ? detailPath.replace(":id", encodeURIComponent(contentId))
      : `${detailPath.replace(/\/$/, "")}/${encodeURIComponent(contentId)}`;

    const url = buildUrl(baseUrl, normalizedPath);
    const payload = await requestJson(url);
    const rawItem = payload.data && !Array.isArray(payload.data) ? payload.data : payload;
    const item = mapContentItem(rawItem);

    if (!item.id) {
      throw new Error("External catalog detail response is missing a usable id field");
    }

    return item;
  }

  return {
    listCatalog,
    getContentById,
  };
}

module.exports = { createExternalCatalogSource };