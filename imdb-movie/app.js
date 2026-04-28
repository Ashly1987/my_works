const form = document.querySelector("#movie-form");
const input = document.querySelector("#movie-input");
const clearSearchButton = document.querySelector("#clear-search");
const statusEl = document.querySelector("#status");
const resultsEl = document.querySelector("#results");
const template = document.querySelector("#movie-card-template");
const quickSearchButtons = document.querySelectorAll(".quick-searches button");
const dailyViewsEl = document.querySelector("#daily-views");
const totalViewsEl = document.querySelector("#total-views");
const views7El = document.querySelector("#views-7");
const views14El = document.querySelector("#views-14");
const views30El = document.querySelector("#views-30");
const copyrightYearEl = document.querySelector("#copyright-year");

const VIEWS_KEY = "playimdb-view-recorder";
const FIREBASE_VIEWS_COLLECTION = "quickflixViews";
const FIREBASE_SDK_VERSION = "12.12.1";

let firebaseClientPromise;

const setStatus = (message) => {
  statusEl.textContent = message;
};

const getDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const readLocalViews = () => {
  try {
    const savedViews = JSON.parse(localStorage.getItem(VIEWS_KEY));
    return savedViews && typeof savedViews === "object" ? savedViews : {};
  } catch (error) {
    return {};
  }
};

const saveLocalViews = (views) => {
  localStorage.setItem(VIEWS_KEY, JSON.stringify(views));
};

const getTotalViews = (views) => Object.values(views).reduce((total, count) => total + count, 0);

const getWindowViews = (views, days) => {
  const today = new Date();
  let total = 0;

  for (let index = 0; index < days; index += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - index);
    total += views[getDateKey(date)] || 0;
  }

  return total;
};

const updateViewReport = (views) => {
  dailyViewsEl.textContent = views[getDateKey()] || 0;
  totalViewsEl.textContent = getTotalViews(views);
  views7El.textContent = getWindowViews(views, 7);
  views14El.textContent = getWindowViews(views, 14);
  views30El.textContent = getWindowViews(views, 30);
};

const hasFirebaseConfig = () => {
  const config = window.QUICKFLIX_FIREBASE_CONFIG;

  return Boolean(config?.apiKey && config?.projectId && config?.appId);
};

const getFirebaseClient = async () => {
  if (!firebaseClientPromise) {
    firebaseClientPromise = Promise.all([
      import(`https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-app.js`),
      import(`https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-firestore.js`),
    ]).then(([firebaseApp, firestore]) => {
      const app = firebaseApp.initializeApp(window.QUICKFLIX_FIREBASE_CONFIG);
      const db = firestore.getFirestore(app);

      return { db, firestore };
    });
  }

  return firebaseClientPromise;
};

const readFirebaseViews = async () => {
  const { db, firestore } = await getFirebaseClient();
  const snapshot = await firestore.getDocs(
    firestore.collection(db, FIREBASE_VIEWS_COLLECTION)
  );

  return snapshot.docs.reduce((views, viewDoc) => {
    const { count } = viewDoc.data();
    views[viewDoc.id] = Number.isFinite(count) ? count : 0;
    return views;
  }, {});
};

const recordFirebaseView = async () => {
  const todayKey = getDateKey();
  const { db, firestore } = await getFirebaseClient();
  const viewRef = firestore.doc(db, FIREBASE_VIEWS_COLLECTION, todayKey);

  await firestore.runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(viewRef);
    const currentCount = snapshot.exists() ? snapshot.data().count || 0 : 0;

    transaction.set(
      viewRef,
      {
        count: currentCount + 1,
        date: todayKey,
      },
      { merge: true }
    );
  });

  updateViewReport(await readFirebaseViews());
};

const recordLocalView = () => {
  const views = readLocalViews();
  const todayKey = getDateKey();

  views[todayKey] = (views[todayKey] || 0) + 1;
  saveLocalViews(views);
  updateViewReport(views);
};

const recordView = async () => {
  if (!hasFirebaseConfig()) {
    recordLocalView();
    return;
  }

  try {
    await recordFirebaseView();
  } catch (error) {
    recordLocalView();
  }
};

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

const getImdbUrl = (id) => `https://www.imdb.com/title/${id}/`;
const getPlayUrl = (id) => getImdbUrl(id).replace("www.imdb.com", "www.playimdb.com");

const hasOmdbConfig = () => Boolean(window.QUICKFLIX_OMDB_API_KEY);
const isLocalHost = () => ["localhost", "127.0.0.1", ""].includes(window.location.hostname);

const normalizeResult = (item) => ({
  id: item.id,
  title: item.l || "Untitled",
  year: item.y || "",
  type: item.qid ? item.qid.replace(/-/g, " ") : item.q || "Title",
  cast: item.s || "IMDb title details",
  poster: getPosterUrl(item.i),
  rating: item.ir || item.rating || "",
});

