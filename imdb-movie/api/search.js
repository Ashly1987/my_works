const OMDB_API_KEY = process.env.QUICKFLIX_OMDB_API_KEY || "1a249e6a";

const toSlugLetter = (query) => {
  const first = query.trim().toLowerCase().match(/[a-z0-9]/)?.[0] || "x";
  return first;
};

const getPosterUrl = (image) => {
  if (!image?.imageUrl) {
    return "";
  }

  return image.imageUrl.replace(/_V1_.*\.(jpg|png|webp)$/i, "_V1_QL75_UX320_.jpg");
};

const normalizeResult = (item) => ({
  id: item.id,
  title: item.l || "Untitled",
  year: item.y || "",
  type: item.qid ? item.qid.replace(/-/g, " ") : item.q || "Title",
  cast: item.s || "IMDb title details",
  poster: getPosterUrl(item.i),
  rating: item.ir || item.rating || "",
});

const addMovieRating = async (movie) => {
  if (movie.rating || !OMDB_API_KEY) {
    return movie;
  }

  try {
    const response = await fetch(
      `https://www.omdbapi.com/?i=${encodeURIComponent(movie.id)}&apikey=${encodeURIComponent(OMDB_API_KEY)}`
    );

    if (!response.ok) {
      return movie;
    }

    const data = await response.json();
    const rating = data.Response === "True" && data.imdbRating !== "N/A" ? data.imdbRating : "";

    return {
      ...movie,
      rating,
    };
  } catch (error) {
    return movie;
  }
};

export default async function handler(request, response) {
  const query = String(request.query.query || "").trim();

  if (!query) {
    response.status(400).json({ error: "Missing query" });
    return;
  }

  try {
    const letter = toSlugLetter(query);
    const imdbResponse = await fetch(
      `https://v3.sg.media-imdb.com/suggestion/${letter}/${encodeURIComponent(query)}.json`,
      {
        headers: {
          "User-Agent": "QuickFlix/1.0",
        },
      }
    );

    if (!imdbResponse.ok) {
      response.status(502).json({ error: "IMDb search failed" });
      return;
    }

    const data = await imdbResponse.json();
    const movies = (data.d || [])
      .filter((item) => item.id?.startsWith("tt"))
      .slice(0, 8)
      .map(normalizeResult);

    const results = await Promise.all(movies.map(addMovieRating));

    response.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    response.status(200).json({ results });
  } catch (error) {
    response.status(500).json({ error: "Search failed" });
  }
}
