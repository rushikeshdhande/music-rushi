import React from "react";
import { useParams, Link } from "react-router-dom";
import { REMOTE_ALBUMS } from "../data/remoteAlbums";
import { usePlayer } from "../contexts/PlayerContext";
import { useSyncStore } from "../lib/syncStore";
import { shareSong, shareAlbum } from "../lib/shareUrl";

const AlbumDetails = () => {
  const { slug, id, albumName } = useParams();
  const { loadAndPlay, current } = usePlayer();
  const { favourites, toggleFavourite } = useSyncStore();

  // Support BOTH old (/albums/:albumName) and new (/in/album/:slug/:id) routes
  const album = id
    ? REMOTE_ALBUMS.find((a) => String(a.numericId) === String(id))
    : REMOTE_ALBUMS.find((a) => a.name === decodeURIComponent(albumName || ""));

  if (!album) {
    return (
      <div className="page" style={{ textAlign: "center", paddingTop: 80 }}>
        <h1>Album not found</h1>
        <Link to="/albums" className="btn" style={{ marginTop: 16 }}>
          Back to Albums
        </Link>
      </div>
    );
  }

  return (
    <div className="page album-details-page">
      {/* HERO with big cover */}
      <div className="album-hero">
        <img
          src={album.artwork}
          alt={album.name}
          className="album-hero-art"
        />
        <div className="album-hero-info">
          <p className="album-kicker">ALBUM</p>
          <h1 className="album-title">{album.name}</h1>
          <p className="album-artist">{album.artist}</p>
          <p className="album-meta">
            {album.songs?.length || 0}{" "}
            {album.songs?.length === 1 ? "song" : "songs"}
          </p>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button
              className="btn album-play-btn"
              onClick={() => loadAndPlay(album.songs, 0)}
            >
              ▶ Preview
            </button>

            {/* 🔗 Share Album — top-of-page option */}
            <button
              className="btn"
              onClick={() => shareAlbum(album)}
              style={{
                background: "#f0f0f0",
                color: "#111",
                padding: "12px 20px",
              }}
              title="Share album"
            >
              ⤴ Share Album
            </button>
          </div>
        </div>
      </div>

      {/* TRACKLIST */}
      <div className="album-tracks">
        {album.songs.map((s, i) => {
          const isActive = current?.id === s.id;
          const isFav = !!favourites[s.id];
          return (
            <div
              key={s.id}
              className={`song-row album-track ${isActive ? "active" : ""}`}
            >
              <span className="track-num">{i + 1}</span>
              <img
                src={s.artwork}
                alt=""
                className="song-art"
                onClick={() => loadAndPlay(album.songs, i)}
                style={{ cursor: "pointer" }}
              />
              <div
                className="song-info"
                onClick={() => loadAndPlay(album.songs, i)}
                style={{ cursor: "pointer" }}
              >
                <div className="song-title">{s.title}</div>
                <div className="song-artist">{s.artist}</div>
              </div>
              <button
                className="icon-btn"
                onClick={() => toggleFavourite(s.id)}
                title={isFav ? "Unfavourite" : "Favourite"}
              >
                {isFav ? "★" : "☆"}
              </button>
              <button
                className="icon-btn"
                onClick={() => shareSong(s)}
                title="Share song"
                style={{ color: "#007AFF" }}
              >
                ⤴
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AlbumDetails;