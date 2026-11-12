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

  // Auto-open the native app only on mobile
  useEffect(() => {
    if (!album) return;
    const isMobile = /android|iphone|ipad/i.test(navigator.userAgent);
    if (!isMobile) return;
    const androidIntent =
      `intent://music-rushi.vercel.app/in/album/${slug}/${id}` +
      `#Intent;scheme=https;package=${APP_PACKAGE};` +
      `S.browser_fallback_url=${encodeURIComponent(window.location.href)};end`;
    const t = setTimeout(() => {
      try {
        window.location.href = androidIntent;
      } catch {}
    }, 600);
    return () => clearTimeout(t);
  }, [album, id, slug]);

  if (notFound) {
    return (
      <div style={styles.centerPage}>
        <h1 style={styles.notFoundTitle}>Album not found</h1>
        <Link to="/" style={styles.linkBtn}>Go to Home</Link>
      </div>
    );
  }

  if (!album) {
    return <div style={styles.loadingPage}>Loading…</div>;
  }

  const androidIntent =
    `intent://music-rushi.vercel.app/in/album/${slug}/${id}` +
    `#Intent;scheme=https;package=${APP_PACKAGE};` +
    `S.browser_fallback_url=${encodeURIComponent(window.location.href)};end`;

  return (
    <div style={styles.page}>
      {/* ── HERO ──────────────────────────────────────────────── */}
      <div style={styles.hero}>
        <img
          src={album.artwork}
          alt={album.name}
          style={styles.heroArt}
          onError={(e) => {
            e.currentTarget.style.background = "#1c1c1e";
          }}
        />

        <div style={styles.heroInfo}>
          <p style={styles.kicker}>SHARED ALBUM</p>
          <h1 style={styles.title}>{album.name}</h1>
          <p style={styles.artist}>{album.artist}</p>
          <p style={styles.meta}>
            {album.songs.length}{" "}
            {album.songs.length === 1 ? "song" : "songs"}
          </p>

          <div style={styles.actionsRow}>
            <button
              onClick={() => loadAndPlay(album.songs, 0)}
              style={styles.playBtn}
            >
              ▶ Play Album
            </button>

            <a href={androidIntent} style={styles.openAppBtn}>
              📱 Open in App
            </a>
          </div>
        </div>
      </div>

      {/* ── TRACKLIST ─────────────────────────────────────────── */}
      <div style={styles.tracks}>
        {album.songs.map((s, i) => {
          const isActive = current?.id === s.id;
          return (
            <div
              key={s.id}
              onClick={() => loadAndPlay(album.songs, i)}
              style={{
                ...styles.track,
                ...(isActive ? styles.trackActive : null),
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={styles.trackNum}>{i + 1}</span>

              <img
                src={s.artwork}
                alt=""
                style={styles.trackArt}
                onError={(e) => {
                  e.currentTarget.style.background = "#1c1c1e";
                }}
              />

              <div style={styles.trackInfo}>
                <div
                  style={{
                    ...styles.trackTitle,
                    color: isActive ? "#f92c47" : "#fff",
                  }}
                >
                  {s.title}
                </div>
                <div style={styles.trackArtist}>{s.artist}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   All styles live here — no external CSS required.
   ────────────────────────────────────────────────────────────── */
const styles = {
  page: {
    padding: "24px 24px 120px",
    maxWidth: 960,
    margin: "0 auto",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: "#fff",
    minHeight: "100vh",
    background: "#000",
    boxSizing: "border-box",
  },

  /* Not-found / loading states */
  centerPage: {
    textAlign: "center",
    paddingTop: 80,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: "#fff",
  },
  notFoundTitle: {
    fontSize: 28,
    fontWeight: 800,
    margin: "0 0 16px",
  },
  linkBtn: {
    display: "inline-block",
    background: "#f92c47",
    color: "#fff",
    padding: "12px 24px",
    borderRadius: 24,
    fontWeight: 600,
    textDecoration: "none",
  },
  loadingPage: {
    padding: 80,
    textAlign: "center",
    color: "#a1a1aa",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  /* Hero */
  hero: {
    display: "flex",
    gap: 32,
    alignItems: "flex-end",
    padding: "8px 0 32px",
    flexWrap: "wrap",
  },
  heroArt: {
    width: "100%",
    maxWidth: 320,
    aspectRatio: "1 / 1",
    height: "auto",
    borderRadius: 12,
    objectFit: "cover",
    display: "block",
    flexShrink: 0,
    background: "#1c1c1e",
    boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
  },
  heroInfo: {
    flex: "1 1 320px",
    minWidth: 240,
    paddingBottom: 8,
  },
  kicker: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.6)",
    margin: "0 0 8px",
  },
  title: {
    fontSize: 40,
    fontWeight: 800,
    letterSpacing: -1,
    lineHeight: 1.1,
    margin: "0 0 8px",
    color: "#fff",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
  },
  artist: {
    fontSize: 18,
    fontWeight: 500,
    margin: "0 0 4px",
    color: "rgba(255,255,255,0.72)",
  },
  meta: {
    fontSize: 14,
    margin: "0 0 20px",
    color: "rgba(255,255,255,0.55)",
  },
  actionsRow: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap",
  },
  playBtn: {
    background: "#f92c47",
    color: "#fff",
    fontSize: 16,
    padding: "14px 32px",
    borderRadius: 24,
    border: "none",
    fontWeight: 600,
    cursor: "pointer",
  },
  openAppBtn: {
    background: "#111",
    color: "#fff",
    fontSize: 15,
    padding: "13px 24px",
    borderRadius: 24,
    textDecoration: "none",
    fontWeight: 600,
    display: "inline-block",
    border: "1px solid rgba(255,255,255,0.18)",
  },

  /* Tracklist */
  tracks: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    marginTop: 32,
    borderTop: "1px solid rgba(255,255,255,0.12)",
    paddingTop: 16,
  },
  track: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 12px",
    borderRadius: 8,
    cursor: "pointer",
    background: "transparent",
    transition: "background 0.15s",
  },
  trackActive: {
    background: "rgba(255,255,255,0.12)",
  },
  trackNum: {
    width: 26,
    minWidth: 26,
    textAlign: "right",
    fontSize: 14,
    color: "rgba(255,255,255,0.55)",
    fontVariantNumeric: "tabular-nums",
    flexShrink: 0,
  },
  trackArt: {
    width: 44,
    height: 44,
    borderRadius: 6,
    objectFit: "cover",
    background: "rgba(0,0,0,0.15)",
    flexShrink: 0,
  },
  trackInfo: {
    flex: 1,
    minWidth: 0,
  },
  trackTitle: {
    fontSize: 15,
    fontWeight: 600,
    margin: "0 0 2px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  trackArtist: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
};
