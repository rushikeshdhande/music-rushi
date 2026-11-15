import { useState, useEffect, useRef } from "react";
import { usePlayer } from "../contexts/PlayerContext";

const fmt = (s) => {
  if (!isFinite(s) || s < 0) return "0:00";
  return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
};

/* ── Icons ── */
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
  Dots: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>,
  Chevron: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>,
  Share: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>,
  Link: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [volume, setVolume] = useState(50);
  const menuRef = useRef(null);

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

  // Close popup on outside click
  useEffect(() => {
    const onDown = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenuOpen(false);
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: current.title, text: current.artist }); } catch {}
    }
    setMenuOpen(false);
  };
  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setMenuOpen(false);
  };

  const hasTrack = !!current, off = !hasTrack;
  const progress = hasTrack ? Math.min(100, Math.max(0, (currentTime / (duration || 1)) * 100)) : 0;
  const remaining = duration ? `-${fmt(Math.max(0, duration - currentTime))}` : "-0:00";

  return (
    <>
      <style>{`
        /* ================= MINI PLAYER ================= */
        .player-mini{
          position:fixed;bottom:18px;left:calc(50% + var(--sidebar-width,0px)/2);transform:translateX(-50%);
          width:calc(100% - var(--sidebar-width,0px) - 48px);max-width:820px;height:64px;padding:0 20px;
          display:grid;align-items:center;gap:18px;background:#1f1f1f;
          border:1px solid rgba(255,255,255,0.08);box-shadow:0 12px 40px rgba(0,0,0,.45);
          border-radius:32px;z-index:1000;color:#f5f5f7;font-family:'Inter',system-ui,sans-serif;transition:all .3s ease;
        }
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
        .mini-title{font-size:14px;font-weight:500;letter-spacing:-.1px;color:#f5f5f7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .mini-artist{font-size:14px;font-weight:500;letter-spacing:-.1px;color:#a1a1aa;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .progress-row{display:flex;align-items:center;gap:8px;margin-top:3px}
        .progress-time{font-size:10px;color:#a1a1aa;min-width:30px}
        .progress-time.right{text-align:right}
        .progress-container{position:relative;flex:1;height:3px;background:rgba(255,255,255,.12);border-radius:999px;cursor:pointer}
        .progress-fill{position:absolute;top:0;left:0;height:100%;background:#fff;border-radius:999px;pointer-events:none}
        .progress-container input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer}

        /* ================= FULL SCREEN PLAYER ================= */
        .player-full{
          position:fixed;inset:0;z-index:2000;display:flex;flex-direction:column;overflow:hidden;color:#fff;
          opacity:0;visibility:hidden;transform:translateY(40px);transition:all .35s ease;
          font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#1f1f1f;
        }
        .player-full.open{opacity:1;visibility:visible;transform:translateY(0)}

        /* Top Header */
        .full-header{display:flex;justify-content:space-between;align-items:center;padding:16px;padding-top:max(20px, env(safe-area-inset-top));z-index:20}
        .full-close, .full-dots-btn {background:transparent;border:none;color:#fff;width:32px;height:32px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:opacity 0.2s}
        .full-close:hover, .full-dots-btn:hover {opacity:0.7}
        .full-close svg{width:22px;height:22px}
        .full-dots-btn svg{width:24px;height:24px}

        /* Dropdown Menu (Fixed position & high z-index) */
        .menu-container { position: relative; display: flex; align-items: center; justify-content: center; }
        .popup-menu { 
          position: absolute; top: 40px; right: 0; 
          background: #2c2c2e; border-radius: 12px; padding: 4px 0; min-width: 180px; 
          box-shadow: 0 12px 32px rgba(0,0,0,0.6); 
          z-index: 9999; 
          animation: fadeIn 0.15s ease-out;
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
        .menu-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; font-size: 15px; color: #fff; cursor: pointer; transition: background 0.2s; }
        .menu-item:hover { background: rgba(255,255,255,0.1); }

        /* Centered Container */
        .full-body{flex:1;display:flex;flex-direction:column;padding:0 24px 32px;width:100%;max-width:440px;margin:0 auto;justify-content:center;z-index:10}
        
        /* Album Art (Smooth scaling based on play state) */
        .full-art-wrapper{
          width:100%;max-width:320px;aspect-ratio:1;border-radius:12px;overflow:hidden;margin:0 auto 32px;
          box-shadow:0 24px 60px rgba(0,0,0,0.4);background:#27272a;
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform: scale(${playing ? 1 : 0.85});
        }
        .full-art{width:100%;height:100%;object-fit:cover}

        /* Info Section */
        .full-info{width:100%;display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:24px}
        .full-text-content{flex:1;min-width:0;padding-right:16px;text-align:left}
        .full-title{font-size:22px;font-weight:700;margin:0 0 4px;line-height:1.2;letter-spacing:-0.3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .full-artist{font-size:15px;color:rgba(255,255,255,.65);margin:0;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

        /* Progress Area */
        .full-progress-area{width:100%;margin-bottom:32px}
        .full-progress-bar{position:relative;width:100%;height:6px;background:rgba(255,255,255,.2);border-radius:4px;cursor:pointer}
        .full-progress-fill{position:absolute;top:0;left:0;height:100%;background:rgba(255,255,255,.9);border-radius:4px;pointer-events:none}
        .full-progress-bar input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer}
        .full-time-labels{display:flex;justify-content:space-between;margin-top:8px;font-size:12px;color:rgba(255,255,255,.55);font-variant-numeric:tabular-nums}

        /* Controls */
        .full-controls{display:flex;align-items:center;justify-content:space-between;padding:0 16px;margin-bottom:36px}
        .full-controls .ti{width:48px;height:48px;filter:drop-shadow(0 4px 12px rgba(0,0,0,0.3))}
        .full-controls .icon-btn .ti{opacity:.95}
        .full-controls .play-btn .ti{width:64px;height:64px}

        /* Bottom Section (Volume & Queue) */
        .full-bottom{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 4px;margin-bottom:32px}
        .full-bottom .ti{width:22px;height:22px;opacity:.5;flex-shrink:0}
        
        .full-volume-bar{flex:1;height:6px;background:rgba(255,255,255,.2);border-radius:4px;position:relative;cursor:pointer}
        .full-volume-fill{position:absolute;top:0;left:0;height:100%;background:rgba(255,255,255,.9);border-radius:4px;pointer-events:none}
        .full-volume-bar input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer}
        
        .full-queue{display:flex;justify-content:center;padding-bottom:max(16px, env(safe-area-inset-bottom))}
        .full-queue .ti{width:26px;height:26px;opacity:.6}

        /* Mobile Adjustments */
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
          
          .full-art-wrapper{max-width:280px}
          .full-title{font-size:20px}
          .full-artist{font-size:14px}
        }
        @media(min-width:641px){.mobile-controls{display:none}.idle-art-mobile{display:none!important}}
      `}</style>

      {/* MINI PLAYER */}
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

      {/* FULL SCREEN PLAYER */}
      {hasTrack && (
        <div className={`player-full ${expanded ? "open" : ""}`}>
          <div className="full-header">
            <button className="full-close" onClick={() => setExpanded(false)} aria-label="Close">
              <Icons.Chevron />
            </button>
            
            <div className="menu-container" ref={menuRef}>
              <button className="full-dots-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="More">
                <Icons.Dots />
              </button>
              
              {menuOpen && (
                <div className="popup-menu">
                  <div className="menu-item" onClick={handleShare}>
                    <Icons.Share /> Share Song
                  </div>
                  <div className="menu-item" onClick={handleCopy}>
                    <Icons.Link /> Copy Link
                  </div>
                </div>
              )}
            </div>
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
              <div className="full-volume-bar">
                <div className="full-volume-fill" style={{ width: `${volume}%` }} />
                <input type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(Number(e.target.value))} />
              </div>
              <Icons.VolHigh />
            </div>

            <div className="full-queue"><Icons.Queue /></div>
          </div>
        </div>
      )}
    </>
  );
}