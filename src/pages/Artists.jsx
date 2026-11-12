import { Link } from "react-router-dom";
import { ALL_SONGS } from "../data/remoteAlbums";

export default function Artists() {
  const artists = [...new Set(ALL_SONGS.map((s) => s.artist))].filter(Boolean);
  return (
    <div className="page">
      <h1>Artists</h1>
      <div className="grid">
        {artists.map((a) => (
          <Link key={a} to={`/artists/${encodeURIComponent(a)}`} className="card">
            <div className="circle-placeholder">🎤</div>
            <div className="card-title">{a}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
