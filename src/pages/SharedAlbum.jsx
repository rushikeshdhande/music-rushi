import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { findAlbumByNumericId } from "../data/remoteAlbums";
import { usePlayer } from "../contexts/PlayerContext";

const APP_PACKAGE = "com.netease.cloudmusic";

export default function SharedAlbum() {
  const { id, slug } = useParams();
  const { loadAndPlay, current } = usePlayer();
  const [album, setAlbum] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const found = findAlbumByNumericId(id);
    if (found) setAlbum(found);
    else setNotFound(true);
  }, [id]);

  useEffect(() => {
    if (!album) return;
    const isMobile = /android|iphone|ipad/i.test(navigator.userAgent);
    if (!isMobile) return;
    const androidIntent =
      `intent://music-rushi.vercel.app/in/album/${slug}/${id}` +
      `#Intent;scheme=https;package=${APP_PACKAGE};` +
      `S.browser_fallback_url=${encodeURIComponent(window.location.href)};end`;
    const t = setTimeout(() => {
      try { window.location.href = androidIntent; } catch {}
    }, 400);
    return () => clearTimeout(t);
  }, [album, id, slug]);

  if (notFound) {
    return (
      <div className="page" style={{ textAlign: "center", paddingTop: 80 }}>
        <h1>Album not found</h1>
        <Link to="/" className="btn">Go to Home</Link>
      </div>
    );
  }
  if (!album) return <div className="page">Loading…</div>;

  const androidIntent =
    `intent://music-rushi.vercel.app/in/album/${slug}/${id}` +
    `#Intent;scheme=https;package=${APP_PACKAGE};` +
    `S.browser_fallback_url=${encodeURIComponent(window.location.href)};end`;

  return (
    <div className="page album-details-page">
      <div className="album-hero">
        <img src={album.artwork} alt="" className="album-hero-art" />
        <div className="album-hero-info">
          <p className="album-kicker">SHARED ALBUM</p>
          <h1 className="album-title">{album.name}</h1>
          <p className="album-artist">{album.artist}</p>
          <p className="album-meta">
            {album.songs.length}{" "}
            {album.songs.length === 1 ? "song" : "songs"}
          </p>
          <button
            className="btn album-play-btn"
            onClick={() => loadAndPlay(album.songs, 0)}
          >
            ▶ Play Album
          </button>
          <a
            href={androidIntent}
            className="btn"
            style={{
              marginTop: 12,
              alignSelf: "flex-start",
              background: "#111",
              textDecoration: "none",
            }}
          >
            📱 Open in app
          </a>
        </div>
      </div>

      <div className="album-tracks">
        {album.songs.map((s, i) => (
          <div
            key={s.id}
            className={`song-row album-track ${
              current?.id === s.id ? "active" : ""
            }`}
            onClick={() => loadAndPlay(album.songs, i)}
            style={{ cursor: "pointer" }}
          >
            <span className="track-num">{i + 1}</span>
            <img src={s.artwork} alt="" className="song-art" />
            <div className="song-info">
              <div className="song-title">{s.title}</div>
              <div className="song-artist">{s.artist}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}