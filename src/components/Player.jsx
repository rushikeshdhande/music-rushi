import { useState, useEffect } from "react";
import { usePlayer } from "../contexts/PlayerContext";

const fmt = (s) => {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
};

export default function Player() {
  const { current, playing, currentTime, duration, playPause, next, prev, seek } = usePlayer();
  const [expanded, setExpanded] = useState(false);

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

  if (!current) return null;

  const progress = Math.min(100, Math.max(0, (currentTime / (duration || 1)) * 100));

  return (
    <>
      <style>{`
        /* ================= MINI PLAYER ================= */
        .player-mini {
          position: fixed;
          bottom: 20px;
          left: calc(50% + (var(--sidebar-width, 0px) / 2));
          transform: translateX(-50%);
          width: calc(100% - var(--sidebar-width, 0px) - 48px);
          max-width: 820px;
          height: 76px;
          padding: 0 18px;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 20px;
          background: var(--player-bg, rgba(24, 24, 27, 0.72));
          backdrop-filter: blur(24px) saturate(140%);
          -webkit-backdrop-filter: blur(24px) saturate(140%);
          border-radius: 0px;
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.06);
          z-index: 3000; /* ABOVE the full-screen player (2000) */
          color: var(--text-main, #f5f5f7);
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          transition: background 0.3s ease, border-color 0.3s ease;
        }

        /* ===== Control cluster: prev | play | next ===== */
        .mini-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .icon-btn {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s, transform 0.15s, opacity 0.15s;
          opacity: 0.85;
        }
        .icon-btn:hover { background: rgba(255, 255, 255, 0.08); opacity: 1; }
        .icon-btn:active { transform: scale(0.92); }
        .icon-btn img {
          width: 28px;
          height: 28px;
          object-fit: contain;
          display: block;
          pointer-events: none;
          filter: brightness(0) invert(1);
        }

        .play-btn {
          background: none;
          border: none;
          padding: 0;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.15s, opacity 0.15s;
        }
        .play-btn:hover { transform: scale(1.08); }
        .play-btn:active { transform: scale(0.94); }
        .play-btn img {
          width: 38px;
          height: 38px;
          object-fit: contain;
          display: block;
          pointer-events: none;
        }

        .mini-center {
          display: flex; align-items: center; gap: 12px;
          min-width: 0; width: 100%;
          cursor: pointer;
          border-radius: 10px;
          padding: 4px;
          margin: -4px;
          transition: background 0.15s;
        }
        .mini-center:hover { background: rgba(255, 255, 255, 0.04); }
        .mini-art {
          width: 48px; height: 48px; border-radius: 8px; object-fit: cover;
          flex-shrink: 0; background: #27272a;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        .mini-info { display: flex; flex-direction: column; justify-content: center; gap: 4px; flex: 1; min-width: 0; }
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
          filter: blur(60px) saturate(180%) brightness(0.55);
          transform: scale(1.2);
          z-index: -2;
        }
        .player-full-overlay {
          position: absolute; inset: 0; z-index: -1;
          background: linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.65) 60%, rgba(0,0,0,0.85) 100%);
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
          min-height: 0;
          overflow: hidden;
        }
        .full-art-wrapper {
          width: min(78vw, 78vh, 420px);
          aspect-ratio: 1;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
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

        /* ===== Full-screen control cluster: prev | play | next ===== */
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
        .full-ctrl img {
          width: 40px;
          height: 40px;
          object-fit: contain;
          display: block;
          pointer-events: none;
          filter: brightness(0) invert(1);
        }

        .full-play-btn {
          background: none;
          border: none;
          padding: 0;
          width: 72px;
          height: 72px;
          border-radius: 50%;
          display: inline-flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: transform 0.15s;
        }
        .full-play-btn:hover { transform: scale(1.08); }
        .full-play-btn:active { transform: scale(0.94); }
        .full-play-btn img {
          width: 60px;
          height: 60px;
          object-fit: contain;
          display: block;
          pointer-events: none;
        }

        /* ================= RESPONSIVE ================= */
        @media (max-width: 640px) {
          .player-mini {
            left: 8px; right: 8px; bottom: 8px;
            transform: none; width: auto;
            height: 64px; padding: 0 12px;
            border-radius: 14px;
            grid-template-columns: 1fr auto; gap: 8px;
            overflow: hidden;
          }
          .mini-center { gap: 10px; }
          .mini-art { width: 42px; height: 42px; border-radius: 6px; }
          .mini-info { gap: 2px; }
          .mini-title { font-size: 13px; }
          .mini-artist { font-size: 11px; }
          .progress-row { gap: 0; margin-top: 1px; }
          .progress-time { display: none; }
          .progress-container { height: 3px; }
          .mini-controls { gap: 4px; }
          .icon-btn { width: 38px; height: 38px; }
          .icon-btn img { width: 24px; height: 24px; }
          .play-btn { width: 38px; height: 38px; }
          .play-btn img { width: 32px; height: 32px; }

          .full-header { padding: 16px; }
          .full-art-wrapper { width: min(80vw, 60vh, 340px); margin-bottom: 24px; }
          .full-controls { gap: 12px; margin-bottom: 16px; }
          .full-play-btn { width: 64px; height: 64px; }
          .full-play-btn img { width: 52px; height: 52px; }
          .full-ctrl { width: 54px; height: 54px; }
          .full-ctrl img { width: 34px; height: 34px; }
        }

        @media (max-width: 380px) {
          .player-mini { height: 60px; padding: 0 10px; }
          .mini-art { width: 38px; height: 38px; }
          .icon-btn { width: 34px; height: 34px; }
          .icon-btn img { width: 22px; height: 22px; }
          .play-btn { width: 34px; height: 34px; }
          .play-btn img { width: 28px; height: 28px; }
          .full-art-wrapper { width: min(80vw, 45vh, 280px); }
        }
      `}</style>

      {/* ============ MINI PLAYER (always visible, sits above the full player) ============ */}
      <div className="player-mini">
        <div className="mini-controls">
          <button className="icon-btn" onClick={prev} aria-label="Previous">
            <img src="/fastbackwardicon.png" alt="" />
          </button>
          <button className="play-btn" onClick={playPause} aria-label={playing ? "Pause" : "Play"}>
            <img
              src={playing ? "/pause_icon_transparent.png" : "/playicon.png"}
              alt=""
            />
          </button>
          <button className="icon-btn" onClick={next} aria-label="Next">
            <img src="/fastforwardicon.png" alt="" />
          </button>
        </div>

        <div
          className="mini-center"
          onClick={() => setExpanded(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setExpanded(true); } }}
          aria-label="Open full screen player"
        >
          <img src={current.artwork} alt={`${current.title} artwork`} className="mini-art" />
          <div className="mini-info">
            <div className="mini-title">{current.title}</div>
            <div className="mini-artist">{current.artist}</div>
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
        </div>
      </div>

      {/* ============ FULL-SCREEN PLAYER ============ */}
      <div className={`player-full ${expanded ? "open" : ""}`} aria-hidden={!expanded}>
        <div className="player-full-bg" style={{ backgroundImage: `url(${current.artwork})` }} />
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
            <img src={current.artwork} alt={`${current.title} artwork`} className="full-art" />
          </div>

          <div className="full-info">
            <div className="full-title">{current.title}</div>
            <div className="full-artist">{current.artist}</div>
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
              <img
                src={playing ? "/pause_icon_transparent.png" : "/playicon.png"}
                alt=""
              />
            </button>
            <button className="full-ctrl" onClick={next} aria-label="Next">
              <img src="/fastforwardicon.png" alt="" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}