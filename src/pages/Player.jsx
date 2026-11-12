import { usePlayer } from "../contexts/PlayerContext";

export default function Player() {
  const { current, playing, playPause, next, prev } = usePlayer();
  if (!current) return null;

  return (
    <div style={styles.player}>
      {/* Left: Art & Title */}
      <div style={styles.left}>
        <img src={current.artwork} alt="" style={styles.art} />
        <div style={styles.info}>
          <div style={styles.title}>{current.title}</div>
          <div style={styles.artist}>{current.artist}</div>
        </div>
      </div>

      {/* Center: Controls */}
      <div style={styles.center}>
        <button style={styles.btn} onClick={prev}>⏮</button>
        <button style={styles.playBtn} onClick={playPause}>{playing ? "⏸" : "▶"}</button>
        <button style={styles.btn} onClick={next}>⏭</button>
      </div>

      {/* Right: Volume/Settings icons (fake UI) */}
      <div style={styles.right}>
        <span style={styles.icon}>🔊</span>
        <span style={styles.icon}>☰</span>
      </div>
    </div>
  );
}

const styles = {
  player: {
    position: "fixed",
    bottom: "24px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "92%",
    maxWidth: "820px",
    height: "72px",
    background: "rgba(255, 255, 255, 0.08)",
    backdropFilter: "blur(24px) saturate(180%)",
    WebkitBackdropFilter: "blur(24px) saturate(180%)",
    borderRadius: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    zIndex: 1000,
    transition: "all 0.3s ease",
  },
  left: { 
    display: "flex", 
    alignItems: "center", 
    gap: "14px", 
    width: "30%",
    minWidth: 0,
  },
  art: { 
    width: "50px", 
    height: "50px", 
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
    objectFit: "cover",
  },
  info: { 
    display: "flex", 
    flexDirection: "column", 
    overflow: "hidden",
    gap: "2px",
  },
  title: { 
    fontSize: "14px", 
    fontWeight: "600", 
    color: "#fff", 
    whiteSpace: "nowrap", 
    textOverflow: "ellipsis", 
    overflow: "hidden",
    letterSpacing: "0.01em",
  },
  artist: { 
    fontSize: "12px", 
    color: "rgba(255, 255, 255, 0.6)", 
    whiteSpace: "nowrap", 
    textOverflow: "ellipsis", 
    overflow: "hidden",
  },
  
  center: { 
    display: "flex", 
    alignItems: "center", 
    gap: "24px", 
    flex: 1, 
    justifyContent: "center",
  },
  btn: { 
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#fff", 
    fontSize: "18px", 
    cursor: "pointer",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    backdropFilter: "blur(8px)",
  },
  playBtn: { 
    background: "rgba(255, 255, 255, 0.2)",
    border: "1px solid rgba(255, 255, 255, 0.25)",
    color: "#fff", 
    fontSize: "22px", 
    cursor: "pointer",
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    backdropFilter: "blur(12px)",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
  },
  
  right: { 
    display: "flex", 
    alignItems: "center", 
    gap: "12px", 
    color: "rgba(255, 255, 255, 0.6)", 
    fontSize: "18px", 
    width: "30%", 
    justifyContent: "flex-end",
  },
  icon: { 
    cursor: "pointer",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
  },
};