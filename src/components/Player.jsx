import { useState, useEffect, useRef } from "react";
import { usePlayer } from "../contexts/PlayerContext";

const fmt = (s) => {
  if (!isFinite(s) || s < 0) return "0:00";
  return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
};

// Helper to extract the dominant color from the image
const useDominantColor = (imgUrl) => {
  const [color, setColor] = useState("rgba(30, 30, 34, 0.8)");
  useEffect(() => {
    if (!imgUrl) return;
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imgUrl;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = 1;
      canvas.height = 1;
      ctx.drawImage(img, 0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      // Darken the color slightly so white text pops
      setColor(`rgba(${Math.floor(r * 0.6)}, ${Math.floor(g * 0.6)}, ${Math.floor(b * 0.6)}, 1)`);
    };
  }, [imgUrl]);
  return color;
};

const Ti = ({ children }) => <svg className="ti" viewBox="0 0 24 24">{children}</svg>;
const ROUND = { stroke: "currentColor", strokeWidth: 2, strokeLinejoin: "round" };
const LINE = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" };

const Icons = {
  Play: () => <Ti><path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l11.1-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14z" /></Ti>,
  Pause: () => <Ti><rect x="5.5" y="4.5" width="4.6" height="15" rx="1.4" /><rect x="13.9" y="4.5" width="4.6" height="15" rx="1.4" /></Ti>,
  Next: () => <Ti><path d="M3.5 6.5v11l8-5.5zM12.5 6.5v11l8-5.5z" {...ROUND} /></Ti>,
  Prev: () => <Ti><path d="M20.5 6.5v11l-8-5.5zM11.5 6.5v11l-8-5.5z" {...ROUND} /></Ti>,
  VolLow: () => <Ti><path d="M11 5 6 9H2v6h4l5 4z" /></Ti>,
  VolHigh: () => <Ti><path d="M11 5 6 9H2v6h4l5 4z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" {...LINE} /></Ti>,
  Queue: () => <Ti><circle cx="4" cy="6" r="1.6" /><circle cx="4" cy="12" r="1.6" /><circle cx="4" cy="18" r="1.6" /><path d="M9 6h12M9 12h12M9 18h12" {...LINE} /></Ti>,
  Note: () => <Ti><circle cx="7" cy="18" r="3.2" /><circle cx="18" cy="16" r="3.2" /><rect x="8.2" y="5" width="2" height="13" /><rect x="19.2" y="3" width="2" height="13" /><path d="M8.2 5.5 21.2 3v4.2L8.2 9.7z" /></Ti>,
  Star: () => <Ti><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></Ti>,
  Dots: () => <Ti><circle cx="5" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="19" cy="12" r="2" fill="currentColor"/></Ti>
};

const PlayBtn = ({ playing, ...p }) => (
  <button className="play-btn" aria-label={playing ? "Pause" : "Play"} {...p}>{playing ? <Icons.Pause /> : <Icons.Play />}</button>
);
const SkipBtn = ({ dir, ...p }) => (
  <button className="icon-btn" aria-label={dir === "prev" ? "Previous" : "Next"} {...p}>{dir === "prev" ? <Icons.Prev /> : <Icons.Next />}</button>
);

