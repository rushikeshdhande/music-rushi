import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useSyncStore } from "../lib/syncStore";
import "./Navbar.css";

const Icons = {
  Logo: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
    </svg>
  ),
  Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Home: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Songs: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  Albums: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>,
  Artists: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  User: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>,
  Menu: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  Close: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
};

export default function Navbar() {
  const location = useLocation();
  const pins = useSyncStore((s) => s.pins || {});

  const [isOpen, setIsOpen] = useState(false);

  const isAlbumDetails =
    location.pathname.startsWith("/album/") ||
    location.pathname.startsWith("/albums/") ||
    location.pathname.startsWith("/in/album/");

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle("on-album-details", isAlbumDetails);
    return () => document.body.classList.remove("on-album-details");
  }, [isAlbumDetails]);

  const pinnedIds = Object.keys(pins).filter(id => pins[id]);

  return (
    <>
      <button className="mobile-menu-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <Icons.Close /> : <Icons.Menu />}
      </button>

      <div className={`nav-backdrop ${isOpen ? "show" : ""}`} onClick={() => setIsOpen(false)} />

      <aside className={`navbar ${isAlbumDetails ? "navbar-on-album" : ""} ${isOpen ? "navbar-open" : ""}`}>
        <div className="navbar-logo">
          <Icons.Logo />
          <span>music</span>
        </div>

        <div className="navbar-scroll">
          <ul className="nav-section">
            <li><NavLink to="/search" className="nav-item"><Icons.Search /> Search</NavLink></li>
            <li><NavLink to="/" end className="nav-item"><Icons.Home /> Home</NavLink></li>
          </ul>

          <div className="nav-header">Library</div>
          <ul className="nav-section">
            <li><NavLink to="/songs" className="nav-item"><Icons.Songs /> Songs</NavLink></li>
            <li><NavLink to="/albums" className="nav-item"><Icons.Albums /> Albums</NavLink></li>
            <li><NavLink to="/artists" className="nav-item"><Icons.Artists /> Artists</NavLink></li>
          </ul>

          {pinnedIds.length > 0 && (
            <>
              <div className="nav-header">Pins</div>
              <ul className="nav-section">
                {pinnedIds.slice(0, 3).map(id => (
                  <li key={id}>
                    <NavLink to={`/song/${id}`} className="nav-item nav-item-small">
                      <div className="nav-art-placeholder" />
                      Pinned Track
                    </NavLink>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        
      </aside>
    </>
  );
}