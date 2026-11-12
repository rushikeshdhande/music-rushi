import { useParams } from "react-router-dom";
import { useSyncStore } from "../lib/syncStore";
import { usePlayer } from "../contexts/PlayerContext";

export default function PlaylistDetails() {
  const { id } = useParams();
  const { playlists } = useSyncStore();
  const { loadAndPlay } = usePlayer();
  const pl = playlists.find((p) => p.id === id);
  if (!pl) return <div className="page">Playlist not found</div>;
  return (
    <div className="page">
      <h1>{pl.name}</h1>
      <button className="btn" onClick={() => loadAndPlay(pl.songs || [], 0)}>▶ Play All</button>
      {(pl.songs || []).map((s, i) => (
        <div key={s.id + i} className="song-row" onClick={() => loadAndPlay(pl.songs, i)}>
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
