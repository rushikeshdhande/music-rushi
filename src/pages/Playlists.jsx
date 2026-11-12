import { useState } from "react";
import { Link } from "react-router-dom";
import { useSyncStore } from "../lib/syncStore";

export default function Playlists() {
  const { playlists, addPlaylist } = useSyncStore();
  const [name, setName] = useState("");
  const create = () => {
    if (!name.trim()) return;
    addPlaylist({ id: `pl_${Date.now()}`, name: name.trim(), songs: [] });
    setName("");
  };
  return (
    <div className="page">
      <h1>Playlists</h1>
      <div className="create-bar">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New playlist" />
        <button className="btn" onClick={create}>Create</button>
      </div>
      <div className="grid">
        {playlists.map((p) => (
          <Link key={p.id} to={`/playlists/${p.id}`} className="card">
            <div className="circle-placeholder">📋</div>
            <div className="card-title">{p.name}</div>
            <div className="card-sub">{p.songs?.length || 0} songs</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
