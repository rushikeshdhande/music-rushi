import { NavLink } from "react-router-dom";
import "./Navbar.css";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/library", label: "Library" },
  { to: "/songs", label: "Songs" },
  { to: "/albums", label: "Albums" },
  { to: "/artists", label: "Artists" },
  { to: "/favourites", label: "Favourite Songs" },
  { to: "/playlists", label: "Playlists" },
  { to: "/videos", label: "Music Videos" },
  { to: "/search", label: "Search" },
];

export default function Navbar() {
  return (
    <aside className="navbar">
      <div className="navbar-logo">🎵 music</div>
      <nav className="navbar-scroll">
        <ul className="nav-list">
          {LINKS.map((l) => (
            <li key={l.to}>
              <NavLink to={l.to} end className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="navbar-footer">Rushikesh</div>
    </aside>
  );
}
