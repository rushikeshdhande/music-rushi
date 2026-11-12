import { usePlayer } from "../contexts/PlayerContext";
import "./Player.css";

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
      <div className="player-left">
        <img src={current.artwork} alt="" className="player-art" />
        <div>
          <div className="player-title">{current.title}</div>
          <div className="player-artist">{current.artist}</div>
        </div>
      </div>
      <div className="player-center">
        <div className="player-controls">
          <button onClick={prev}>⏮</button>
          <button onClick={playPause} className="play-btn">{playing ? "⏸" : "▶"}</button>
          <button onClick={next}>⏭</button>
        </div>
        <div className="player-progress">
          <span>{fmt(currentTime)}</span>
          <input type="range" min="0" max={duration || 0} value={currentTime}
            onChange={(e) => seek(Number(e.target.value))} />
          <span>{fmt(duration)}</span>
        </div>
      </div>
    </div>
  );
}