export default function Player() {
  const { current, playing, currentTime, duration, playPause, next, prev, seek } = usePlayer();
  const [expanded, setExpanded] = useState(false);
  const themeColor = useDominantColor(current?.artwork);

  useEffect(() => { if (!current && expanded) setExpanded(false); }, [current, expanded]);
  useEffect(() => {
    document.body.style.overflow = expanded ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [expanded]);
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e) => e.key === "Escape" && setExpanded(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

  const hasTrack = !!current, off = !hasTrack;
  const progress = hasTrack ? Math.min(100, Math.max(0, (currentTime / (duration || 1)) * 100)) : 0;
  const remaining = duration ? `-${fmt(Math.max(0, duration - currentTime))}` : "-0:00";

  return (
    <>
      <style>{`
        .player-mini{position:fixed;bottom:18px;left:calc(50% + var(--sidebar-width,0px)/2);transform:translateX(-50%);width:calc(100% - var(--sidebar-width,0px) - 48px);max-width:820px;height:64px;padding:0 20px;display:grid;align-items:center;gap:18px;background:var(--player-bg,rgba(24,24,27,.72));backdrop-filter:blur(24px) saturate(140%);-webkit-backdrop-filter:blur(24px) saturate(140%);border-radius:32px;border:1px solid var(--border-color,rgba(255,255,255,.08));box-shadow:0 12px 40px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.06);z-index:1000;color:var(--text-main,#f5f5f7);font-family:'Inter',system-ui,sans-serif;transition:all .3s ease}
        .player-mini.hidden{opacity:0;pointer-events:none;transform:translateX(-50%) translateY(20px)}
        .player-mini.idle{grid-template-columns:1fr auto 1fr}
        .player-mini.active{grid-template-columns:auto 1fr}
        .icon-btn,.play-btn{background:none;border:none;padding:0;cursor:pointer;color:inherit;display:inline-flex;align-items:center;justify-content:center;transition:opacity .15s,transform .15s}
        .icon-btn:hover,.play-btn:hover{transform:scale(1.08)}
        .icon-btn:disabled,.play-btn:disabled{opacity:.4;cursor:default}
        .ti{width:26px;height:26px;fill:currentColor}
        .icon-btn .ti{opacity:.85}
        .play-btn .ti{width:32px;height:32px}
        .idle-svg{width:20px;height:20px;filter:brightness(0) invert(1);opacity:.8}
        .mini-controls{display:flex;align-items:center;gap:8px}
        .idle-extras{display:none}
        .player-mini.idle .idle-extras{display:inline-flex}
        .player-mini.idle .mini-controls{gap:14px}
        .player-mini.idle .icon-btn,.player-mini.idle .play-btn{pointer-events:none}
        .idle-logo{display:flex;justify-content:center;opacity:.8}
        .idle-logo svg{width:22px;height:22px;fill:currentColor}
        .idle-art-mobile{display:none}
        .idle-speaker{display:flex;justify-content:flex-end}
        .mini-center{display:flex;align-items:center;gap:12px;min-width:0;cursor:pointer}
        .mini-art{width:44px;height:44px;border-radius:7px;object-fit:cover;background:#27272a;flex-shrink:0}
        .mini-info{display:flex;flex-direction:column;gap:3px;flex:1;min-width:0}
        .mini-title{font-size:14px;font-weight:500;letter-spacing:-.1px;color:var(--text-main,#f5f5f7);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .mini-artist{font-size:14px;font-weight:500;letter-spacing:-.1px;color:var(--text-muted,#a1a1aa);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .progress-row{display:flex;align-items:center;gap:8px;margin-top:3px}
        .progress-time{font-size:10px;color:var(--text-muted,#a1a1aa);min-width:30px}
        .progress-time.right{text-align:right}
        .progress-container{position:relative;flex:1;height:3px;background:rgba(255,255,255,.12);border-radius:999px;cursor:pointer}
        .progress-fill{position:absolute;top:0;left:0;height:100%;background:#fff;border-radius:999px;pointer-events:none}
        .progress-container input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer}
        
        /* FULL SCREEN PLAYER (Apple Music Layout) */
        .player-full{position:fixed;inset:0;z-index:2000;display:flex;flex-direction:column;overflow:hidden;color:#fff;opacity:0;visibility:hidden;transform:translateY(40px);transition:opacity .32s ease, visibility .32s ease, transform .32s ease;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#000}
        .player-full.open{opacity:1;visibility:visible;transform:translateY(0)}
        
        /* Radiant color background based on song art */
        .player-full-bg{position:absolute;inset:0;z-index:-2;background:radial-gradient(ellipse at top, var(--theme-color) 0%, #000 65%);transition:background 0.8s ease;}
        .player-full-overlay{position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(0,0,0,0.1) 0%,rgba(0,0,0,0.8) 100%)}
        
        .full-header{display:flex;justify-content:center;align-items:center;padding:16px;padding-top:max(16px, env(safe-area-inset-top))}
        .full-close{background:rgba(255,255,255,.15);border:none;color:#fff;width:32px;height:32px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
        .full-close svg{width:18px;height:18px}
        
        .full-body{flex:1;display:flex;flex-direction:column;padding:0 24px 32px;width:100%;max-width:480px;margin:0 auto;justify-content:center}
        
        /* Album Art (Large square) */
        .full-art-wrapper{width:100%;aspect-ratio:1;border-radius:12px;overflow:hidden;margin:0 auto 32px;box-shadow:0 20px 60px rgba(0,0,0,0.6);background:#27272a}
        .full-art{width:100%;height:100%;object-fit:cover}
        
        /* Title / Artist Info */
        .full-info{width:100%;text-align:left;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center}
        .full-text-content{flex:1;min-width:0;padding-right:16px}
        .full-title{font-size:22px;font-weight:700;margin-bottom:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-0.3px}
        .full-artist{font-size:16px;color:rgba(255,255,255,.65);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        
        /* Action Buttons (Star, Dots) */
        .full-actions{display:flex;gap:16px;align-items:center}
        .full-actions button{background:rgba(255,255,255,.1);border:none;color:#fff;width:36px;height:36px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.2s}
        .full-actions button:hover{background:rgba(255,255,255,.2)}
        .full-actions svg{width:18px;height:18px;opacity:0.9}
        
        /* Progress Bar */
        .full-progress-area{width:100%;margin-bottom:28px}
        .full-progress-bar{position:relative;width:100%;height:6px;background:rgba(255,255,255,.2);border-radius:4px;cursor:pointer}
        .full-progress-fill{position:absolute;top:0;left:0;height:100%;background:rgba(255,255,255,.9);border-radius:4px;pointer-events:none}
        .full-progress-bar input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer}
        .full-time-labels{display:flex;justify-content:space-between;margin-top:10px;font-size:12px;color:rgba(255,255,255,.55);font-variant-numeric:tabular-nums}
        
        /* Controls (Prev, Play, Next) */
        .full-controls{display:flex;align-items:center;justify-content:space-between;padding:0 16px;margin-bottom:32px}
        .full-controls .ti{width:48px;height:48px;filter:drop-shadow(0 4px 12px rgba(0,0,0,0.3))}
        .full-controls .icon-btn .ti{opacity:.95}
        .full-controls .play-btn .ti{width:64px;height:64px}
        
        /* Volume & Queue */
        .full-bottom{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 8px;margin-bottom:24px}
        .full-bottom .ti{width:24px;height:24px;opacity:.6;flex-shrink:0}
        .full-volume-bar{flex:1;height:6px;background:rgba(255,255,255,.2);border-radius:4px;position:relative}
        .full-volume-fill{position:absolute;top:0;left:0;height:100%;background:rgba(255,255,255,.9);border-radius:4px;width:50%}
        
        .full-queue{display:flex;justify-content:center;padding-bottom:max(16px, env(safe-area-inset-bottom))}
        .full-queue .ti{width:28px;height:28px;opacity:.7}
        
        @media(max-width:640px){
          .player-mini{left:8px;right:8px;bottom:8px;transform:none;width:auto;height:56px;padding:0 12px;border-radius:28px;gap:10px}
          .player-mini.hidden{transform:translateY(20px)}
          .player-mini.active,.player-mini.idle{grid-template-columns:auto 1fr auto}
          .idle-logo,.idle-extras,.idle-speaker{display:none!important}
          .idle-art-mobile{display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:7px;background:#27272a}
          .idle-art-mobile svg{width:24px;height:24px;fill:#f5f5f7;opacity:.9}
          .mini-controls{display:none}
          .mini-art{width:40px;height:40px;border-radius:7px}
          .mini-center{gap:10px}
          .mini-title,.mini-artist{font-size:13px;font-weight:500}
          .progress-row{display:none}
          .mobile-controls{display:flex;align-items:center;gap:8px;justify-self:end;flex-shrink:0}
          .mobile-controls .ti{width:28px;height:28px}
          .mobile-controls .play-btn .ti{width:30px;height:30px}
          
          .full-body{padding:0 20px 20px}
          .full-art-wrapper{margin-bottom:24px}
          .full-title{font-size:20px}
          .full-artist{font-size:15px}
        }
        @media(min-width:641px){.mobile-controls{display:none}.idle-art-mobile{display:none!important}}
      `}</style>

      <div className={`player-mini ${expanded ? "hidden" : ""} ${hasTrack ? "active" : "idle"}`}>
        <div className="mini-controls">
          <button className="icon-btn idle-extras"><svg className="idle-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg></button>
          <SkipBtn dir="prev" onClick={prev} disabled={off} />
          <PlayBtn playing={playing} onClick={playPause} disabled={off} />
          <SkipBtn dir="next" onClick={next} disabled={off} />
          <button className="icon-btn idle-extras"><svg className="idle-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3"/></svg></button>
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
            <div className="idle-logo"><Icons.Note /></div>
            <div className="idle-speaker"><svg className="idle-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14"/></svg></div>
            <div className="idle-art-mobile"><Icons.Note /></div>
          </>
        )}

        <div className="mobile-controls">
          <PlayBtn playing={playing} onClick={playPause} disabled={off} />
          <SkipBtn dir="next" onClick={next} disabled={off} />
        </div>
      </div>

      {hasTrack && (
        <div className={`player-full ${expanded ? "open" : ""}`}>
          {/* The background color is injected here via CSS variable */}
          <div className="player-full-bg" style={{ "--theme-color": themeColor }} />
          <div className="player-full-overlay" />

          <div className="full-header">
            <button className="full-close" onClick={() => setExpanded(false)} aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
          </div>

          <div className="full-body">
            <div className="full-art-wrapper">
              <img src={current.artwork} alt="Art" className="full-art" />
            </div>

            <div className="full-info">
              <div className="full-text-content">
                <div className="full-title">{current.title}</div>
                <div className="full-artist">{current.artist}</div>
              </div>
              <div className="full-actions">
                <button aria-label="Favorite"><Icons.Star /></button>
                <button aria-label="More"><Icons.Dots /></button>
              </div>
            </div>

            <div className="full-progress-area">
              <div className="full-progress-bar">
                <div className="full-progress-fill" style={{ width: `${progress}%` }} />
                <input type="range" min="0" max={duration || 0} step="0.1" value={currentTime || 0} onChange={(e) => seek(Number(e.target.value))} />
              </div>
              <div className="full-time-labels">
                <span>{fmt(currentTime)}</span>
                <span>{remaining}</span>
              </div>
            </div>

            <div className="full-controls">
              <SkipBtn dir="prev" onClick={prev} />
              <PlayBtn playing={playing} onClick={playPause} />
              <SkipBtn dir="next" onClick={next} />
            </div>

            <div className="full-bottom">
              <Icons.VolLow />
              <div className="full-volume-bar"><div className="full-volume-fill" /></div>
              <Icons.VolHigh />
            </div>

            <div className="full-queue"><Icons.Queue /></div>
          </div>
        </div>
      )}
    </>
  );
}