import { ALL_SONGS } from "../data/remoteAlbums";
import { usePlayer } from "../contexts/PlayerContext";
import { useSyncStore } from "../lib/syncStore";

export default function Favourites() {
  const { favourites, toggleFavourite } = useSyncStore();
  const { loadAndPlay, current } = usePlayer();
  const favSongs = ALL_SONGS.filter((s) => favourites[s.id]);
  return (
    <div className="page">
      <h1>Favourite Songs</h1>
      {favSongs.length === 0 ? <p>No favourites yet.</p> : (
        <>
          <button className="btn" onClick={() => loadAndPlay(favSongs, 0)}>▶ Play All</button>
          {favSongs.map((s, i) => (
            <div key={s.id} className={`song-row ${current?.id === s.id ? "active" : ""}`}>
              <img src={s.artwork} alt="" className="song-art" />
              <div className="song-info" onClick={() => loadAndPlay(favSongs, i)}>
                <div className="song-title">{s.title}</div>
                <div className="song-artist">{s.artist}</div>
              </div>
              <button className="icon-btn" onClick={() => toggleFavourite(s.id)}>★</button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
