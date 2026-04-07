import { Link } from "react-router-dom";

export function NavBar() {
  return (
    <header className="nav">
      <div className="nav__brand-block">
        <span className="nav__eyebrow">Screening Room</span>
        <Link to="/" className="nav__brand">
          Butflix
        </Link>
      </div>
      <nav className="nav__links">
        <Link to="/">Browse</Link>
        <Link to="/history">History</Link>
      </nav>
      <div className="nav__status">Guest Mode</div>
    </header>
  );
}
