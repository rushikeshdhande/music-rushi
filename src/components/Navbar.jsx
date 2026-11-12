import { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useSyncStore } from "../lib/syncStore";
import "./Navbar.css";

// Minimal SVG Icons to match Apple Music style
const Icons = {
  Logo: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
    </svg>
  ),
  Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Home: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  New: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>,
  Radio: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>,
  Songs: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  Albums: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>,
  Artists: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Playlist: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  User: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
};

export default function Navbar() {
  const location = useLocation();
  const playlists = useSyncStore((s) => s.playlists || []);
  const recent = useSyncStore((s) => s.recent || []);
  const pins = useSyncStore((s) => s.pins || {});

  const isAlbumDetails =
    location.pathname.startsWith("/album/") ||
    location.pathname.startsWith("/albums/") ||
    location.pathname.startsWith("/in/album/");

  useEffect(() => {
    document.body.classList.toggle("on-album-details", isAlbumDetails);
    return () => document.body.classList.remove("on-album-details");
  }, [isAlbumDetails]);

  // Get pinned songs (just IDs in this example)
  const pinnedIds = Object.keys(pins).filter(id => pins[id]);

  return (
    <aside className={`navbar ${isAlbumDetails ? "navbar-on-album" : ""}`}>
      <div className="navbar-logo">
        <Icons.Logo />
        <span>music</span>
      </div>

      <div className="navbar-scroll">
        {/* Main Nav */}
        <ul className="nav-section">
          <li><NavLink to="/search" className="nav-item"><Icons.Search /> Search</NavLink></li>
          <li><NavLink to="/" end className="nav-item"><Icons.Home /> Home</NavLink></li>
          <li><NavLink to="/videos" className="nav-item"><Icons.New /> New</NavLink></li>
          <li><NavLink to="/radio" className="nav-item"><Icons.Radio /> Radio</NavLink></li>
        </ul>

        {/* Library Section */}
        <div className="nav-header">Library</div>
        <ul className="nav-section">
          <li><NavLink to="/songs" className="nav-item"><Icons.Songs /> Songs</NavLink></li>
          <li><NavLink to="/albums" className="nav-item"><Icons.Albums /> Albums</NavLink></li>
          <li><NavLink to="/artists" className="nav-item"><Icons.Artists /> Artists</NavLink></li>
          <li><NavLink to="/favourites" className="nav-item"><Icons.Playlist /> Favourite Songs</NavLink></li>
          <li><NavLink to="/library" className="nav-item"><Icons.Albums /> Recently Added</NavLink></li>
        </ul>

        {/* Pins / Pinned Songs Section */}
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

        {/* Playlists Section */}
        <div className="nav-header">Playlists</div>
        <ul className="nav-section">
          {/* Static default playlists */}
          <li><NavLink to="/playlists/all" className="nav-item"><Icons.Playlist /> All Playlists</NavLink></li>
          
          {/* User Created Playlists */}
          {playlists.map((pl) => (
            <li key={pl.id}>
              <NavLink to={`/playlist/${pl.id}`} className="nav-item nav-item-small">
                {/* Use a generic icon or the first song's artwork if available */}
                <div className="nav-art-placeholder small">
                  {pl.songs && pl.songs.length > 0 && pl.songs[0].artwork ? (
                     <img src={pl.songs[0].artwork} alt="" />
                  ) : null}
                </div>
                {pl.name || "Untitled Playlist"}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom Profile Section (Sticky to bottom left) */}
      <div className="navbar-bottom">
        <button className="nav-item user-profile">
          <Icons.User />
          <span>Rushikesh</span>
        </button>
      </div>
    </aside>
  );
}