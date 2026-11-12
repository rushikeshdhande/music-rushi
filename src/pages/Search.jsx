import { useState } from "react";
import { ALL_SONGS } from "../data/remoteAlbums";
import { usePlayer } from "../contexts/PlayerContext";

export default function Search() {
  const [q, setQ] = useState("");
  const { loadAndPlay, current } = usePlayer();
  const results = q.trim()
    ? ALL_SONGS.filter((s) => `${s.title} ${s.artist} ${s.album}`.toLowerCase().includes(q.toLowerCase()))
    : [];
  return (
    <div className="page">
      <h1>Search</h1>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Songs, artists, albums" className="search-input" />
      {results.map((s, i) => (
        <div key={s.id} className={`song-row ${current?.id === s.id ? "active" : ""}`} onClick={() => loadAndPlay(results, i)}>
          <img src={s.artwork} alt="" className="song-art" />
          <div className="song-info">
            <div className="song-title">{s.title}</div>
            <div className="song-artist">{s.artist}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
