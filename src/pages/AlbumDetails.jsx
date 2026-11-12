import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { findAlbumByNumericId } from "../data/remoteAlbums";
import { usePlayer } from "../contexts/PlayerContext";
import { useSyncStore } from "../lib/syncStore";
import { shareSong, shareAlbum, songShareUrl } from "../lib/shareUrl";

/* ── Colour Extraction (dominant + vibrant, not a muddy average) ─ */
function optimizeUrl(url, w) {
  if (!url) return url;
  return url.includes("/upload/")
    ? url.replace("/upload/", `/upload/f_auto,q_auto,w_${w}/`)
    : url;
}

function extractAlbumColor(imageUrl) {
  return new Promise((resolve) => {
    if (!imageUrl) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = optimizeUrl(imageUrl, 200);

    img.onload = () => {
      try {
        const SIZE = 64;
        const c = document.createElement("canvas");
        c.width = SIZE;
        c.height = SIZE;
        const ctx = c.getContext("2d", { willReadFrequently: true });
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, SIZE, SIZE);
        const { data } = ctx.getImageData(0, 0, SIZE, SIZE);

        // Bucket pixels (4 bits per channel) and score by count × saturation
        const buckets = new Map();
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 128) continue;
          const R = data[i], G = data[i + 1], B = data[i + 2];
          const max = Math.max(R, G, B);
          const min = Math.min(R, G, B);
          const lum = (R * 299 + G * 587 + B * 114) / 1000;
          if (lum > 238 || lum < 18) continue; // skip near white / black
          const sat = max === 0 ? 0 : (max - min) / max;
          const key = ((R >> 4) << 8) | ((G >> 4) << 4) | (B >> 4);
          const e = buckets.get(key) || { r: 0, g: 0, b: 0, n: 0, sat: 0 };
          e.r += R; e.g += G; e.b += B; e.n++; e.sat += sat;
          buckets.set(key, e);
        }

        let best = null;
        let bestScore = -1;
        buckets.forEach((e) => {
          const avgSat = e.sat / e.n;
          const score = e.n * (0.25 + avgSat * 1.5);
          if (score > bestScore) { bestScore = score; best = e; }
        });

        if (!best) return resolve({ r: 28, g: 28, b: 30 });
        resolve({
          r: Math.round(best.r / best.n),
          g: Math.round(best.g / best.n),
          b: Math.round(best.b / best.n),
        });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
  });
}

function buildColors({ r, g, b }) {
  // Blend toward a dark base so the page always has good contrast
  const blend = (a) => {
    const R = Math.round(r * a + 14 * (1 - a));
    const G = Math.round(g * a + 14 * (1 - a));
    const B = Math.round(b * a + 16 * (1 - a));
    return `rgb(${R},${G},${B})`;
  };
  const accentLum = (r * 299 + g * 587 + b * 114) / 1000;
  const bg = blend(0.5);

  return {
    page: bg,
    navbar: bg,
    accent: `rgb(${r},${g},${b})`,
    // Page bg is always a darkened blend, so text stays light
    text: "#ffffff",
    textMuted: "rgba(255,255,255,0.68)",
    isDark: true,
    accentIsLight: accentLum > 150,
  };
}

