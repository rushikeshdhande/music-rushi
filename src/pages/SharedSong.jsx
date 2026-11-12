import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ALL_SONGS, findSongByNumericId } from "../data/remoteAlbums";
import { usePlayer } from "../contexts/PlayerContext";

const APP_PACKAGE = "com.netease.cloudmusic";

export default function SharedSong() {
  const { id, slug } = useParams();
  const { loadAndPlay } = usePlayer();
  const [song, setSong] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const found = findSongByNumericId(id);
    if (found) setSong(found);
    else setNotFound(true);
  }, [id]);

  // Try to hand off to the native app
  useEffect(() => {
    if (!song) return;
    const isMobile = /android|iphone|ipad/i.test(navigator.userAgent);
    if (!isMobile) return;

    const androidIntent =
      `intent://music-rushi.vercel.app/in/song/${slug}/${id}` +
      `#Intent;scheme=https;package=${APP_PACKAGE};` +
      `S.browser_fallback_url=${encodeURIComponent(window.location.href)};end`;

    const t = setTimeout(() => {
      try { window.location.href = androidIntent; } catch {}
    }, 400);
    return () => clearTimeout(t);
  }, [song, id, slug]);

  if (notFound) {
    return (
      <div className="page" style={{ textAlign: "center", paddingTop: 80 }}>
        <h1>Song not found</h1>
        <Link to="/" className="btn">Go to Home</Link>
      </div>
    );
  }
  if (!song) return <div className="page">Loading…</div>;

  const androidIntent =
    `intent://music-rushi.vercel.app/in/song/${slug}/${id}` +
    `#Intent;scheme=https;package=${APP_PACKAGE};` +
    `S.browser_fallback_url=${encodeURIComponent(window.location.href)};end`;

  return (
    <div className="page shared-song-page">
      <img src={song.artwork} alt="" className="shared-song-art" />
      <h1>{song.title}</h1>
      <p className="shared-song-artist">{song.artist}</p>
      <p className="shared-song-album">From "{song.album}"</p>

      <button
        className="btn"
        style={{ marginTop: 24, fontSize: 16, padding: "14px 32px" }}
        onClick={() => loadAndPlay(ALL_SONGS, ALL_SONGS.indexOf(song))}
      >
        ▶ Play on web
      </button>

      <a
        href={androidIntent}
        className="btn"
        style={{
          marginTop: 12,
          display: "inline-block",
          textDecoration: "none",
          background: "#111",
        }}
      >
        📱 Open in app
      </a>
    </div>
  );
}