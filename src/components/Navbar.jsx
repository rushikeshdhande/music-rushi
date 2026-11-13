// src/components/Navbar.jsx
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useSyncStore } from "../lib/syncStore";

const Icons = {
  // Apple-style Music Logo
  Logo: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
    </svg>
  ),
  Search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Home: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Songs: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  ),
  Albums: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  // ✅ NEW — Music Videos icon
  Video: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none" />
    </svg>
  ),
  Menu: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  Close: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  // Blue User Profile Icon
  User: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="#0A84FF">
      <circle cx="12" cy="12" r="10" fill="#0A84FF" />
      <path
        d="M12 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V18h14v-1.5c0-2.33-4.67-3.5-7-3.5z"
        fill="#fff"
      />
    </svg>
  ),
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

  // Lock scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const pinnedIds = Object.keys(pins).filter((id) => pins[id]);

  return (
    <>
      <style>{`
        /* ================= MOBILE HEADER ================= */
        .mobile-header {
          display: none; /* Hidden on desktop */
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 60px;
          background: rgba(20, 20, 20, 0.85); /* Dark glassy look */
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          z-index: 1050;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          color: #fff;
        }

        /* Header Buttons */
        .header-icon-btn {
          background: none;
          border: none;
          color: #fff;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
        }

        /* Apple Music Center Logo */
        .mobile-header-logo {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 19px;
          font-weight: 700;
          letter-spacing: -0.4px;
          color: #fff;
        }
        .mobile-header-logo svg {
          width: 20px;
          height: 20px;
          color: #fff;
          margin-bottom: 2px;
        }

        /* ================= DESKTOP SIDEBAR ================= */
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: var(--sidebar-width, 240px);
          background: var(--nav-bg, #18181b);
          display: flex;
          flex-direction: column;
          border-right: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
          z-index: 1000;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease;
          color: var(--text-main, #f5f5f7);
        }

        .navbar-header { padding: 20px 16px 12px; border-bottom: 1px solid var(--border-color); flex-shrink: 0; }
        .navbar-logo { display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
        .navbar-logo svg { color: var(--accent, #1db954); width: 22px; height: 22px; }

        .navbar-scroll { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 0 12px; }
        .navbar-scroll::-webkit-scrollbar { width: 6px; }
        .navbar-scroll::-webkit-scrollbar-thumb { background: var(--border-color, rgba(255, 255, 255, 0.1)); border-radius: 10px; }

        .nav-header { font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-muted, #a1a1aa); padding: 16px 12px 8px; letter-spacing: 0.5px; }
        .nav-section { list-style: none; padding: 0; margin: 0 0 16px 0; display: flex; flex-direction: column; gap: 2px; }

        .nav-item { display: flex; align-items: center; gap: 12px; padding: 8px 12px; border-radius: 8px; color: var(--text-main, #f5f5f7); text-decoration: none; font-size: 14px; font-weight: 500; transition: all 0.15s ease; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; background: none; border: none; width: 100%; cursor: pointer; text-align: left; }
        .nav-item svg { color: var(--text-muted, #a1a1aa); flex-shrink: 0; transition: color 0.15s ease; }
        .nav-item:hover { background: var(--hover-bg, rgba(255, 255, 255, 0.06)); }
        .nav-item:hover svg { color: var(--text-main, #fff); }
        .nav-item.active { background: var(--active-bg, rgba(255, 255, 255, 0.1)); font-weight: 600; }
        .nav-item.active svg { color: var(--accent, #1db954); }
        .nav-item-small { font-size: 13px; padding: 6px 12px; }
        .nav-art-placeholder { width: 20px; height: 20px; border-radius: 4px; background: var(--hover-bg, rgba(255, 255, 255, 0.08)); flex-shrink: 0; }

        /* Backdrop */
        .nav-backdrop {
          display: none; position: fixed; inset: 0; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); z-index: 999; opacity: 0; transition: opacity 0.3s ease;
        }

        body.on-album-details .navbar { background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }

        /* ================= RESPONSIVE ================= */
        @media (max-width: 768px) {
          /* Show header, hide desktop sidebar */
          .mobile-header { display: flex; }

          .navbar {
            transform: translateX(-100%);
            width: 280px;
            box-shadow: 10px 0 30px rgba(0, 0, 0, 0.5);
            z-index: 1100; /* Above header */
          }
          .navbar.navbar-open { transform: translateX(0); }

          /* Adjust desktop header inside drawer */
          .navbar-header { padding: 16px 16px 12px; }

          .nav-backdrop.show { display: block; opacity: 1; }

          .nav-item { padding: 12px; font-size: 15px; }
          .nav-item-small { padding: 10px 12px; font-size: 14px; }
        }

        @media (max-width: 380px) {
          .navbar { width: 260px; }
          .nav-item { padding: 10px 12px; font-size: 14px; }
        }
      `}</style>

      {/* ================= MOBILE TOP HEADER ================= */}
      <header className="mobile-header">
        <button
          className="header-icon-btn"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <Icons.Close /> : <Icons.Menu />}
        </button>

        <div className="mobile-header-logo">
          <Icons.Logo />
          <span>Music</span>
        </div>

        <button className="header-icon-btn" aria-label="Profile">
          <Icons.User />
        </button>
      </header>

      {/* ================= BACKDROP ================= */}
      <div
        className={`nav-backdrop ${isOpen ? "show" : ""}`}
        onClick={() => setIsOpen(false)}
      />

      {/* ================= SIDEBAR (Desktop & Mobile Drawer) ================= */}
      <aside
        className={`navbar ${isAlbumDetails ? "navbar-on-album" : ""} ${
          isOpen ? "navbar-open" : ""
        }`}
      >
        {/* Desktop Header (Hidden inside drawer on mobile) */}
        <header className="navbar-header">
          <div className="navbar-logo">
            <Icons.Logo />
            <span>Music</span>
          </div>
        </header>

        <div className="navbar-scroll">
          <ul className="nav-section">
            <li>
              <NavLink to="/" end className="nav-item">
                <Icons.Home /> Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/songs" className="nav-item">
                <Icons.Songs /> Songs
              </NavLink>
            </li>
            <li>
              <NavLink to="/albums" className="nav-item">
                <Icons.Albums /> Albums
              </NavLink>
            </li>
            {/* ✅ NEW — Music Videos link */}
            <li>
              <NavLink to="/music-videos" className="nav-item">
                <Icons.Video /> Music Videos
              </NavLink>
            </li>
            <li>
              <NavLink to="/search" className="nav-item">
                <Icons.Search /> Search
              </NavLink>
            </li>
          </ul>

          {pinnedIds.length > 0 && (
            <>
              <div className="nav-header">Pins</div>
              <ul className="nav-section">
                {pinnedIds.slice(0, 3).map((id) => (
                  <li key={id}>
                    <NavLink
                      to={`/song/${id}`}
                      className="nav-item nav-item-small"
                    >
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