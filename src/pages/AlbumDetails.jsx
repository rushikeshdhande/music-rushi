import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { findAlbumByNumericId } from "../data/remoteAlbums";
import { usePlayer } from "../contexts/PlayerContext";
import { shareSong, songShareUrl } from "../lib/shareUrl";

/* ── Helpers ──────────────────────────────────────────────────── */
const optimizeUrl = (url, w) =>
  url?.includes("/upload/") ? url.replace("/upload/", `/upload/f_auto,q_auto,w_${w}/`) : url;

const FALLBACK = { page: "#1c1c1e", accent: "#f92c47", text: "#ffffff", muted: "rgba(255,255,255,0.68)" };

const themeVars = (c) => ({
  "--album-bg": c.page,
  "--album-navbar": c.page,
  "--album-accent": c.accent,
  "--album-text": c.text,
  "--album-text-muted": c.muted,
});

// Dominant + vibrant colour (bucket pixels, score by count × saturation)
function extractAlbumColor(url) {
  return new Promise((resolve) => {
    if (!url) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onerror = () => resolve(null);
    img.onload = () => {
      try {
        const S = 64;
        const cv = document.createElement("canvas");
        cv.width = cv.height = S;
        const ctx = cv.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, S, S);
        const { data } = ctx.getImageData(0, 0, S, S);
        const buckets = new Map();
        for (let i = 0; i < data.length; i += 4) {
          const R = data[i], G = data[i + 1], B = data[i + 2];
          const lum = (R * 299 + G * 587 + B * 114) / 1000;
          if (data[i + 3] < 128 || lum > 238 || lum < 18) continue; // skip transparent / near white / near black
          const max = Math.max(R, G, B);
          const key = ((R >> 4) << 8) | ((G >> 4) << 4) | (B >> 4);
          const e = buckets.get(key) || { r: 0, g: 0, b: 0, n: 0, sat: 0 };
          e.r += R; e.g += G; e.b += B; e.n++; e.sat += (max - Math.min(R, G, B)) / max;
          buckets.set(key, e);
        }
        let best = null, top = -1;
        buckets.forEach((e) => {
          const score = e.n * (0.25 + (e.sat / e.n) * 1.5);
          if (score > top) { top = score; best = e; }
        });
        resolve(
          best
            ? { r: Math.round(best.r / best.n), g: Math.round(best.g / best.n), b: Math.round(best.b / best.n) }
            : { r: 28, g: 28, b: 30 }
        );
      } catch {
        resolve(null);
      }
    };
    img.src = optimizeUrl(url, 200);
  });
}

// Blend toward a dark base so text always has good contrast
const buildColors = ({ r, g, b }) => {
  const mix = (a) =>
    `rgb(${Math.round(r * a + 14 * (1 - a))},${Math.round(g * a + 14 * (1 - a))},${Math.round(b * a + 16 * (1 - a))})`;
  return { page: mix(0.5), accent: `rgb(${r},${g},${b})`, text: "#ffffff", muted: "rgba(255,255,255,0.68)" };
};

