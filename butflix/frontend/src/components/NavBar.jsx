import { Link, NavLink } from "react-router-dom";

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
        <NavLink
          to="/"
          className={({ isActive }) =>
            `nav__link${isActive ? " is-active" : ""}`
          }
        >
          Browse
        </NavLink>
        <NavLink
          to="/history"
          className={({ isActive }) =>
            `nav__link${isActive ? " is-active" : ""}`
          }
        >
          History
        </NavLink>
      </nav>
      <div className="nav__status">Guest Mode</div>
    </header>
  );
}
