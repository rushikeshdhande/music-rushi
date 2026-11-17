// src/components/Player.jsx
import { useState, useEffect } from "react";
import { usePlayer } from "../contexts/PlayerContext";

const fmt = (s) => {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
};

/* ---------- Mini player icons (Apple Music style) ---------- */
const I = {
  Shuffle: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 3 21 3 21 8" />
      <line x1="4" y1="20" x2="21" y2="3" />
      <polyline points="21 16 21 21 16 21" />
      <line x1="15" y1="15" x2="21" y2="21" />
      <line x1="4" y1="4" x2="9" y2="9" />
    </svg>
  ),
  Prev: () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11 6.5v11a.8.8 0 0 1-1.25.66L2.4 12.66a.8.8 0 0 1 0-1.32l7.35-5.5A.8.8 0 0 1 11 6.5z" />
      <path d="M21 6.5v11a.8.8 0 0 1-1.25.66l-7.35-5.5a.8.8 0 0 1 0-1.32l7.35-5.5A.8.8 0 0 1 21 6.5z" />
    </svg>
  ),
  Next: () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 6.5v11a.8.8 0 0 0 1.25.66l7.35-5.5a.8.8 0 0 0 0-1.32l-7.35-5.5A.8.8 0 0 0 13 6.5z" />
      <path d="M3 6.5v11a.8.8 0 0 0 1.25.66l7.35-5.5a.8.8 0 0 0 0-1.32l-7.35-5.5A.8.8 0 0 0 3 6.5z" />
    </svg>
  ),
  Play: () => (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 4.6v14.8a.9.9 0 0 0 1.4.76l11.2-7.4a.9.9 0 0 0 0-1.52L8.4 3.84A.9.9 0 0 0 7 4.6z" />
    </svg>
  ),
  Pause: () => (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
      <rect x="5.5" y="4" width="4.5" height="16" rx="1.2" />
      <rect x="14" y="4" width="4.5" height="16" rx="1.2" />
    </svg>
  ),
  Repeat: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  ),
  Lyrics: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M8.5 8.5h.01M15.5 8.5h.01" strokeWidth="3" />
      <path d="M8.5 12c1 .8 2.2 1.2 3.5 1.2s2.5-.4 3.5-1.2" />
    </svg>
  ),
  Queue: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="9" y1="6" x2="21" y2="6" />
      <line x1="9" y1="12" x2="21" y2="12" />
      <line x1="9" y1="18" x2="21" y2="18" />
      <circle cx="4" cy="6" r="1" fill="currentColor" />
      <circle cx="4" cy="12" r="1" fill="currentColor" />
      <circle cx="4" cy="18" r="1" fill="currentColor" />
    </svg>
  ),
  Volume: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 9 7 9 12 4.5 12 19.5 7 15 3 15" fill="currentColor" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  ),
  Apple: () => (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  ),
  NoteArt: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
    </svg>
  ),
};

const EMPTY_TRACK = { title: "Not Playing", artist: "Choose a song", artwork: "" };

