import React from "react";
import { Link } from "react-router-dom";
import { REMOTE_ALBUMS, ALL_SONGS } from "../data/remoteAlbums";
import { usePlayer } from "../contexts/PlayerContext";
import { useSyncStore } from "../lib/syncStore";
import { shareSong } from "../lib/shareUrl";

const Home = () => {
  const { loadAndPlay } = usePlayer();
  const { recent, counts } = useSyncStore();

  const topPicks = ALL_SONGS
    .filter((s) => counts[s.id])
    .sort((a, b) => (counts[b.id] || 0) - (counts[a.id] || 0))
    .slice(0, 10);

  const recentlyPlayed = recent
    .map((id) => ALL_SONGS.find((s) => s.id === id))
    .filter(Boolean)
    .slice(0, 10);

  const SongCard = ({ song }) => (
    <div
      className="card"
      style={{ position: "relative", cursor: "pointer" }}
      onClick={() => loadAndPlay(ALL_SONGS, ALL_SONGS.indexOf(song))}
    >
      <img src={song.artwork} alt="" />
      <div className="card-title">{song.title}</div>
      <div className="card-sub">{song.artist}</div>

      {/* 🔗 Small share button top-right */}
      <button
        className="icon-btn"
        onClick={(e) => {
          e.stopPropagation();
          shareSong(song);
        }}
        title="Share song"
        style={{
          position: "absolute",
          top: 6,
          right: 6,
          background: "rgba(0,0,0,0.55)",
          color: "#fff",
          borderRadius: "50%",
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          padding: 0,
          border: "none",
        }}
      >
        ⤴
      </button>
    </div>
  );

  return (
    <div className="page">
      <h1>Home</h1>

      <h2>Top Picks for You</h2>
      <div className="row">
        {(topPicks.length ? topPicks : ALL_SONGS).map((song) => (
          <SongCard key={song.id} song={song} />
        ))}
      </div>

      <h2>Albums</h2>
      <div className="row">
        {REMOTE_ALBUMS.map((album) => (
          <Link
            key={album.id}
            to={`/albums/${encodeURIComponent(album.name)}`}
            className="card"
          >
            <img src={album.artwork} alt="" />
            <div className="card-title">{album.name}</div>
            <div className="card-sub">{album.artist}</div>
          </Link>
        ))}
      </div>

      {recentlyPlayed.length > 0 && (
        <>
          <h2>Recently Played</h2>
          <div className="row">
            {recentlyPlayed.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Home;