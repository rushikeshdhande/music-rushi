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
    if (!current && expanded) setExpanded(false);
  }, [current, expanded]);

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

  const hasTrack = !!current;
  const progress = hasTrack ? Math.min(100, Math.max(0, (currentTime / (duration || 1)) * 100)) : 0;

  return (
    <>
      <style>{`
        /* ================= MINI PLAYER ================= */
        .player-mini {
          position: fixed; bottom: 20px;
          left: calc(50% + (var(--sidebar-width, 0px) / 2));
          transform: translateX(-50%);
          width: calc(100% - var(--sidebar-width, 0px) - 48px);
          max-width: 820px; height: 76px; padding: 0 24px;
          display: grid; align-items: center; gap: 20px;
          background: var(--player-bg, rgba(24, 24, 27, 0.72));
          backdrop-filter: blur(24px) saturate(140%);
          -webkit-backdrop-filter: blur(24px) saturate(140%);
          border-radius: 38px;
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.06);
          z-index: 1000; color: var(--text-main, #f5f5f7);
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          transition: all 0.3s ease;
        }
        .player-mini.hidden { opacity: 0; pointer-events: none; transform: translateX(-50%) translateY(20px); }

        /* Layouts */
        .player-mini.idle { grid-template-columns: 1fr auto 1fr; }
        .player-mini.active { grid-template-columns: auto 1fr; }

        /* Icons & Buttons */
        .icon-btn, .play-btn {
          background: none; border: none; padding: 0; cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center;
          transition: opacity 0.15s, transform 0.15s;
        }
        .icon-btn:hover, .icon-btn:hover .idle-svg { opacity: 1; transform: scale(1.08); }
        .play-btn:hover { transform: scale(1.08); }
        
        .icon-btn img { width: 22px; height: 22px; filter: brightness(0) invert(1); opacity: 0.8; } 
        .idle-svg { width: 22px; height: 22px; filter: brightness(0) invert(1); opacity: 0.8; }
        .play-btn img { width: 32px; height: 32px; }
        
        .mini-controls { display: flex; align-items: center; gap: 8px; }
        .idle-extras { display: none; }
        .player-mini.idle .idle-extras { display: inline-flex; }
        .player-mini.idle .mini-controls { gap: 14px; }
        .player-mini.idle .icon-btn, .player-mini.idle .play-btn { pointer-events: none; }

        /* Idle Center Logo (desktop) */
        .idle-logo { display: flex; justify-content: center; opacity: 0.8; }
        .idle-logo svg { width: 24px; height: 24px; fill: currentColor; }

        /* Mobile-only idle artwork (hidden on desktop) */
        .idle-art-mobile { display: none; }

        /* Idle speaker icon */
        .idle-speaker { display: flex; justify-content: flex-end; }

        /* Active Info */
        .mini-center { display: flex; align-items: center; gap: 14px; min-width: 0; cursor: pointer; }
        .mini-art { width: 52px; height: 52px; border-radius: 8px; object-fit: cover; background: #27272a; }
        .mini-info { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 0; }
        .mini-title { font-size: 15px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .mini-artist { font-size: 13px; color: var(--text-muted, #a1a1aa); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        /* Progress */
        .progress-row { display: flex; align-items: center; gap: 8px; margin-top: 2px; }
        .progress-time { font-size: 11px; color: var(--text-muted, #a1a1aa); min-width: 32px; }
        .progress-time.right { text-align: right; }
        .progress-container { position: relative; flex: 1; height: 4px; background: rgba(255,255,255,0.12); border-radius: 999px; cursor: pointer; }
        .progress-fill { position: absolute; top: 0; left: 0; height: 100%; background: #fff; border-radius: 999px; pointer-events: none; }
        .progress-container input { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }

        /* ================= FULL-SCREEN PLAYER (UNCHANGED) ================= */
        .player-full { position: fixed; inset: 0; z-index: 2000; display: flex; flex-direction: column; overflow: hidden; color: #fff; opacity: 0; visibility: hidden; transform: translateY(40px); transition: all 0.32s ease; }
        .player-full.open { opacity: 1; visibility: visible; transform: translateY(0); }
        .player-full-bg { position: absolute; inset: -40px; background-size: cover; background-position: center; filter: blur(60px) brightness(0.55); transform: scale(1.2); z-index: -2; }
        .player-full-overlay { position: absolute; inset: 0; z-index: -1; background: linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.85)); }

        .full-header { display: flex; justify-content: space-between; padding: 20px 24px; }
        .full-close { background: rgba(255,255,255,0.1); border: none; color: #fff; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .full-body { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0 24px; }
        .full-art-wrapper { width: min(78vw, 78vh, 420px); aspect-ratio: 1; border-radius: 16px; overflow: hidden; margin-bottom: 32px; box-shadow: 0 24px 60px rgba(0,0,0,0.6); }
        .full-art { width: 100%; height: 100%; object-fit: cover; }
        .full-info { width: 100%; max-width: 480px; text-align: left; margin-bottom: 20px; }
        .full-title { font-size: 26px; font-weight: 700; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .full-artist { font-size: 15px; color: rgba(255,255,255,0.7); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        .full-controls { display: flex; align-items: center; justify-content: center; gap: 24px; margin-top: 24px; }

        /* ================= MOBILE (MINI PLAYER ONLY) ================= */
        @media (max-width: 640px) {
          .player-mini {
            left: 8px; right: 8px; bottom: 8px;
            transform: none; width: auto;
            height: 64px; padding: 0 12px;
            border-radius: 32px;
            gap: 10px;
          }
          .player-mini.hidden { transform: translateY(20px); }

          /* Active: [art] [title/artist] [play][next] */
          .player-mini.active { grid-template-columns: auto 1fr auto; }
          /* Idle: [logo art] [spacer] [play][next] */
          .player-mini.idle { grid-template-columns: auto 1fr auto; }

          /* Hide desktop-only idle pieces on mobile */
          .idle-logo { display: none; }
          .idle-extras { display: none !important; }
          .idle-speaker { display: none; }

          /* Mobile idle artwork shows */
          .idle-art-mobile {
            display: flex; align-items: center; justify-content: center;
            width: 44px; height: 44px; border-radius: 8px;
            background: #27272a;
          }
          .idle-art-mobile svg { width: 26px; height: 26px; fill: #f5f5f7; opacity: 0.9; }

          /* Hide the desktop mini-controls container on mobile so we control order */
          .mini-controls { display: none; }

          /* Compact active artwork + text */
          .mini-art { width: 44px; height: 44px; border-radius: 8px; }
          .mini-center { gap: 10px; }
          .mini-title { font-size: 14px; }
          .mini-artist { font-size: 12px; }

          /* Hide progress + times on mobile */
          .progress-row { display: none; }

          /* Mobile right-side controls — icons keep FULL size */
          .mobile-controls {
            display: flex; align-items: center; gap: 10px;
            justify-self: end;
            flex-shrink: 0;
          }
          .mobile-controls .play-btn img { width: 32px; height: 32px; }
          .mobile-controls .icon-btn img { width: 22px; height: 22px; }
        }

        /* Hide mobile-only controls on desktop */
        @media (min-width: 641px) {
          .mobile-controls { display: none; }
          .idle-art-mobile { display: none !important; }
        }
      `}</style>

      {/* ============ MINI PLAYER ============ */}
      <div className={`player-mini ${expanded ? "hidden" : ""} ${hasTrack ? "active" : "idle"}`}>
        
        {/* Desktop controls (hidden on mobile) */}
        <div className="mini-controls">
          <button className="icon-btn idle-extras">
            <svg className="idle-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>
          </button>
          <button className="icon-btn" onClick={prev} disabled={!hasTrack}>
            <img src="/fastbackwardicon.png" alt="Prev" />
          </button>
          <button className="play-btn" onClick={playPause} disabled={!hasTrack}>
            <img src={playing ? "/pause_icon_transparent.png" : "/playicon.png"} alt="Play" />
          </button>
          <button className="icon-btn" onClick={next} disabled={!hasTrack}>
            <img src="/fastforwardicon.png" alt="Next" />
          </button>
          <button className="icon-btn idle-extras">
            <svg className="idle-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3"/></svg>
          </button>
        </div>

        {hasTrack ? (
          <div className="mini-center" onClick={() => setExpanded(true)}>
            <img src={current.artwork} alt="Art" className="mini-art" />
            <div className="mini-info">
              <div className="mini-title">{current.title}</div>
              <div className="mini-artist">{current.artist}</div>
              <div className="progress-row">
                <span className="progress-time">{fmt(currentTime)}</span>
                <div className="progress-container" onClick={(e) => e.stopPropagation()}>
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                  <input type="range" min="0" max={duration || 0} step="0.1" value={currentTime || 0} onChange={(e) => seek(Number(e.target.value))} />
                </div>
                <span className="progress-time right">{fmt(duration)}</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop idle center logo */}
            <div className="idle-logo">
              <svg viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            </div>
            <div className="idle-speaker">
              <svg className="idle-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14"/></svg>
            </div>

            {/* Mobile-only idle artwork (default look) */}
            <div className="idle-art-mobile">
              <svg viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            </div>
          </>
        )}

        {/* Mobile right-side controls: play/pause + forward (full-size icons) */}
        <div className="mobile-controls">
          <button className="play-btn" onClick={playPause} disabled={!hasTrack}>
            <img src={playing ? "/pause_icon_transparent.png" : "/playicon.png"} alt="Play" />
          </button>
          <button className="icon-btn" onClick={next} disabled={!hasTrack}>
            <img src="/fastforwardicon.png" alt="Next" />
          </button>
        </div>
      </div>

      {/* ============ FULL-SCREEN PLAYER (UNCHANGED) ============ */}
      {hasTrack && (
        <div className={`player-full ${expanded ? "open" : ""}`}>
          <div className="player-full-bg" style={{ backgroundImage: `url(${current.artwork})` }} />
          <div className="player-full-overlay" />
          
          <div className="full-header">
            <span>Now Playing</span>
            <button className="full-close" onClick={() => setExpanded(false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
          </div>

          <div className="full-body">
            <div className="full-art-wrapper"><img src={current.artwork} alt="Art" className="full-art" /></div>
            <div className="full-info">
              <div className="full-title">{current.title}</div>
              <div className="full-artist">{current.artist}</div>
            </div>
            
            <div className="progress-container" style={{ width: "100%", maxWidth: "480px", height: "6px" }}>
              <div className="progress-fill" style={{ width: `${progress}%` }} />
              <input type="range" min="0" max={duration || 0} step="0.1" value={currentTime || 0} onChange={(e) => seek(Number(e.target.value))} />
            </div>

            <div className="full-controls">
              <button className="icon-btn" onClick={prev}><img src="/fastbackwardicon.png" alt="Prev" style={{ width: 44, height: 44 }} /></button>
              <button className="play-btn" onClick={playPause}><img src={playing ? "/pause_icon_transparent.png" : "/playicon.png"} alt="Play" style={{ width: 72, height: 72 }} /></button>
              <button className="icon-btn" onClick={next}><img src="/fastforwardicon.png" alt="Next" style={{ width: 44, height: 44 }} /></button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}