export default function Player() {
  const {
    current, playing, currentTime, duration, playPause, next, prev, seek,
    // optional extras — the player works fine if your context doesn't have them
    shuffle, repeat, toggleShuffle, toggleRepeat,
    volume, setVolume, toggleLyrics, toggleQueue,
  } = usePlayer();
  const [expanded, setExpanded] = useState(false);

  const hasTrack = !!current;
  const track = current || EMPTY_TRACK;

  useEffect(() => {
    if (!hasTrack) setExpanded(false);
  }, [hasTrack]);

  useEffect(() => {
    document.body.style.overflow = expanded ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [expanded]);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e) => { if (e.key === "Escape") setExpanded(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

  const progress = hasTrack
    ? Math.min(100, Math.max(0, ((currentTime || 0) / (duration || 1)) * 100))
    : 0;

  const toggleExpanded = () => {
    if (hasTrack) setExpanded((v) => !v);
  };

  const call = (fn) => () => { if (typeof fn === "function") fn(); };

  return (
    <>
      <style>{`
        /* ================= MINI PLAYER (ALWAYS VISIBLE, FIXED) ================= */
        .player-mini {
          position: fixed;
          bottom: 20px;
          left: calc(50% + (var(--sidebar-width, 0px) / 2));
          transform: translateX(-50%);
          width: calc(100% - var(--sidebar-width, 0px) - 48px);
          max-width: 820px;
          height: 60px;
          padding: 0 20px;
          display: grid;
          grid-template-columns: 1fr minmax(0, 260px) 1fr;
          align-items: center;
          gap: 12px;
          background: var(--player-bg, rgba(34, 34, 36, 0.94));
          backdrop-filter: blur(24px) saturate(140%);
          -webkit-backdrop-filter: blur(24px) saturate(140%);
          border-radius: 999px;
          border: 1px solid var(--player-border, rgba(255, 255, 255, 0.22));
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
          overflow: hidden;
          z-index: 2100;
          color: var(--text-main, #f5f5f7);
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          transition: background 0.3s ease, border-color 0.3s ease;
        }

        .mini-left, .mini-right { display: flex; align-items: center; min-width: 0; }
        .mini-left { gap: 4px; justify-self: start; }
        .mini-right { gap: 6px; justify-self: end; }

        /* generic control button */
        .mc-btn {
          background: none; border: none; padding: 0; cursor: pointer;
          width: 36px; height: 36px; border-radius: 50%;
          display: inline-flex; align-items: center; justify-content: center;
          color: var(--text-muted, #8e8e93);
          transition: color 0.15s, transform 0.15s, background 0.15s;
          flex-shrink: 0;
        }
        .mc-btn:hover:not(:disabled) { color: #fff; }
        .mc-btn:active:not(:disabled) { transform: scale(0.92); }
        .mc-btn:disabled { cursor: default; }
        .mc-btn.active { color: var(--accent, #fa243c); }
        .mc-btn.main { width: 46px; height: 46px; color: #c7c7cc; }
        .mc-btn.main:hover:not(:disabled) { color: #fff; transform: scale(1.06); }

        /* original PNG icons for previous / play-pause / next */
        .mc-img img { object-fit: contain; display: block; pointer-events: none; }
        .mc-btn.mc-img { width: 44px; height: 44px; opacity: 0.85; }
        .mc-btn.mc-img:hover:not(:disabled) { background: rgba(255, 255, 255, 0.08); opacity: 1; }
        .mc-btn.mc-img img { width: 28px; height: 28px; filter: brightness(0) invert(1); }
        .mc-btn.main.mc-img { opacity: 1; }
        .mc-btn.main.mc-img:hover:not(:disabled) { background: none; transform: scale(1.08); }
        .mc-btn.main.mc-img img { width: 38px; height: 38px; filter: none; }

        /* idle (no song yet) */
        .player-mini.idle .mini-left .mc-btn { opacity: 0.55; }

        /* volume with hover slider */
        .vol-wrap { display: flex; align-items: center; }
        .vol-slider {
          width: 0; opacity: 0; margin: 0; cursor: pointer;
          transition: width 0.2s ease, opacity 0.2s ease;
          accent-color: #fff;
          height: 4px;
        }
        .vol-wrap:hover .vol-slider, .vol-slider:focus { width: 80px; opacity: 1; margin-right: 6px; }

        /* center */
        .mini-center {
          display: flex; align-items: center; justify-content: center; gap: 12px;
          min-width: 0; width: 100%; cursor: pointer;
          border-radius: 10px; padding: 4px; margin: -4px;
          transition: background 0.15s;
        }
        .mini-center:hover { background: rgba(255, 255, 255, 0.04); }
        .player-mini.idle .mini-center { cursor: default; }
        .player-mini.idle .mini-center:hover { background: none; }

        .mini-idle-logo { color: rgba(255, 255, 255, 0.6); display: inline-flex; }

        .mini-art {
          width: 40px; height: 40px; border-radius: 8px; object-fit: cover;
          flex-shrink: 0; background: #27272a;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        .mini-art-placeholder {
          width: 40px; height: 40px; border-radius: 8px; flex-shrink: 0;
          background: #27272a; color: rgba(255, 255, 255, 0.4);
          display: inline-flex; align-items: center; justify-content: center;
        }
        .mini-info { display: flex; flex-direction: column; justify-content: center; gap: 3px; flex: 1; min-width: 0; }
        .mini-title { font-size: 14px; font-weight: 600; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .mini-artist { font-size: 12px; color: var(--text-muted, #a1a1aa); line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        .progress-row { display: flex; align-items: center; gap: 8px; margin-top: 2px; }
        .progress-time { font-size: 11px; color: var(--text-muted, #a1a1aa); font-variant-numeric: tabular-nums; min-width: 32px; flex-shrink: 0; }
        .progress-time.right { text-align: right; }
        .progress-container {
          position: relative; flex: 1; height: 4px;
          background: var(--hover-bg, rgba(255, 255, 255, 0.12));
          border-radius: 999px; cursor: pointer;
        }
        .progress-fill {
          position: absolute; top: 0; left: 0; height: 100%;
          background: var(--text-main, #fff); border-radius: 999px; pointer-events: none;
          transition: background 0.15s;
        }
        .progress-container:hover .progress-fill { background: #1db954; }
        .progress-container input[type="range"] {
          position: absolute; inset: 0; width: 100%; height: 100%;
          opacity: 0; cursor: pointer; margin: 0;
        }

        /* ================= FULL-SCREEN PLAYER ================= */
        .player-full {
          position: fixed; inset: 0; z-index: 2000;
          display: flex; flex-direction: column;
          color: #fff;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          overflow: hidden;
          opacity: 0; visibility: hidden;
          transform: translateY(40px);
          transition: opacity 0.32s ease, transform 0.32s ease, visibility 0.32s;
        }
        .player-full.open { opacity: 1; visibility: visible; transform: translateY(0); }

        .player-full-bg {
          position: absolute; inset: -40px;
          background-size: cover; background-position: center;
          filter: blur(60px) saturate(180%) brightness(0.5);
          transform: scale(1.2);
          z-index: -2;
        }
        .player-full-overlay {
          position: absolute; inset: 0; z-index: -1;
          background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.9) 100%);
        }

        .full-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 24px; flex-shrink: 0;
        }
        .full-header-label {
          font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em;
          color: rgba(255, 255, 255, 0.7); font-weight: 500;
        }
        .full-close {
          background: rgba(255, 255, 255, 0.1);
          border: none; color: #fff; width: 40px; height: 40px;
          border-radius: 50%; cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center;
          transition: background 0.15s, transform 0.15s;
        }
        .full-close:hover { background: rgba(255, 255, 255, 0.2); }
        .full-close:active { transform: scale(0.92); }
        .full-close svg { display: block; }

        .full-body {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 0 24px;
          padding-bottom: 116px; /* clear of the always-visible mini player */
          min-height: 0;
          overflow: hidden;
        }

        .full-art-wrapper {
          width: min(78vw, 78vh, 420px);
          aspect-ratio: 1;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1);
          flex-shrink: 1;
          margin-bottom: 32px;
        }
        .full-art { width: 100%; height: 100%; object-fit: cover; display: block; }

        .full-info {
          width: 100%; max-width: 480px; text-align: left;
          margin-bottom: 20px;
        }
        .full-title {
          font-size: clamp(20px, 4vw, 26px);
          font-weight: 700; line-height: 1.2; letter-spacing: -0.02em;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin-bottom: 4px;
        }
        .full-artist {
          font-size: 15px; color: rgba(255, 255, 255, 0.7);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        .full-progress {
          width: 100%; max-width: 480px;
          display: flex; flex-direction: column; gap: 6px;
          margin-bottom: 28px;
        }
        .full-progress-container {
          position: relative; width: 100%; height: 4px;
          background: rgba(255, 255, 255, 0.25);
          border-radius: 999px;
        }
        .full-progress-fill {
          position: absolute; top: 0; left: 0; height: 100%;
          background: #fff; border-radius: 999px; pointer-events: none;
        }
        .full-progress-container input[type="range"] {
          position: absolute; inset: -8px 0; width: 100%; height: 20px;
          opacity: 0; cursor: pointer; margin: 0;
        }
        .full-progress-times {
          display: flex; justify-content: space-between;
          font-size: 12px; color: rgba(255, 255, 255, 0.7);
          font-variant-numeric: tabular-nums;
        }

        .full-controls {
          display: flex; align-items: center; justify-content: center;
          gap: 20px;
          width: 100%; max-width: 480px;
          margin-bottom: 24px;
        }
        .full-ctrl {
          background: none; border: none; padding: 0;
          cursor: pointer; width: 64px; height: 64px; border-radius: 50%;
          display: inline-flex; align-items: center; justify-content: center;
          transition: background 0.15s, transform 0.15s, opacity 0.15s;
          opacity: 0.9;
        }
        .full-ctrl:hover { background: rgba(255, 255, 255, 0.1); opacity: 1; }
        .full-ctrl:active { transform: scale(0.92); }
        .full-ctrl img { width: 40px; height: 40px; object-fit: contain; display: block; pointer-events: none; filter: brightness(0) invert(1); }

        .full-play-btn {
          background: none; border: none; padding: 0;
          width: 72px; height: 72px; border-radius: 50%;
          display: inline-flex; align-items: center; justify-content: center;
          cursor: pointer; transition: transform 0.15s;
        }
        .full-play-btn:hover { transform: scale(1.08); }
        .full-play-btn:active { transform: scale(0.94); }
        .full-play-btn img { width: 60px; height: 60px; object-fit: contain; display: block; pointer-events: none; }

        /* ================= RESPONSIVE ================= */
        @media (max-width: 1100px) {
          .player-mini { grid-template-columns: auto minmax(0, 1fr) auto; }
          .mini-left .hide-md, .mini-right .hide-md { display: none; }
        }

        @media (max-width: 640px) {
          .player-mini {
            left: 8px; right: 8px; bottom: 8px;
            transform: none; width: auto;
            height: 56px; padding: 0 14px;
            grid-template-columns: minmax(0, 1fr) auto; gap: 8px;
          }
          .mini-center { order: 1; justify-content: flex-start; gap: 10px; }
          .player-mini.idle .mini-center { justify-content: center; }
          .mini-left { order: 2; gap: 2px; }
          .mini-right { display: none; }
          .mini-left .hide-sm { display: none; }
          .mini-art, .mini-art-placeholder { width: 36px; height: 36px; border-radius: 6px; }
          .mini-info { gap: 2px; }
          .mini-title { font-size: 13px; }
          .mini-artist { font-size: 11px; }
          .progress-row { gap: 0; margin-top: 1px; }
          .progress-time { display: none; }
          .progress-container { height: 3px; }
          .mc-btn { width: 34px; height: 34px; }
          .mc-btn.mc-img { width: 38px; height: 38px; }
          .mc-btn.mc-img img { width: 24px; height: 24px; }
          .mc-btn.main.mc-img img { width: 32px; height: 32px; }

          .full-header { padding: 16px; }
          .full-body { padding-bottom: 88px; }
          .full-art-wrapper { width: min(80vw, 60vh, 340px); margin-bottom: 24px; }
          .full-controls { gap: 12px; margin-bottom: 16px; }
          .full-play-btn { width: 64px; height: 64px; }
          .full-play-btn img { width: 52px; height: 52px; }
          .full-ctrl { width: 54px; height: 54px; }
          .full-ctrl img { width: 34px; height: 34px; }
        }

        @media (max-width: 380px) {
          .player-mini { height: 52px; padding: 0 10px; }
          .full-body { padding-bottom: 84px; }
          .mini-art, .mini-art-placeholder { width: 32px; height: 32px; }
          .mc-btn { width: 30px; height: 30px; }
          .mc-btn.mc-img { width: 34px; height: 34px; }
          .mc-btn.mc-img img { width: 22px; height: 22px; }
          .mc-btn.main.mc-img img { width: 28px; height: 28px; }
          .full-art-wrapper { width: min(80vw, 45vh, 280px); }
        }
      `}</style>

      {/* ============ MINI PLAYER (always rendered on every page) ============ */}
      <div className={`player-mini ${hasTrack ? "" : "idle"}`}>
        {/* LEFT — transport controls */}
        <div className="mini-left">
          <button
            className={`mc-btn hide-sm hide-md ${shuffle ? "active" : ""}`}
            onClick={call(toggleShuffle)}
            aria-label="Shuffle"
            disabled={!hasTrack}
          >
            <I.Shuffle />
          </button>
          <button className="mc-btn mc-img" onClick={prev} aria-label="Previous" disabled={!hasTrack}>
            <img src="/fastbackwardicon.png" alt="" />
          </button>
          <button
            className="mc-btn main mc-img"
            onClick={playPause}
            aria-label={playing ? "Pause" : "Play"}
            disabled={!hasTrack}
          >
            <img src={playing ? "/pause_icon_transparent.png" : "/playicon.png"} alt="" />
          </button>
          <button className="mc-btn mc-img" onClick={next} aria-label="Next" disabled={!hasTrack}>
            <img src="/fastforwardicon.png" alt="" />
          </button>
          <button
            className={`mc-btn hide-sm hide-md ${repeat ? "active" : ""}`}
            onClick={call(toggleRepeat)}
            aria-label="Repeat"
            disabled={!hasTrack}
          >
            <I.Repeat />
          </button>
        </div>

        {/* CENTER — Apple logo when idle, now playing when a song is loaded */}
        <div
          className="mini-center"
          onClick={toggleExpanded}
          role={hasTrack ? "button" : undefined}
          tabIndex={hasTrack ? 0 : -1}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggleExpanded();
            }
          }}
          aria-label={hasTrack ? (expanded ? "Close full screen player" : "Open full screen player") : "Apple Music"}
        >
          {!hasTrack ? (
            <span className="mini-idle-logo" aria-hidden="true"><I.Apple /></span>
          ) : (
            <>
              {track.artwork ? (
                <img src={track.artwork} alt={`${track.title} artwork`} className="mini-art" />
              ) : (
                <div className="mini-art-placeholder" aria-hidden="true"><I.NoteArt /></div>
              )}
              <div className="mini-info">
                <div className="mini-title">{track.title}</div>
                <div className="mini-artist">{track.artist}</div>
                <div className="progress-row">
                  <span className="progress-time">{fmt(currentTime)}</span>
                  <div className="progress-container" onClick={(e) => e.stopPropagation()}>
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                    <input
                      type="range" min="0" max={duration || 0} step="0.1"
                      value={currentTime || 0}
                      onChange={(e) => seek(Number(e.target.value))}
                      aria-label="Seek"
                    />
                  </div>
                  <span className="progress-time right">{fmt(duration)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* RIGHT — lyrics, queue, volume */}
        <div className="mini-right">
          <button className="mc-btn hide-md" onClick={call(toggleLyrics)} aria-label="Lyrics">
            <I.Lyrics />
          </button>
          <button className="mc-btn hide-md" onClick={call(toggleQueue)} aria-label="Queue">
            <I.Queue />
          </button>
          <div className="vol-wrap">
            {typeof setVolume === "function" && (
              <input
                className="vol-slider"
                type="range" min="0" max="1" step="0.01"
                value={typeof volume === "number" ? volume : 1}
                onChange={(e) => setVolume(Number(e.target.value))}
                aria-label="Volume"
              />
            )}
            <button className="mc-btn" aria-label="Volume">
              <I.Volume />
            </button>
          </div>
        </div>
      </div>

      {/* ============ FULL-SCREEN PLAYER (only when a track exists) ============ */}
      {hasTrack && (
        <div className={`player-full ${expanded ? "open" : ""}`} aria-hidden={!expanded}>
          <div className="player-full-bg" style={{ backgroundImage: `url(${track.artwork})` }} />
          <div className="player-full-overlay" />

          <div className="full-header">
            <span className="full-header-label">Now Playing</span>
            <button className="full-close" onClick={() => setExpanded(false)} aria-label="Close full screen player">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>

          <div className="full-body">
            <div className="full-art-wrapper">
              <img src={track.artwork} alt={`${track.title} artwork`} className="full-art" />
            </div>

            <div className="full-info">
              <div className="full-title">{track.title}</div>
              <div className="full-artist">{track.artist}</div>
            </div>

            <div className="full-progress">
              <div className="full-progress-container">
                <div className="full-progress-fill" style={{ width: `${progress}%` }} />
                <input
                  type="range" min="0" max={duration || 0} step="0.1"
                  value={currentTime || 0}
                  onChange={(e) => seek(Number(e.target.value))}
                  aria-label="Seek"
                />
              </div>
              <div className="full-progress-times">
                <span>{fmt(currentTime)}</span>
                <span>{fmt(duration)}</span>
              </div>
            </div>

            <div className="full-controls">
              <button className="full-ctrl" onClick={prev} aria-label="Previous">
                <img src="/fastbackwardicon.png" alt="" />
              </button>
              <button className="full-play-btn" onClick={playPause} aria-label={playing ? "Pause" : "Play"}>
                <img src={playing ? "/pause_icon_transparent.png" : "/playicon.png"} alt="" />
              </button>
              <button className="full-ctrl" onClick={next} aria-label="Next">
                <img src="/fastforwardicon.png" alt="" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}