const fmt = (sec) =>
  !sec || isNaN(sec) || sec <= 0 ? "—" : `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;

function showToast(msg) {
  const t = document.createElement("div");
  t.textContent = msg;
  Object.assign(t.style, {
    position: "fixed", bottom: "100px", left: "50%", transform: "translateX(-50%)",
    background: "#1c1c1e", color: "#fff", padding: "10px 18px", borderRadius: "999px",
    fontSize: "14px", fontWeight: "600", zIndex: 99999, boxShadow: "0 6px 24px rgba(0,0,0,0.4)",
  });
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2000);
}

const copy = async (text, ok, fail) => {
  try { await navigator.clipboard.writeText(text); showToast(ok); } catch { showToast(fail); }
};

// "Kesariya (Remix)" -> "kesariya-remix" (keeps Hindi / other letters)
const slugify = (str) =>
  String(str || "").toLowerCase().replace(/&/g, " and ").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "") || "album";

// Audio link: known field names first, then any string field that looks like audio
const AUDIO_RE = /\.(mp3|m4a|aac|wav|ogg|opus|flac)(\?|$)|\/video\/upload\/|\/audio\//i;
const AUDIO_KEYS = ["audioUrl", "audio", "url", "src", "preview", "previewUrl", "file", "link", "path", "mp3", "streamUrl"];
const songSrc = (song) => {
  const known = AUDIO_KEYS.map((k) => song[k]).find(Boolean);
  if (typeof known === "string") return known;
  return Object.values(song).find((v) => typeof v === "string" && /^https?:\/\//i.test(v) && AUDIO_RE.test(v)) || null;
};

// Exactly one row should be "playing": match on audio link, else title (+ id when both have one)
const isSameSong = (song, cur) => {
  if (!cur) return false;
  const a = songSrc(song), b = songSrc(cur);
  if (a && b) return a === b;
  if (song.title && cur.title) {
    if (song.title !== cur.title) return false;
    return song.id == null || cur.id == null || song.id === cur.id;
  }
  return song.id != null && song.id === cur.id;
};

// Existing duration in any common shape (seconds, ms, "3:45")
const readDuration = (song) => {
  const raw = song.duration ?? song.length ?? song.time ?? song.durationSec ??
    song.duration_seconds ?? song.durationMs ?? song.duration_ms;
  if (raw == null || raw === "") return 0;
  if (typeof raw === "string" && raw.includes(":")) {
    const parts = raw.split(":").map(Number);
    return parts.some(isNaN) ? 0 : parts.reduce((acc, p) => acc * 60 + p, 0);
  }
  const n = Number(raw);
  if (!n || isNaN(n)) return 0;
  return song.durationMs != null || song.duration_ms != null || n > 36000 ? n / 1000 : n;
};

// True on phone-sized screens
const useIsMobile = (max = 640) => {
  const q = `(max-width: ${max}px)`;
  const [v, setV] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const mq = window.matchMedia(q), on = (e) => setV(e.matches);
    setV(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [q]);
  return v;
};

/* ── Icons ────────────────────────────────────────────────────── */
const ShareIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);
const DotsIcon = ({ vertical }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={vertical ? { transform: "rotate(90deg)" } : undefined}>
    <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
  </svg>
);
const PlayIcon = ({ size = 14, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={style}>
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

/* ── Main Component ───────────────────────────────────────────── */
const AlbumDetails = () => {
  const { id, albumName } = useParams();
  const { loadAndPlay, current } = usePlayer();
  const isMobile = useIsMobile();

  const album = findAlbumByNumericId(id || albumName);
  const [colors, setColors] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null); // row INDEX (song ids can be missing/duplicated)
  const [activeIndex, setActiveIndex] = useState(null); // which ROW is playing
  const [durations, setDurations] = useState({});
  const menuRef = useRef(null);

  // Keep the playing row in sync with the player
  useEffect(() => {
    if (activeIndex == null || !current || !album?.songs) return;
    if (isSameSong(album.songs[activeIndex], current)) return;
    const idx = album.songs.findIndex((sg) => isSameSong(sg, current));
    setActiveIndex(idx >= 0 ? idx : null);
  }, [current]); // eslint-disable-line react-hooks/exhaustive-deps

  // Real song lengths from audio metadata (skipped on mobile, where times are hidden)
  useEffect(() => {
    if (isMobile || !album?.songs) return;
    let cancelled = false;
    const audios = [];
    album.songs.forEach((song, i) => {
      const src = songSrc(song);
      if (readDuration(song) > 0 || !src) return;
      const a = new Audio();
      a.preload = "metadata";
      a.onloadedmetadata = () => {
        if (!cancelled && isFinite(a.duration) && a.duration > 0) setDurations((d) => ({ ...d, [i]: a.duration }));
      };
      a.src = src;
      audios.push(a);
    });
    return () => {
      cancelled = true;
      audios.forEach((a) => { a.onloadedmetadata = null; a.src = ""; });
    };
  }, [album, isMobile]);

  // Close the menu on outside click
  useEffect(() => {
    const onDown = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenuOpenId(null);
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // Theme the whole page from the album art
  useEffect(() => {
    if (!album?.artwork) return;
    let cancelled = false;
    const root = document.documentElement;
    const targets = () => [document.body, root, document.getElementById("root")];

    extractAlbumColor(album.artwork).then((rgb) => {
      if (cancelled) return;
      const c = rgb ? buildColors(rgb) : FALLBACK;
      setColors(c);
      Object.entries(themeVars(c)).forEach(([k, v]) => root.style.setProperty(k, v));
      targets().forEach((el) => el && (el.style.background = c.page));
      root.classList.add("album-theme-active");
    });

    return () => {
      cancelled = true;
      Object.keys(themeVars(FALLBACK)).forEach((k) => root.style.removeProperty(k));
      targets().forEach((el) => el && (el.style.background = ""));
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

  const c = colors || FALLBACK;
  const mx = (k) => (isMobile ? { ...s[k], ...m[k] } : s[k]); // desktop style + mobile overrides
  const topBtn = isMobile ? m.pillBtn : s.iconCircleBtn;

  const playAt = (i) => { setActiveIndex(i); loadAndPlay(album.songs, i); };

  // ONE clean link with the album name: /…/album/<album-name>/<id>
  const albumUrl = () => {
    const segs = window.location.pathname.split("/").filter(Boolean);
    const hasName = id && albumName; // route has both params
    const idLast = !hasName || segs[segs.length - 1] === id; // keep the route's own order
    const prefix = segs.slice(0, hasName ? -2 : -1);
    const slug = slugify(album.name);
    const idSeg = id || albumName;
    return `${window.location.origin}/${[...prefix, ...(idLast ? [slug, idSeg] : [idSeg, slug])].join("/")}`;
  };

  // Share ONLY the url (no url inside text), so apps show a single link
  const shareAlbumLink = async () => {
    const url = albumUrl();
    try {
      if (navigator.share) await navigator.share({ title: album.name, url });
      else { await navigator.clipboard.writeText(url); showToast("Link Copied!"); }
    } catch (e) {
      if (e?.name !== "AbortError") showToast("Failed to share link.");
    }
  };

  const menuItems = (song) => [
    ["View Credits", "ⓘ", () => {}],
    ["Share Song", "⤴", () => shareSong(song)],
    ["Copy Link", "🔗", () => copy(songShareUrl(song), "Link Copied!", "Failed to copy link.")],
    ["Copy Embed Code", "</>", () =>
      copy(
        `<iframe src="${songShareUrl(song)}" width="100%" height="380" frameBorder="0" allowtransparency="true" allow="encrypted-media"></iframe>`,
        "Embed Code Copied!", "Failed to copy embed code."
      )],
  ];

  return (
    <div style={{ ...s.page, background: c.page, color: c.text }}>
      {/* TOP RIGHT: share + 3 dots (one pill on mobile) */}
      <div style={mx("topActions")}>
        <button style={topBtn} onClick={shareAlbumLink} title="Share Album"><ShareIcon /></button>
        <button style={topBtn} title="More options"><DotsIcon /></button>
      </div>

      {/* HERO */}
      <div style={mx("hero")}>
        <img
          src={optimizeUrl(album.artwork, 640)}
          alt={album.name}
          style={mx("heroArt")}
          onError={(e) => { e.currentTarget.style.background = "#1c1c1e"; }}
        />
        <div style={mx("heroInfo")}>
          <h1 style={{ ...s.title, color: c.text }}>{album.name}</h1>
          <p style={{ ...s.artist, color: c.text }}>{album.artist}</p>
          <p style={{ ...s.meta, color: c.muted }}>
            Bollywood • 2023{!isMobile && ` • ${album.songs.length} songs`}
          </p>
          <div style={mx("actionsRow")}>
            <button style={s.playBtn} onClick={() => playAt(0)}>
              <PlayIcon style={{ marginRight: 8 }} />Preview
            </button>
            {!isMobile && (
              <button style={{ ...s.shareCircleBtn, color: c.text }} title="Add to Library">✓</button>
            )}
          </div>
        </div>
      </div>

      {/* TRACKLIST: number · title / artist · ⋮ */}
      <div style={s.tracks}>
        <div style={s.divider} />
        {album.songs.map((song, i) => {
          const active = activeIndex === i;
          const open = menuOpenId === i;
          const hover = (bg) => (e) => { if (!active && !open) e.currentTarget.style.background = bg; };

          return (
            <div
              key={`${song.id ?? "song"}-${i}`}
              style={{ ...s.track, background: active || open ? "rgba(255,255,255,0.12)" : "transparent", zIndex: open ? 100 : 1 }}
              onClick={() => playAt(i)}
              onMouseEnter={hover("rgba(255,255,255,0.07)")}
              onMouseLeave={hover("transparent")}
            >
              <span style={{ ...s.trackNum, color: active ? c.accent : c.muted }}>{i + 1}</span>

              <div style={s.trackBody}>
                <div style={s.trackInfo}>
                  <div style={{ ...s.trackTitle, fontWeight: active ? 700 : 500 }}>{song.title}</div>
                  <div style={{ ...s.trackArtist, color: c.muted }}>{song.artist}</div>
                </div>

                {/* Song time: hidden on mobile */}
                {!isMobile && (
                  <span style={{ ...s.trackDuration, color: c.muted }}>{fmt(readDuration(song) || durations[i])}</span>
                )}

                <div style={{ position: "relative" }} ref={open ? menuRef : null}>
                  <button
                    style={{ ...s.iconBtn, color: open ? c.text : c.muted }}
                    onClick={(e) => { e.stopPropagation(); setMenuOpenId(open ? null : i); }}
                    title="More options"
                  >
                    <DotsIcon vertical />
                  </button>
                  {open && (
                    <div style={s.popupMenu} onClick={(e) => e.stopPropagation()}>
                      {menuItems(song).map(([label, icon, fn], k) => (
                        <React.Fragment key={label}>
                          {k > 0 && <div style={s.menuDivider} />}
                          <div style={s.menuItem} onClick={() => { fn(); setMenuOpenId(null); }}>
                            <span>{label}</span>
                            <span style={s.menuIcon}>{icon}</span>
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ── Styles ───────────────────────────────────────────────────── */
const flex = { display: "flex", alignItems: "center" };
const ellipsis = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
const line = "rgba(255,255,255,0.14)";

const s = {
  page: {
    minHeight: "100vh",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    transition: "background 0.5s ease, color 0.3s ease",
    position: "relative",
    boxSizing: "border-box",
  },
  topActions: { position: "absolute", top: 24, right: 24, display: "flex", gap: 12, zIndex: 5 },
  iconCircleBtn: {
    ...flex, justifyContent: "center", width: 36, height: 36, borderRadius: "50%",
    background: "rgba(255,255,255,0.14)", color: "#fff", border: "none", cursor: "pointer",
  },
  hero: {
    display: "flex", gap: 32, alignItems: "flex-end", flexWrap: "wrap",
    padding: "72px 24px 32px", maxWidth: 1000, margin: "0 auto", boxSizing: "border-box",
  },
  heroArt: {
    width: 280, maxWidth: "100%", aspectRatio: "1 / 1", height: "auto", borderRadius: 10,
    objectFit: "cover", display: "block", background: "#1c1c1e",
    boxShadow: "0 24px 60px rgba(0,0,0,0.4)", flexShrink: 0,
  },
  heroInfo: { flex: "1 1 300px", minWidth: 240, paddingBottom: 4, display: "flex", flexDirection: "column", gap: 6 },
  title: { fontSize: 32, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.15, margin: 0, wordBreak: "break-word", overflowWrap: "anywhere" },
  artist: { fontSize: 20, fontWeight: 500, margin: 0 },
  meta: { fontSize: 14, margin: "0 0 18px", opacity: 0.85 },
  actionsRow: { ...flex, gap: 14, flexWrap: "wrap" },
  playBtn: {
    ...flex, fontSize: 16, fontWeight: 600, padding: "12px 28px", borderRadius: 24,
    border: "none", cursor: "pointer", background: "#ffffff", color: "#111111",
  },
  shareCircleBtn: {
    ...flex, justifyContent: "center", width: 44, height: 44, borderRadius: "50%",
    border: "none", cursor: "pointer", fontSize: 18, background: "rgba(255,255,255,0.18)",
  },

  // Tracklist (Apple Music style: no images, thin dividers that start under the title)
  tracks: { paddingBottom: 120, maxWidth: 1000, margin: "0 auto", boxSizing: "border-box" },
  divider: { height: 1, margin: "0 20px", background: line },
  track: { ...flex, cursor: "pointer", position: "relative", transition: "background 0.15s" },
  trackNum: { width: 52, paddingLeft: 8, boxSizing: "border-box", textAlign: "center", fontSize: 17, fontVariantNumeric: "tabular-nums", flexShrink: 0 },
  trackBody: { ...flex, flex: 1, minWidth: 0, gap: 8, padding: "9px 0", marginRight: 20, borderBottom: `1px solid ${line}` },
  trackInfo: { flex: 1, minWidth: 0 },
  trackTitle: { fontSize: 17, lineHeight: 1.25, ...ellipsis },
  trackArtist: { fontSize: 15, lineHeight: 1.25, marginTop: 2, ...ellipsis },
  trackDuration: { width: 44, textAlign: "right", fontSize: 13, fontVariantNumeric: "tabular-nums", flexShrink: 0 },
  iconBtn: { ...flex, background: "transparent", border: "none", cursor: "pointer", padding: "6px 8px", flexShrink: 0 },
  popupMenu: {
    position: "absolute", top: "100%", right: 0, minWidth: 210, background: "#2c2c2e",
    borderRadius: 12, padding: "4px 0", boxShadow: "0 12px 32px rgba(0,0,0,0.5)", zIndex: 200,
  },
  menuItem: {
    ...flex, justifyContent: "space-between", gap: 16, padding: "12px 16px",
    fontSize: 14, color: "#ffffff", cursor: "pointer",
  },
  menuDivider: { height: 1, background: "rgba(255,255,255,0.1)", margin: "0 12px" },
  menuIcon: { fontSize: 14, opacity: 0.7 },
};

/* ── Mobile-only overrides (screens up to 640px) ──────────────── */
const m = {
  // Share + 3 dots in ONE pill with a thin 0.5px border
  topActions: {
    top: 16, right: 16, gap: 0, padding: "0 4px", borderRadius: 999,
    background: "rgba(255,255,255,0.14)", border: "0.5px solid rgba(255,255,255,0.35)",
  },
  pillBtn: { ...flex, justifyContent: "center", width: 40, height: 36, padding: 0, border: "none", background: "transparent", color: "#fff", cursor: "pointer" },
  // Image, name, artist centered at the top
  hero: { flexDirection: "column", flexWrap: "nowrap", alignItems: "center", textAlign: "center", gap: 20, padding: "64px 20px 24px" },
  heroArt: { width: "min(240px, 70vw)" },
  heroInfo: { flex: "0 0 auto", minWidth: 0, width: "100%", alignItems: "center", textAlign: "center" },
  // Preview button centered
  actionsRow: { justifyContent: "center", width: "100%" },
};

export default AlbumDetails;
