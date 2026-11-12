import { useParams } from "react-router-dom";
import { ALL_SONGS } from "../data/remoteAlbums";
import { usePlayer } from "../contexts/PlayerContext";

export default function ArtistDetails() {
  const { artistName } = useParams();
  const artist = decodeURIComponent(artistName);
  const songs = ALL_SONGS.filter((s) => s.artist === artist);
  const { loadAndPlay } = usePlayer();
  return (
    <div className="page">
      <h1>{artist}</h1>
      <button className="btn" onClick={() => loadAndPlay(songs, 0)}>▶ Play All</button>
      {songs.map((s, i) => (
        <div key={s.id} className="song-row" onClick={() => loadAndPlay(songs, i)}>
          <img src={s.artwork} alt="" className="song-art" />
          <div className="song-info"><div className="song-title">{s.title}</div></div>
        </div>
      ))}
    </div>
  );
}
