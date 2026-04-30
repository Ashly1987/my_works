const reportTodayEl = document.querySelector("#report-today");
const reportTotalEl = document.querySelector("#report-total");
const report7El = document.querySelector("#report-7");
const report14El = document.querySelector("#report-14");
const report30El = document.querySelector("#report-30");
const reportTableEl = document.querySelector("#report-table");

const VIEWS_KEY = "playimdb-view-recorder";
const FIREBASE_VIEWS_COLLECTION = "quickflixViews";
const FIREBASE_SDK_VERSION = "12.12.1";

const getDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const hasFirebaseConfig = () => {
  const config = window.QUICKFLIX_FIREBASE_CONFIG;
  return Boolean(config?.apiKey && config?.projectId && config?.appId);
};

const readLocalViews = () => {
  try {
    const savedViews = JSON.parse(localStorage.getItem(VIEWS_KEY));
    return savedViews && typeof savedViews === "object" ? savedViews : {};
  } catch (error) {
    return {};
  }
};

const readFirebaseViews = async () => {
  const [firebaseApp, firestore] = await Promise.all([
    import(`https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-firestore.js`),
  ]);
  const app = firebaseApp.initializeApp(window.QUICKFLIX_FIREBASE_CONFIG);
  const db = firestore.getFirestore(app);
  const snapshot = await firestore.getDocs(firestore.collection(db, FIREBASE_VIEWS_COLLECTION));

  return snapshot.docs.reduce((views, viewDoc) => {
    const { count } = viewDoc.data();
    views[viewDoc.id] = Number.isFinite(count) ? count : 0;
    return views;
  }, {});
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

const renderTable = (views) => {
  const today = new Date();
  const rows = [];

  for (let index = 0; index < 30; index += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - index);
    const key = getDateKey(date);
    rows.push(`
      <div class="report-table__row">
        <span>${key}</span>
        <strong>${views[key] || 0}</strong>
      </div>
    `);
  }

  reportTableEl.innerHTML = rows.join("");
};

const renderReport = async () => {
  let views = {};

  try {
    views = hasFirebaseConfig() ? await readFirebaseViews() : readLocalViews();
  } catch (error) {
    views = readLocalViews();
  }

  reportTodayEl.textContent = views[getDateKey()] || 0;
  reportTotalEl.textContent = getTotalViews(views);
  report7El.textContent = getWindowViews(views, 7);
  report14El.textContent = getWindowViews(views, 14);
  report30El.textContent = getWindowViews(views, 30);
  renderTable(views);
};

renderReport();
