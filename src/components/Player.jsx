import { usePlayer } from "../contexts/PlayerContext";
import "./Player.css";

// Simple inline SVG icons to match the image
const Icons = {
  Shuffle: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>,
  Prev: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>,
  Play: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>,
  Pause: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>,
  Next: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>,
  Repeat: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>,
  Dots: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>,
  Comment: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>,
  Queue: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>,
  Volume: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
};

export default function Player() {
  const { current, playing, currentTime, duration, playPause, next, prev, seek } = usePlayer();
  
  if (!current) return null;

  const fmt = (s) => {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  return (
    <div className="player">
      {/* 1. Left Controls */}
      <div className="player-controls-left">
        <button className="icon-btn"><Icons.Shuffle /></button>
        <button className="icon-btn" onClick={prev}><Icons.Prev /></button>
        <button className="play-btn" onClick={playPause}>
          {playing ? <Icons.Pause /> : <Icons.Play />}
        </button>
        <button className="icon-btn" onClick={next}><Icons.Next /></button>
        <button className="icon-btn"><Icons.Repeat /></button>
      </div>

      {/* 2. Center Content (Art + Info + Progress) */}
      <div className="player-center-content">
        <img src={current.artwork} alt="" className="player-art" />
        
        <div className="player-info-progress">
          <div className="player-text">
            <div className="player-title">{current.title}</div>
            <div className="player-artist">{current.artist}</div>
          </div>
          
          <div className="player-progress-row">
            <div className="player-progress-container">
              <div 
                className="player-progress-fill" 
                style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
              />
              <input 
                type="range" 
                min="0" 
                max={duration || 0} 
                value={currentTime || 0}
                onChange={(e) => seek(Number(e.target.value))} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Right Icons */}
      <div className="player-right-icons">
        <button className="icon-btn"><Icons.Dots /></button>
        <button className="icon-btn"><Icons.Comment /></button>
        <button className="icon-btn"><Icons.Queue /></button>
        <button className="icon-btn"><Icons.Volume /></button>
      </div>
    </div>
  );
}