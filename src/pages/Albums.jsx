import React from "react";
import { Link } from "react-router-dom";
import { REMOTE_ALBUMS } from "../data/remoteAlbums";

const Albums = () => {
  return (
    <div style={s.page}>
      <h1 style={s.header}>Albums</h1>
      
      <div style={s.grid}>
        {REMOTE_ALBUMS.map((a) => (
          <Link
            key={a.id}
            to={`/in/album/${slugify(a.name)}/${a.numericId}`}
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
            <div style={s.imageWrap}>
              <img src={a.artwork} alt={a.name} style={s.image} />
            </div>
            <div style={s.info}>
              <div style={s.title} title={a.name}>{a.name}</div>
              <div style={s.sub} title={a.artist}>{a.artist}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

// tiny local slugify to avoid extra import
function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
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
    // Responsive grid: auto-fills as many 160px columns as will fit
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: "24px 16px", // row-gap 24, col-gap 16
  },
  card: {
    display: "flex",
    flexDirection: "column",
    textDecoration: "none",
    color: "inherit",
    borderRadius: 12,
    padding: 12,
    background: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    transition: "all 0.25s ease",
    cursor: "pointer",
  },
  imageWrap: {
    width: "100%",
    aspectRatio: "1 / 1",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 12,
    background: "var(--hover-bg)",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  info: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
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

export default Albums;