/* ── Helpers ──────────────────────────────────────────────────── */
function formatDuration(seconds) {
  if (!seconds || isNaN(seconds) || seconds <= 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function showToast(msg) {
  const t = document.createElement("div");
  t.textContent = msg;
  Object.assign(t.style, {
    position: "fixed", bottom: "100px", left: "50%",
    transform: "translateX(-50%)", background: "#1c1c1e", color: "#fff",
    padding: "10px 18px", borderRadius: "999px", fontSize: "14px",
    fontWeight: "600", zIndex: 99999, boxShadow: "0 6px 24px rgba(0,0,0,0.4)",
  });
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2000);
}

// Find the audio link: known field names first, then any string field that looks like audio
const AUDIO_RE = /\.(mp3|m4a|aac|wav|ogg|opus|flac)(\?|$)|\/video\/upload\/|\/audio\//i;
const songSrc = (song) => {
  const known =
    song.audioUrl || song.audio || song.url || song.src || song.preview ||
    song.previewUrl || song.file || song.link || song.path || song.mp3 || song.streamUrl;
  if (typeof known === "string" && known) return known;
  for (const v of Object.values(song)) {
    if (typeof v === "string" && /^https?:\/\//i.test(v) && AUDIO_RE.test(v)) return v;
  }
  return null;
};

// Exactly one row should be "playing": match on audio link, else title (+ id when both have one)
const isSameSong = (song, cur) => {
  if (!cur) return false;
  const a = songSrc(song);
  const b = songSrc(cur);
  if (a && b) return a === b;
  if (song.title && cur.title && song.title !== cur.title) return false;
  if (song.title && cur.title) {
    return song.id == null || cur.id == null || song.id === cur.id;
  }
  return song.id != null && song.id === cur.id;
};

// Read an existing duration in any common shape (seconds, ms, "3:45")
const readDuration = (song) => {
  const raw =
    song.duration ?? song.length ?? song.time ?? song.durationSec ??
    song.duration_seconds ?? song.durationMs ?? song.duration_ms;
  if (raw == null || raw === "") return 0;
  if (typeof raw === "string" && raw.includes(":")) {
    const parts = raw.split(":").map(Number);
    if (parts.some(isNaN)) return 0;
    return parts.reduce((acc, p) => acc * 60 + p, 0);
  }
  const n = Number(raw);
  if (!n || isNaN(n)) return 0;
  const isMs = song.durationMs != null || song.duration_ms != null || n > 3600 * 10;
  return isMs ? n / 1000 : n;
};

const songImage = (song, album) =>
  song.artwork || song.image || song.cover || song.thumbnail || album.artwork;

/* ── Main Component ───────────────────────────────────────────── */
const AlbumDetails = () => {
  const { id, albumName } = useParams();
  const { loadAndPlay, current } = usePlayer();
  const { favourites, toggleFavourite } = useSyncStore();

  const album = id ? findAlbumByNumericId(id) : findAlbumByNumericId(albumName);
  const [colors, setColors] = useState(null);

  // Menu is tracked by row INDEX (song ids can be missing/duplicated)
  const [menuOpenId, setMenuOpenId] = useState(null);
  const menuRef = useRef(null);

  // Which ROW is playing (all rows can share the same id/title/audio in the data)
  const [activeIndex, setActiveIndex] = useState(null);
  useEffect(() => {
    if (activeIndex == null || !current || !album?.songs) return;
    if (isSameSong(album.songs[activeIndex], current)) return;
    const idx = album.songs.findIndex((sg) => isSameSong(sg, current));
    setActiveIndex(idx >= 0 ? idx : null);
  }, [current]); // eslint-disable-line react-hooks/exhaustive-deps

  // Real song lengths, read from the audio file metadata
  const [durations, setDurations] = useState({});
  useEffect(() => {
    if (!album?.songs) return;
    let cancelled = false;
    const audios = [];
    album.songs.forEach((song, i) => {
      if (readDuration(song) > 0) return;
      const src = songSrc(song);
      if (!src) return;
      const a = new Audio();
      a.preload = "metadata";
      a.onloadedmetadata = () => {
        if (!cancelled && isFinite(a.duration) && a.duration > 0) {
          setDurations((d) => ({ ...d, [i]: a.duration }));
        }
      };
      a.src = src;
      audios.push(a);
    });
    return () => {
      cancelled = true;
      audios.forEach((a) => { a.onloadedmetadata = null; a.src = ""; });
    };
  }, [album]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpenId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Extract theme colours from the album art
  useEffect(() => {
    if (!album?.artwork) return;
    let cancelled = false;

    extractAlbumColor(album.artwork).then((rgb) => {
      if (cancelled) return;
      const c = rgb
        ? buildColors(rgb)
        : {
            page: "#1c1c1e", navbar: "#1c1c1e", accent: "#f92c47",
            text: "#ffffff", textMuted: "rgba(255,255,255,0.68)",
            isDark: true, accentIsLight: false,
          };
      setColors(c);

      const root = document.documentElement;
      root.style.setProperty("--album-bg", c.page);
      root.style.setProperty("--album-navbar", c.navbar);
      root.style.setProperty("--album-accent", c.accent);
      root.style.setProperty("--album-text", c.text);
      root.style.setProperty("--album-text-muted", c.textMuted);

      document.body.style.background = c.page;
      root.style.background = c.page;
      const rootEl = document.getElementById("root");
      if (rootEl) rootEl.style.background = c.page;

      root.classList.add("album-theme-active");
    });

    return () => {
      cancelled = true;
      const root = document.documentElement;
      ["--album-bg", "--album-navbar", "--album-accent", "--album-text", "--album-text-muted"].forEach((p) =>
        root.style.removeProperty(p)
      );
      document.body.style.background = "";
      root.style.background = "";
      const rootEl = document.getElementById("root");
      if (rootEl) rootEl.style.background = "";
      root.classList.remove("album-theme-active");
    };
  }, [album?.artwork]);

  if (!album) {
    return (
      <div style={{ textAlign: "center", paddingTop: 80 }}>
        <h1>Album not found</h1>
        <Link to="/albums" className="btn">Back to Albums</Link>
      </div>
    );
  }

  const pageBg = colors?.page ?? "#1c1c1e";
  const textColor = colors?.text ?? "#ffffff";
  const textMuted = colors?.textMuted ?? "rgba(255,255,255,0.68)";
  const accent = colors?.accent ?? "#f92c47";

  const playAt = (i) => {
    setActiveIndex(i);
    loadAndPlay(album.songs, i);
  };

  const handleCopyLink = async (song) => {
    try {
      await navigator.clipboard.writeText(songShareUrl(song));
      showToast("Link Copied!");
    } catch {
      showToast("Failed to copy link.");
    }
    setMenuOpenId(null);
  };

  const handleCopyEmbed = async (song) => {
    const url = songShareUrl(song);
    const embedCode = `<iframe src="${url}" width="100%" height="380" frameBorder="0" allowtransparency="true" allow="encrypted-media"></iframe>`;
    try {
      await navigator.clipboard.writeText(embedCode);
      showToast("Embed Code Copied!");
    } catch {
      showToast("Failed to copy embed code.");
    }
    setMenuOpenId(null);
  };

  return (
    <div style={{ ...s.page, background: pageBg, color: textColor }}>
      {/* ── TOP RIGHT ACTIONS ── */}
      <div style={s.topActions}>
        <button style={s.iconCircleBtn} onClick={() => shareAlbum(album)} title="Share Album">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
            <polyline points="16 6 12 2 8 6"></polyline>
            <line x1="12" y1="2" x2="12" y2="15"></line>
          </svg>
        </button>
        <button style={s.iconCircleBtn} title="More options">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="2"></circle>
            <circle cx="12" cy="12" r="2"></circle>
            <circle cx="19" cy="12" r="2"></circle>
          </svg>
        </button>
      </div>

      {/* ── HERO ── */}
      <div style={s.hero}>
        <img
          src={optimizeUrl(album.artwork, 640)}
          alt={album.name}
          style={s.heroArt}
          onError={(e) => { e.currentTarget.style.background = "#1c1c1e"; }}
        />
        <div style={s.heroInfo}>
          <h1 style={{ ...s.title, color: textColor }}>{album.name}</h1>
          <p style={{ ...s.artist, color: textColor }}>{album.artist}</p>
          <p style={{ ...s.meta, color: textMuted }}>Bollywood • 2023 • {album.songs.length} songs</p>

          <div style={s.actionsRow}>
            <button
              style={{ ...s.playBtn, background: "#ffffff", color: "#111111" }}
              onClick={() => playAt(0)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 8 }}>
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              Preview
            </button>
            <button
              style={{ ...s.shareCircleBtn, background: "rgba(255,255,255,0.18)", color: textColor }}
              title="Add to Library"
            >
              ✓
            </button>
          </div>
        </div>
      </div>

      {/* ── TRACKLIST ── */}
      <div style={s.tracks}>
        {album.songs.map((s2, i) => {
          const isActive = activeIndex === i;
          const isFav = !!favourites[s2.id];
          const isMenuOpen = menuOpenId === i;

          return (
            <div
              key={`${s2.id ?? "song"}-${i}`}
              style={{
                ...s.track,
                background: isActive || isMenuOpen ? "rgba(255,255,255,0.12)" : "transparent",
                zIndex: isMenuOpen ? 100 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isActive && !isMenuOpen) e.currentTarget.style.background = "rgba(255,255,255,0.07)";
              }}
              onMouseLeave={(e) => {
                if (!isActive && !isMenuOpen) e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{ ...s.trackNum, color: isActive ? accent : textMuted }}>{i + 1}</span>

              {/* Song image */}
              <div style={s.thumbWrap} onClick={() => playAt(i)}>
                <img
                  src={optimizeUrl(songImage(s2, album), 120)}
                  alt={s2.title}
                  loading="lazy"
                  style={s.thumb}
                  onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
                />
                {isActive && (
                  <div style={s.thumbOverlay}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  </div>
                )}
              </div>

              <div style={s.trackInfo} onClick={() => playAt(i)}>
                <div style={{ ...s.trackTitle, color: isActive ? "#ffffff" : textColor, fontWeight: isActive ? 700 : 500 }}>
                  {s2.title}
                </div>
                <div style={{ ...s.trackArtist, color: textMuted }}>{s2.artist}</div>
              </div>

              <button
                style={{ ...s.iconBtn, color: isFav ? "#f92c47" : textMuted }}
                onClick={() => toggleFavourite(s2.id)}
                title={isFav ? "Unfavourite" : "Favourite"}
              >
                {isFav ? "★" : "☆"}
              </button>

              <span style={{ ...s.trackDuration, color: textMuted }}>{formatDuration(readDuration(s2) || durations[i])}</span>

              <div style={{ position: "relative" }} ref={isMenuOpen ? menuRef : null}>
                <button
                  style={{ ...s.iconBtn, color: isMenuOpen ? textColor : textMuted }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpenId(isMenuOpen ? null : i);
                  }}
                  title="More options"
                >
                  •••
                </button>

                {isMenuOpen && (
                  <div style={s.popupMenu}>
                    <div style={s.menuItem} onClick={() => setMenuOpenId(null)}>
                      <span>View Credits</span>
                      <span style={s.menuIcon}>ⓘ</span>
                    </div>
                    <div style={s.menuDivider} />
                    <div style={s.menuItem} onClick={() => { shareSong(s2); setMenuOpenId(null); }}>
                      <span>Share Song</span>
                      <span style={s.menuIcon}>⤴</span>
                    </div>
                    <div style={s.menuDivider} />
                    <div style={s.menuItem} onClick={() => handleCopyLink(s2)}>
                      <span>Copy Link</span>
                      <span style={s.menuIcon}>🔗</span>
                    </div>
                    <div style={s.menuDivider} />
                    <div style={s.menuItem} onClick={() => handleCopyEmbed(s2)}>
                      <span>Copy Embed Code</span>
                      <span style={s.menuIcon}>&lt;/&gt;</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ── STYLES ───────────────────────────────────────────────────── */
const s = {
  page: {
    maxWidth: "100%",
    margin: 0,
    minHeight: "100vh",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    transition: "background 0.5s ease, color 0.3s ease",
    position: "relative",
    boxSizing: "border-box",
  },
  topActions: {
    position: "absolute",
    top: 24,
    right: 24,
    display: "flex",
    gap: 12,
    zIndex: 5,
  },
  iconCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.14)",
    color: "#fff",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  hero: {
    display: "flex",
    gap: 32,
    alignItems: "flex-end",
    padding: "72px 24px 32px",
    flexWrap: "wrap",
    maxWidth: 1000,
    margin: "0 auto",
    boxSizing: "border-box",
  },
  heroArt: {
    width: 280,
    maxWidth: "100%",
    aspectRatio: "1 / 1",
    height: "auto",
    borderRadius: 10,
    objectFit: "cover",
    display: "block",
    background: "#1c1c1e",
    boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
    flexShrink: 0,
  },
  heroInfo: {
    flex: "1 1 300px",
    minWidth: 240,
    paddingBottom: 4,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  title: {
    fontSize: 32,
    fontWeight: 700,
    letterSpacing: -0.5,
    lineHeight: 1.15,
    margin: 0,
    wordBreak: "break-word",
    overflowWrap: "anywhere",
  },
  artist: { fontSize: 20, fontWeight: 500, margin: 0 },
  meta: { fontSize: 14, margin: "0 0 18px", opacity: 0.85 },
  actionsRow: { display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" },
  playBtn: {
    fontSize: 16,
    fontWeight: 600,
    padding: "12px 28px",
    borderRadius: 24,
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
  shareCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    fontSize: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  tracks: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    borderTop: "1px solid rgba(255,255,255,0.12)",
    padding: "16px 12px 120px",
    maxWidth: 1000,
    margin: "0 auto",
    boxSizing: "border-box",
  },
  track: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "8px 12px",
    borderRadius: 10,
    transition: "background 0.15s",
    position: "relative",
  },
  trackNum: {
    width: 22,
    textAlign: "center",
    fontSize: 14,
    fontVariantNumeric: "tabular-nums",
    flexShrink: 0,
  },
  thumbWrap: {
    position: "relative",
    width: 48,
    height: 48,
    borderRadius: 6,
    overflow: "hidden",
    flexShrink: 0,
    background: "rgba(255,255,255,0.1)",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
  },
  thumb: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  thumbOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  trackInfo: {
    flex: 1,
    minWidth: 0,
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },
  trackTitle: {
    fontSize: 16,
    margin: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  trackArtist: {
    fontSize: 13,
    margin: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  trackDuration: {
    fontSize: 14,
    fontVariantNumeric: "tabular-nums",
    minWidth: 40,
    textAlign: "right",
  },
  iconBtn: {
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    border: "none",
    fontSize: 18,
    cursor: "pointer",
    padding: 0,
    borderRadius: "50%",
    flexShrink: 0,
  },

  /* ── POPUP MENU ── */
  popupMenu: {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: 8,
    width: 220,
    background: "#28282b",
    borderRadius: 10,
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
    padding: "6px 0",
    zIndex: 1000,
    border: "1px solid rgba(255,255,255,0.1)",
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 16px",
    fontSize: 14,
    color: "#fff",
    cursor: "pointer",
  },
  menuIcon: { opacity: 0.6, fontSize: 14 },
  menuDivider: { height: 1, background: "rgba(255,255,255,0.08)", margin: "2px 0" },
};

export default AlbumDetails;