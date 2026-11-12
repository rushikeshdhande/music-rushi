import React from "react";
import { usePlayer } from "../contexts/PlayerContext";
import { useSyncStore } from "../lib/syncStore";
import { ALL_SONGS } from "../data/remoteAlbums";
import { shareSong } from "../lib/shareUrl";

const Songs = () => {
  const { loadAndPlay, current } = usePlayer();
  const { favourites, toggleFavourite } = useSyncStore();

  return (
    <div className="page">
      <h1>Songs</h1>

      <button
        className="btn"
        onClick={() => loadAndPlay(ALL_SONGS, 0)}
        style={{ marginBottom: 16 }}
      >
        ▶ Play All
      </button>

      <div className="song-list">
        {ALL_SONGS.map((song, i) => (
          <div
            key={song.id}
            className={`song-row ${current?.id === song.id ? "active" : ""}`}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <img src={song.artwork} alt="" className="song-art" />
            <div
              className="song-info"
              onClick={() => loadAndPlay(ALL_SONGS, i)}
              style={{ cursor: "pointer" }}
            >
              <div className="song-title">{song.title}</div>
              <div className="song-artist">{song.artist}</div>
            </div>

            {/* ⭐ Favourite toggle */}
            <button
              className="icon-btn"
              onClick={() => toggleFavourite(song.id)}
              title={favourites[song.id] ? "Unfavourite" : "Favourite"}
            >
              {favourites[song.id] ? "★" : "☆"}
            </button>

            {/* 🔗 Share song */}
            <button
              className="icon-btn"
              onClick={() => shareSong(song)}
              title="Share song"
              style={{ color: "#007AFF" }}
            >
              ⤴
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Songs;