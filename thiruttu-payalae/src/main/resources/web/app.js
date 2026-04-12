const state = {
  query: "",
  page: 1,
  limit: 24,
  totalPages: 0,
  total: 0
};

const form = document.getElementById("search-form");
const queryInput = document.getElementById("query");
const meta = document.getElementById("meta");
const results = document.getElementById("results");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const pageLabel = document.getElementById("page-label");
const itemTemplate = document.getElementById("result-item-template");
const viewsToday = document.getElementById("views-today");
const viewsTotal = document.getElementById("views-total");
const themeToggle = document.getElementById("theme-toggle");
const revealBlocks = document.querySelectorAll(".reveal-block");
const THEMES = ["sun", "noir", "aurora", "sepia"];
let liveSearchTimer = null;
let requestCounter = 0;

form.addEventListener("submit", (event) => {
  event.preventDefault();
  state.query = queryInput.value.trim();
  state.page = 1;
  loadMovies();
});

prevBtn.addEventListener("click", () => {
  if (state.page > 1) {
    state.page -= 1;
    loadMovies();
  }
});

nextBtn.addEventListener("click", () => {
  if (state.page < state.totalPages) {
    state.page += 1;
    loadMovies();
  }
});

queryInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    form.requestSubmit();
  }
});

queryInput.addEventListener("input", () => {
  const nextQuery = queryInput.value.trim();
  state.query = nextQuery;
  state.page = 1;

  if (liveSearchTimer) {
    clearTimeout(liveSearchTimer);
  }

  liveSearchTimer = setTimeout(() => {
    loadMovies();
  }, 250);
});

if (themeToggle) {
  const persistedTheme = localStorage.getItem("movieAtlasTheme");
  setTheme(THEMES.includes(persistedTheme) ? persistedTheme : "sun");

  themeToggle.addEventListener("click", () => {
    const currentTheme = document.body.dataset.theme || "sun";
    const nextIndex = (THEMES.indexOf(currentTheme) + 1) % THEMES.length;
    setTheme(THEMES[nextIndex]);
  });
}

function setTheme(theme) {
  const selectedTheme = THEMES.includes(theme) ? theme : "sun";
  document.body.dataset.theme = selectedTheme;
  localStorage.setItem("movieAtlasTheme", selectedTheme);
  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", "false");
    themeToggle.textContent = `Theme: ${selectedTheme[0].toUpperCase()}${selectedTheme.slice(1)} (tap to switch)`;
  }
}

