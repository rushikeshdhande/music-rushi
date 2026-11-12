import { Link } from "react-router-dom";

export default function Library() {
  return (
    <div className="page">
      <h1>Library</h1>
      <div className="library-grid">
        <Link to="/songs" className="lib-card">🎵<br />Songs</Link>
        <Link to="/albums" className="lib-card">💿<br />Albums</Link>
        <Link to="/artists" className="lib-card">🎤<br />Artists</Link>
        <Link to="/favourites" className="lib-card">⭐<br />Favourites</Link>
        <Link to="/playlists" className="lib-card">📋<br />Playlists</Link>
        <Link to="/videos" className="lib-card">📺<br />Music Videos</Link>
      </div>
    </div>
  );
}