const normalizeOmdbResult = (item) => ({
  id: item.imdbID,
  title: item.Title || "Untitled",
  year: item.Year || "",
  type: item.Type || "Title",
  cast: "IMDb title details",
  poster: item.Poster && item.Poster !== "N/A" ? item.Poster : "",
  rating: item.imdbRating && item.imdbRating !== "N/A" ? item.imdbRating : "",
});

const addMovieRating = async (movie) => {
  if (movie.rating || !hasOmdbConfig()) {
    return movie;
  }

  const url = `https://www.omdbapi.com/?i=${encodeURIComponent(movie.id)}&apikey=${encodeURIComponent(window.QUICKFLIX_OMDB_API_KEY)}`;
  const response = await fetch(url);

  if (!response.ok) {
    return movie;
  }

  const data = await response.json();
  const rating = data.Response === "True" && data.imdbRating !== "N/A" ? data.imdbRating : "";

  return {
    ...movie,
    rating,
  };
};

const searchOmdbMovies = async (query) => {
  if (!hasOmdbConfig()) {
    return [];
  }

  const searchUrl = `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&type=movie&apikey=${encodeURIComponent(window.QUICKFLIX_OMDB_API_KEY)}`;
  const searchResponse = await fetch(searchUrl);

  if (!searchResponse.ok) {
    throw new Error("OMDb search failed");
  }

  const searchData = await searchResponse.json();

  if (searchData.Response !== "True") {
    return [];
  }

  const movies = searchData.Search
    .filter((item) => item.imdbID?.startsWith("tt"))
    .slice(0, 8)
    .map(normalizeOmdbResult);

  return Promise.all(movies.map(addMovieRating));
};

const renderMovies = (movies) => {
  resultsEl.replaceChildren();

  movies.forEach((movie) => {
    const card = template.content.firstElementChild.cloneNode(true);
    const poster = card.querySelector(".poster");
    const fallback = card.querySelector(".poster-fallback");
    const imdbLink = card.querySelector(".imdb-link");
    const playLink = card.querySelector(".play-link");
    const rating = card.querySelector(".movie-rating");

    card.querySelector(".movie-title").textContent = movie.title;
    card.querySelector(".movie-type").textContent = movie.type;
    card.querySelector(".movie-year").textContent = movie.year;
    card.querySelector(".movie-cast").textContent = movie.cast;

    if (movie.rating) {
      rating.textContent = `IMDb ${movie.rating}`;
      rating.hidden = false;
    }

    if (movie.poster) {
      poster.src = movie.poster;
      poster.alt = `${movie.title} poster`;
      fallback.hidden = true;
    } else {
      poster.hidden = true;
    }

    imdbLink.href = getImdbUrl(movie.id);
    playLink.href = getPlayUrl(movie.id);

    resultsEl.append(card);
  });
};

const searchMovies = async (query) => {
  try {
    const apiResponse = await fetch(`/api/search?query=${encodeURIComponent(query)}`);

    if (apiResponse.ok) {
      const data = await apiResponse.json();
      return data.results || [];
    }
  } catch (error) {
    // Vercel provides /api/search after deployment; local static servers do not.
  }

  if (!isLocalHost()) {
    return searchOmdbMovies(query);
  }

  const letter = toSlugLetter(query);
  const url = `https://v3.sg.media-imdb.com/suggestion/${letter}/${encodeURIComponent(query)}.json`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("IMDb search failed");
  }

  const data = await response.json();
  const movies = (data.d || [])
    .filter((item) => item.id?.startsWith("tt"))
    .slice(0, 8)
    .map(normalizeResult);

  return Promise.all(movies.map(addMovieRating));
};

const runMovieSearch = async (query) => {
  if (!query) {
    input.focus();
    return;
  }

  setStatus(`Searching IMDb for "${query}"...`);
  resultsEl.replaceChildren();

  try {
    const movies = await searchMovies(query);

    if (!movies.length) {
      setStatus(`No IMDb titles found for "${query}".`);
      return;
    }

    renderMovies(movies);
    setStatus(`Showing ${movies.length} result${movies.length === 1 ? "" : "s"} for "${query}".`);
  } catch (error) {
    setStatus("Could not reach IMDb right now. Please try again in a moment.");
  }
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  await runMovieSearch(input.value.trim());
});

quickSearchButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const query = button.dataset.movie;

    input.value = query;
    clearSearchButton.hidden = false;
    await runMovieSearch(query);
  });
});

input.addEventListener("input", () => {
  clearSearchButton.hidden = !input.value.trim();
});

input.addEventListener("focus", () => {
  if (!input.value.trim()) {
    setStatus("Type a movie name, then press Search.");
  }
});

clearSearchButton.addEventListener("click", () => {
  input.value = "";
  clearSearchButton.hidden = true;
  resultsEl.replaceChildren();
  setStatus("Enter a title to begin your search.");
  input.focus();
});

clearSearchButton.hidden = !input.value.trim();
copyrightYearEl.textContent = new Date().getFullYear();
recordView();