function initReveal() {
  if (!window.IntersectionObserver || revealBlocks.length === 0) {
    revealBlocks.forEach((block) => block.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  revealBlocks.forEach((block) => observer.observe(block));
}

function bindCardTilt(card) {
  if (!card || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const rotateY = (x - 0.5) * 10;
    const rotateX = (0.5 - y) * 8;
    card.style.setProperty("--tilt-y", `${rotateY.toFixed(2)}deg`);
    card.style.setProperty("--tilt-x", `${rotateX.toFixed(2)}deg`);
  });

  card.addEventListener("pointerleave", () => {
    card.style.setProperty("--tilt-y", "0deg");
    card.style.setProperty("--tilt-x", "0deg");
  });
}

async function loadMovies() {
  const requestId = ++requestCounter;
  const params = new URLSearchParams({
    query: state.query,
    page: String(state.page),
    limit: String(state.limit)
  });

  meta.textContent = "Loading records...";

  try {
    const response = await fetch(`/api/movies?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    if (requestId !== requestCounter) {
      return;
    }

    state.total = payload.total;
    state.totalPages = payload.totalPages;
    renderMovies(payload.results);
    renderMeta();
    syncPager();
  } catch (error) {
    results.innerHTML = "";
    meta.textContent = `Could not load records: ${error.message}`;
    pageLabel.textContent = "Page -";
    prevBtn.disabled = true;
    nextBtn.disabled = true;
  }
}

function renderMovies(items) {
  results.innerHTML = "";

  if (!items || items.length === 0) {
    const empty = document.createElement("li");
    empty.className = "card";
    empty.innerHTML = '<h2 class="title">No matches</h2><p class="sub">Try a broader search title.</p>';
    results.appendChild(empty);
    return;
  }

  items.forEach((movie, index) => {
    const node = itemTemplate.content.cloneNode(true);
    const card = node.querySelector(".card");
    card.style.animationDelay = `${index * 40}ms`;
    bindCardTilt(card);

    const title = node.querySelector(".title");
    const sub = node.querySelector(".sub");
    const link = node.querySelector(".play-link");
    const poster = node.querySelector(".poster");
    const ratingChip = node.querySelector(".rating-chip");

    title.textContent = movie.title;
    const yearText = movie.year ? `Year ${movie.year}` : "Year unknown";
    sub.textContent = yearText;

    const fallbackPoster = buildFallbackPoster(movie.url);
    const yearPoster = buildYearPosterFallback(movie);
    const posterUrl = movie.imageUrl && movie.imageUrl.trim() ? movie.imageUrl : fallbackPoster;
    if (poster) {
      poster.src = posterUrl;
      poster.alt = `${movie.title} poster`;
      poster.addEventListener("error", () => {
        if (poster.src !== fallbackPoster) {
          poster.src = fallbackPoster;
          return;
        }
        poster.src = yearPoster;
      }, { once: true });
    }

    if (ratingChip) {
      ratingChip.textContent = typeof movie.rating === "number" ? `${movie.rating.toFixed(1)} / 10` : "NR";
    }

    link.href = movie.url;
    link.textContent = "Play";

    results.appendChild(node);
  });
}

function buildFallbackPoster(movieUrl) {
  const encoded = encodeURIComponent(movieUrl || "");
  return `https://image.thum.io/get/width/560/noanimate/${encoded}`;
}

function buildYearPosterFallback(movie) {
  const year = movie.year ? String(movie.year) : "Unknown Year";
  const safeTitle = escapeXml((movie.title || "Movie").slice(0, 36));
  const safeYear = escapeXml(year);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='560' height='800' viewBox='0 0 560 800'>
    <defs>
      <linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stop-color='#0f5d75'/>
        <stop offset='100%' stop-color='#1d2a3a'/>
      </linearGradient>
    </defs>
    <rect width='560' height='800' fill='url(#bg)'/>
    <text x='40' y='380' fill='#f3f7ff' font-size='42' font-family='Sora, Segoe UI, Arial, sans-serif' font-weight='700'>${safeTitle}</text>
    <text x='40' y='445' fill='#ffd28a' font-size='34' font-family='Sora, Segoe UI, Arial, sans-serif' font-weight='600'>${safeYear}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderMeta() {
  const shownText = state.query ? ` for "${state.query}"` : "";
  const pageText = state.totalPages === 0 ? "0" : String(state.page);
  meta.textContent = `${state.total} result${state.total === 1 ? "" : "s"}${shownText}. Page ${pageText} of ${state.totalPages}.`;
}

function syncPager() {
  pageLabel.textContent = state.totalPages === 0 ? "Page 0" : `Page ${state.page}`;
  prevBtn.disabled = state.page <= 1;
  nextBtn.disabled = state.page >= state.totalPages;
}

async function loadViewStats() {
  if (!viewsToday || !viewsTotal) {
    return;
  }

  try {
    const response = await fetch("/api/view-stats?days=21");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    viewsToday.textContent = formatCount(payload.todayViews);
    viewsTotal.textContent = formatCount(payload.totalViews);
  } catch (error) {
    viewsToday.textContent = "-";
    viewsTotal.textContent = "-";
  }
}

function formatCount(value) {
  const numeric = Number(value) || 0;
  return new Intl.NumberFormat().format(numeric);
}

loadMovies();
loadViewStats();
initReveal();
