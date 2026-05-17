const reportTodayEl = document.querySelector("#report-today");
const reportTotalEl = document.querySelector("#report-total");
const report7El = document.querySelector("#report-7");
const report14El = document.querySelector("#report-14");
const report30El = document.querySelector("#report-30");
const reportTableEl = document.querySelector("#report-table");

const renderTable = (data) => {
  const allDailyViews = data.allDailyViews || {};
  const today = new Date();
  
  let tableHtml = `
    <h2>Daily Breakdown & Locations</h2>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Views</th>
          <th>Top Locations (Count)</th>
        </tr>
      </thead>
      <tbody>
  `;

  // Show last 30 days in the table
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    
    if (allDailyViews[key]) {
      const views = allDailyViews[key].count || 0;
      const locations = allDailyViews[key].locations || {};
      
      let locationsHtml = "";
      const sortedLocations = Object.entries(locations).sort((a, b) => b[1] - a[1]);
      
      sortedLocations.forEach(([loc, count]) => {
        locationsHtml += `
          <div class="location-item">
            <span>${loc}</span>
            <strong>${count}</strong>
          </div>
        `;
      });

      tableHtml += `
        <tr>
          <td>${key}</td>
          <td><strong>${views}</strong></td>
          <td>${locationsHtml || '<span style="color: #7c746a;">No location data</span>'}</td>
        </tr>
      `;
    }
  }

  tableHtml += `
      </tbody>
    </table>
  `;

  reportTableEl.innerHTML = tableHtml;
};

const renderReport = async () => {
  try {
    const response = await fetch("/api/get-view-reports");
    const data = await response.json();

    if (data) {
      reportTodayEl.textContent = data.today || 0;
      reportTotalEl.textContent = data.total || 0;
      report7El.textContent = data.days7 ? data.days7.count : 0;
      report14El.textContent = data.days14 ? data.days14.count : 0;
      report30El.textContent = data.days30 ? data.days30.count : 0;
      
      renderTable(data);
    }
  } catch (error) {
    console.error("Error fetching view reports:", error);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  renderReport();
});