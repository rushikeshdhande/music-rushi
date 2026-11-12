import React from "react";
import { Link } from "react-router-dom";
import { ALL_SONGS } from "../data/remoteAlbums";

export default function Artists() {
  const artists = [...new Set(ALL_SONGS.map((s) => s.artist))].filter(Boolean);

  return (
    <div style={s.page}>
      <h1 style={s.header}>Artists</h1>
      
      <div style={s.grid}>
        {artists.map((a) => (
          <Link 
            key={a} 
            to={`/artists/${encodeURIComponent(a)}`} 
            style={s.card}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
            }}
          >
            <div style={s.avatarWrap}>
              <span style={s.avatarIcon}>🎤</span>
            </div>
            <div style={s.info}>
              <div style={s.title} title={a}>{a}</div>
              <div style={s.sub}>Artist</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

const s = {
  page: {
    padding: "32px 24px",
    maxWidth: 1200,
    margin: "0 auto",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: "var(--text-main)",
    minHeight: "100vh",
  },
  header: {
    fontSize: "clamp(24px, 4vw, 32px)",
    fontWeight: 700,
    marginBottom: 24,
    letterSpacing: "-0.5px",
  },
  grid: {
    display: "grid",
    // Slightly larger minmax for artist cards to accommodate the name
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: "24px 16px", 
  },
  card: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center", // Centers the circular avatar and text
    textDecoration: "none",
    color: "inherit",
    borderRadius: 12,
    padding: "20px 12px",
    background: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    transition: "all 0.25s ease",
    cursor: "pointer",
    textAlign: "center",
  },
  avatarWrap: {
    width: 90,
    height: 90,
    borderRadius: "50%", // Makes it a circle
    background: "var(--hover-bg)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    border: "1px solid var(--border-color)",
  },
  avatarIcon: {
    fontSize: 32,
    opacity: 0.8,
  },
  info: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    width: "100%",
    minWidth: 0, // Enables truncation
  },
  title: {
    fontSize: 15,
    fontWeight: 600,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    color: "var(--text-main)",
  },
  sub: {
    fontSize: 13,
    color: "var(--text-muted)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
};