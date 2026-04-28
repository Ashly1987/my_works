const form = document.querySelector("#movie-form");
const input = document.querySelector("#movie-input");
const statusEl = document.querySelector("#status");
const resultsEl = document.querySelector("#results");
const template = document.querySelector("#movie-card-template");
const dailyViewsEl = document.querySelector("#daily-views");
const totalViewsEl = document.querySelector("#total-views");
const reportButton = document.querySelector("#report-button");
const reportPanel = document.querySelector("#report-panel");
const views7El = document.querySelector("#views-7");
const views14El = document.querySelector("#views-14");
const views30El = document.querySelector("#views-30");

const VIEWS_KEY = "playimdb-view-recorder";

const setStatus = (message) => {
  statusEl.textContent = message;
};

const getDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const readViews = () => {
  try {
    const savedViews = JSON.parse(localStorage.getItem(VIEWS_KEY));
    return savedViews && typeof savedViews === "object" ? savedViews : {};
  } catch (error) {
    return {};
  }
};

const saveViews = (views) => {
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

const recordView = () => {
  const views = readViews();
  const todayKey = getDateKey();

  views[todayKey] = (views[todayKey] || 0) + 1;
  saveViews(views);
  updateViewReport(views);
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

const normalizeResult = (item) => ({
  id: item.id,
  title: item.l || "Untitled",
  year: item.y || "",
  type: item.qid ? item.qid.replace(/-/g, " ") : item.q || "Title",
  cast: item.s || "IMDb title details",
  poster: getPosterUrl(item.i),
});

const renderMovies = (movies) => {
  resultsEl.replaceChildren();

  movies.forEach((movie) => {
    const card = template.content.firstElementChild.cloneNode(true);
    const poster = card.querySelector(".poster");
    const fallback = card.querySelector(".poster-fallback");
    const imdbLink = card.querySelector(".imdb-link");
    const playLink = card.querySelector(".play-link");

    card.querySelector(".movie-title").textContent = movie.title;
    card.querySelector(".movie-type").textContent = movie.type;
    card.querySelector(".movie-year").textContent = movie.year;
    card.querySelector(".movie-cast").textContent = movie.cast;

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
  const letter = toSlugLetter(query);
  const url = `https://v3.sg.media-imdb.com/suggestion/${letter}/${encodeURIComponent(query)}.json`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("IMDb search failed");
  }

  const data = await response.json();
  return (data.d || [])
    .filter((item) => item.id?.startsWith("tt"))
    .slice(0, 8)
    .map(normalizeResult);
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const query = input.value.trim();
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
});

input.addEventListener("focus", () => {
  if (!input.value.trim()) {
    setStatus("Type a movie name, then press Search.");
  }
});

reportButton.addEventListener("click", () => {
  const isOpen = !reportPanel.hidden;

  reportPanel.hidden = isOpen;
  reportButton.setAttribute("aria-expanded", String(!isOpen));
});

recordView();
