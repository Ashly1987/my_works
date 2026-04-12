const THEMES = ["sun", "noir", "aurora", "sepia"];
const persistedTheme = localStorage.getItem("movieAtlasTheme");
document.documentElement.dataset.theme = THEMES.includes(persistedTheme) ? persistedTheme : "aurora";

const reportMeta = document.getElementById("report-meta");
const reportList = document.getElementById("views-report-list");
const filterButtons = document.querySelectorAll(".report-filter");
let activeDays = 7;

async function loadViewReport(days) {
  try {
    const response = await fetch(`/api/view-stats?days=${days}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    renderReport(payload.report || []);
    reportMeta.textContent = `Showing last ${days} days | Today: ${formatCount(payload.todayViews)} views | Total: ${formatCount(payload.totalViews)} views`;
  } catch (error) {
    reportMeta.textContent = `Could not load report: ${error.message}`;
    reportList.innerHTML = '<li class="views-report-empty">Report unavailable right now.</li>';
  }
}

function bindFilters() {
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const days = Number(button.dataset.days);
      if (!days || days === activeDays) {
        return;
      }

      activeDays = days;
      filterButtons.forEach((item) => item.classList.toggle("active", item === button));
      loadViewReport(activeDays);
    });
  });
}

function renderReport(items) {
  reportList.innerHTML = "";

  if (!items.length) {
    reportList.innerHTML = '<li class="views-report-empty">No view data recorded yet.</li>';
    return;
  }

  items.forEach((entry) => {
    const row = document.createElement("li");
    row.className = "views-report-row";

    const day = document.createElement("span");
    day.className = "views-report-day";
    day.textContent = entry.day;

    const count = document.createElement("span");
    count.className = "views-report-count";
    count.textContent = `${formatCount(entry.views)} views`;

    row.append(day, count);
    reportList.appendChild(row);
  });
}

function formatCount(value) {
  return new Intl.NumberFormat().format(Number(value) || 0);
}

bindFilters();
loadViewReport(activeDays);
