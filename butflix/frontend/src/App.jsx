import { Navigate, Route, Routes } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import { BrowsePage } from "./pages/BrowsePage";
import { HistoryPage } from "./pages/HistoryPage";
import { WatchPage } from "./pages/WatchPage";

function App() {
  return (
    <div className="app-shell">
      <NavBar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<BrowsePage />} />
          <Route path="/watch/:id" element={<WatchPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="site-footer">
        <p className="site-footer__copy">
          &copy; {new Date().getFullYear()} Butflix &mdash; Crafted by{" "}
          <span className="site-footer__ash">ASH</span>{" "}
          <a
            className="site-footer__link"
            href="https://github.com/Ashly1987"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
