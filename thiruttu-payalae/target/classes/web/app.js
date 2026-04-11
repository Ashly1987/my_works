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
const refreshStatusEl = document.getElementById("refresh-status");
const itemTemplate = document.getElementById("result-item-template");
const kpiTotal = document.getElementById("kpi-total");
const kpiPage = document.getElementById("kpi-page");
const kpiPages = document.getElementById("kpi-pages");
const chips = document.querySelectorAll(".chip");
const themeToggle = document.getElementById("theme-toggle");
const revealBlocks = document.querySelectorAll(".reveal-block");
let liveSearchTimer = null;
let requestCounter = 0;
let refreshStatusTimer = null;

form.addEventListener("submit", (event) => {
  event.preventDefault();
  state.query = queryInput.value.trim();
  state.page = 1;
  applyActiveChip(state.query);
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
  applyActiveChip(nextQuery);
  state.query = nextQuery;
  state.page = 1;

  if (liveSearchTimer) {
    clearTimeout(liveSearchTimer);
  }

  liveSearchTimer = setTimeout(() => {
    loadMovies();
  }, 250);
});

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const nextQuery = chip.dataset.query || "";
    queryInput.value = nextQuery;
    state.query = nextQuery;
    state.page = 1;
    applyActiveChip(nextQuery);
    loadMovies();
  });
});

if (themeToggle) {
  const persistedTheme = localStorage.getItem("movieAtlasTheme");
  setTheme(persistedTheme === "noir" ? "noir" : "sun");

  themeToggle.addEventListener("click", () => {
    const isNoir = document.body.dataset.theme === "noir";
    setTheme(isNoir ? "sun" : "noir");
  });
}

function setTheme(theme) {
  const isNoir = theme === "noir";
  document.body.dataset.theme = isNoir ? "noir" : "sun";
  localStorage.setItem("movieAtlasTheme", isNoir ? "noir" : "sun");
  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", isNoir ? "true" : "false");
    themeToggle.textContent = isNoir ? "Switch to Sun Mode" : "Switch to Noir Mode";
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

function applyActiveChip(query) {
  const normalized = query.toLowerCase();
  chips.forEach((chip) => {
    const chipQuery = (chip.dataset.query || "").toLowerCase();
    chip.classList.toggle("active", chipQuery === normalized && normalized.length > 0);
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

async function loadRefreshStatus() {
  if (!refreshStatusEl) {
    return;
  }

  try {
    const response = await fetch("/api/refresh-status");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    const status = (payload.status || "idle").toLowerCase();
    const upserted = Number(payload.lastUpserted || 0);

    if (status === "running") {
      refreshStatusEl.textContent = "Refresh status: running in background...";
      return;
    }
    if (status === "completed") {
      refreshStatusEl.textContent = `Refresh status: completed (upserted ${upserted} records).`;
      return;
    }
    if (status === "failed") {
      const detail = payload.message ? ` ${payload.message}` : "";
      refreshStatusEl.textContent = `Refresh status: failed.${detail}`;
      return;
    }

    refreshStatusEl.textContent = "Refresh status: idle.";
  } catch (error) {
    refreshStatusEl.textContent = `Refresh status: unavailable (${error.message}).`;
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
    sub.textContent = `${yearText} | Indexed from page ${movie.page}`;

    const fallbackPoster = buildFallbackPoster(movie.url);
    const posterUrl = movie.imageUrl && movie.imageUrl.trim() ? movie.imageUrl : fallbackPoster;
    if (poster) {
      poster.src = posterUrl;
      poster.alt = `${movie.title} poster`;
      poster.addEventListener("error", () => {
        poster.src = fallbackPoster;
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

function renderMeta() {
  const shownText = state.query ? ` for "${state.query}"` : "";
  const pageText = state.totalPages === 0 ? "0" : String(state.page);
  meta.textContent = `${state.total} result${state.total === 1 ? "" : "s"}${shownText}. Page ${pageText} of ${state.totalPages}.`;
}

function syncPager() {
  pageLabel.textContent = state.totalPages === 0 ? "Page 0" : `Page ${state.page}`;
  prevBtn.disabled = state.page <= 1;
  nextBtn.disabled = state.page >= state.totalPages;
  if (kpiTotal) {
    kpiTotal.textContent = String(state.total);
  }
  if (kpiPage) {
    kpiPage.textContent = state.totalPages === 0 ? "0" : String(state.page);
  }
  if (kpiPages) {
    kpiPages.textContent = String(state.totalPages);
  }
}

loadMovies();
loadRefreshStatus();
refreshStatusTimer = setInterval(loadRefreshStatus, 5000);
initReveal();
