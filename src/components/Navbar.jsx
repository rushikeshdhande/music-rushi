// src/components/Navbar.jsx
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useSyncStore } from "../lib/syncStore";

const APP_URL = "#"; // ← put your app / store link here (the white "App" pill)

/* ── Icons ────────────────────────────────────────────────────── */
const S = ({ size = 18, sw = 2, fill = "none", children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const Icons = {
  Logo: () => (
    <S size={24} sw={0} fill="currentColor">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
    </S>
  ),
  Search: () => (<S><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></S>),
  Home: () => (<S><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></S>),
  Songs: () => (<S><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></S>),
  Albums: () => (<S><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></S>),
  Video: () => (<S><rect x="2" y="6" width="20" height="12" rx="2" /><path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none" /></S>),
  Menu: () => (
    <S size={32} sw={2.2}>
      <line x1="3" y1="7" x2="21" y2="7" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="17" x2="21" y2="17" />
    </S>
  ),
  Close: () => (<S size={28} sw={2.2}><line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" /></S>),
};

const LINKS = [
  { to: "/", label: "Home", Icon: Icons.Home, end: true },
  { to: "/songs", label: "Songs", Icon: Icons.Songs },
  { to: "/albums", label: "Albums", Icon: Icons.Albums },
  { to: "/music-videos", label: "Music Videos", Icon: Icons.Video },
  { to: "/search", label: "Search", Icon: Icons.Search },
];

export default function Navbar() {
  const location = useLocation();
  const pins = useSyncStore((s) => s.pins || {});
  const [isOpen, setIsOpen] = useState(false);

  const isAlbumDetails = ["/album/", "/albums/", "/in/album/"].some((p) => location.pathname.startsWith(p));

  // Close the menu when the page changes
  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle("on-album-details", isAlbumDetails);
    return () => document.body.classList.remove("on-album-details");
  }, [isAlbumDetails]);

  // Lock page scroll while the menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const pinnedIds = Object.keys(pins).filter((id) => pins[id]);

  return (
    <>
      <style>{`
        /* ============ MOBILE HEADER: ☰ · Music · App ============ */
        .mobile-header {
          display: none;
          position: fixed; top: 0; left: 0; right: 0; height: 60px; padding: 0 14px;
          grid-template-columns: 1fr auto 1fr; align-items: center;
          background: var(--album-navbar, #35145a); color: #fff;
          z-index: 1200; transition: background 0.25s ease;
        }
        .mobile-header.open { background: transparent; }
        .header-icon-btn { display: flex; align-items: center; justify-content: flex-start; width: 40px; height: 40px; padding: 0; background: none; border: 0; color: #fff; cursor: pointer; }
        .mobile-header-logo { font-size: 25px; font-weight: 800; letter-spacing: -0.5px; }
        .app-btn {
          justify-self: end; display: flex; align-items: center; height: 28px; padding: 0 16px;
          border-radius: 999px; background: #fff; color: var(--album-navbar, #35145a);
          font-size: 16px; font-weight: 700; text-decoration: none;
        }

        /* ============ DESKTOP SIDEBAR ============ */
        .navbar {
          position: fixed; top: 0; left: 0; bottom: 0; width: var(--sidebar-width, 240px);
          display: flex; flex-direction: column;
          background: var(--nav-bg, #18181b); color: var(--text-main, #f5f5f7);
          border-right: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
          z-index: 1000; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease;
        }
        .navbar-header { padding: 20px 16px 12px; border-bottom: 1px solid var(--border-color); flex-shrink: 0; }
        .navbar-logo { display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
        .navbar-logo svg { color: var(--accent, #1db954); width: 22px; height: 22px; }
        .navbar-scroll { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 0 12px; }
        .navbar-scroll::-webkit-scrollbar { width: 6px; }
        .navbar-scroll::-webkit-scrollbar-thumb { background: var(--border-color, rgba(255, 255, 255, 0.1)); border-radius: 10px; }
        .nav-header { font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-muted, #a1a1aa); padding: 16px 12px 8px; letter-spacing: 0.5px; }
        .nav-section { list-style: none; padding: 0; margin: 0 0 16px; display: flex; flex-direction: column; gap: 2px; }
        .nav-item {
          display: flex; align-items: center; gap: 12px; width: 100%; padding: 8px 12px; border: none; border-radius: 8px;
          background: none; color: var(--text-main, #f5f5f7); text-decoration: none; text-align: left; cursor: pointer;
          font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: all 0.15s ease;
        }
        .nav-item svg { color: var(--text-muted, #a1a1aa); flex-shrink: 0; transition: color 0.15s ease; }
        .nav-item:hover { background: var(--hover-bg, rgba(255, 255, 255, 0.06)); }
        .nav-item:hover svg { color: var(--text-main, #fff); }
        .nav-item.active { background: var(--active-bg, rgba(255, 255, 255, 0.1)); font-weight: 600; }
        .nav-item.active svg { color: var(--accent, #1db954); }
        .nav-item-small { font-size: 13px; padding: 6px 12px; }
        .nav-art-placeholder { width: 20px; height: 20px; border-radius: 4px; background: var(--hover-bg, rgba(255, 255, 255, 0.08)); flex-shrink: 0; }

        body.on-album-details .navbar { background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }

        /* ============ MOBILE: full-screen frosted menu ============ */
        @media (max-width: 768px) {
          .mobile-header { display: grid; }

          .navbar, body.on-album-details .navbar {
            width: 100%; border: 0; box-shadow: none; transform: none; z-index: 1100;
            background: linear-gradient(rgba(53, 20, 90, 0.95) 0, rgba(53, 20, 90, 0.6) 150px, rgba(30, 22, 58, 0.5) 100%);
            backdrop-filter: blur(40px) saturate(1.4); -webkit-backdrop-filter: blur(40px) saturate(1.4);
            opacity: 0; visibility: hidden; transition: opacity 0.25s ease, visibility 0.25s;
          }
          .navbar.navbar-open { opacity: 1; visibility: visible; }

          .navbar-header { display: none; }
          .navbar-scroll { padding: 72px 16px 0; }
          .navbar-scroll > .nav-section:first-child { padding-bottom: 20px; margin-bottom: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.12); }
          .nav-section { gap: 5px; }

          .nav-item { height: 43px; padding: 0 8px; gap: 10px; border-radius: 14px; font-size: 21px; font-weight: 400; color: #f2f2f7; }
          .nav-item svg, .nav-item:hover svg, .nav-item.active svg { width: 26px; height: 26px; color: #4cb8ea; }
          .nav-item.active { background: rgba(255, 255, 255, 0.14); font-weight: 700; }
          .nav-item-small { height: 38px; font-size: 16px; }
        }
      `}</style>

      {/* ============ MOBILE HEADER ============ */}
      <header className={`mobile-header ${isOpen ? "open" : ""}`}>
        <button className="header-icon-btn" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
          {isOpen ? <Icons.Close /> : <Icons.Menu />}
        </button>
        <div className="mobile-header-logo">Music</div>
        {!isOpen && <a className="app-btn" href={APP_URL}>App</a>}
      </header>

      {/* ============ SIDEBAR (desktop) / FULL-SCREEN MENU (mobile) ============ */}
      <aside className={`navbar ${isAlbumDetails ? "navbar-on-album" : ""} ${isOpen ? "navbar-open" : ""}`}>
        <header className="navbar-header">
          <div className="navbar-logo"><Icons.Logo /><span>Music</span></div>
        </header>

        <div className="navbar-scroll">
          <ul className="nav-section">
            {LINKS.map(({ to, label, Icon, end }) => (
              <li key={to}>
                <NavLink to={to} end={end} className="nav-item"><Icon /> {label}</NavLink>
              </li>
            ))}
          </ul>

          {pinnedIds.length > 0 && (
            <>
              <div className="nav-header">Pins</div>
              <ul className="nav-section">
                {pinnedIds.slice(0, 3).map((id) => (
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
