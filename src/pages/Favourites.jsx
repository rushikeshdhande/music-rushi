import React from "react";
import { ALL_SONGS } from "../data/remoteAlbums";
import { usePlayer } from "../contexts/PlayerContext";
import { useSyncStore } from "../lib/syncStore";

export default function Favourites() {
  const { favourites, toggleFavourite } = useSyncStore();
  const { loadAndPlay, current } = usePlayer();
  
  const favSongs = ALL_SONGS.filter((s) => favourites[s.id]);

  return (
    <div style={s.page}>
      <div style={s.headerRow}>
        <h1 style={s.header}>Favourite Songs</h1>
        {favSongs.length > 0 && (
          <button 
            style={s.playAllBtn} 
            onClick={() => loadAndPlay(favSongs, 0)}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 8 }}>
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            Play All
          </button>
        )}
      </div>

      {favSongs.length === 0 ? (
        <div style={s.emptyState}>
          <p>No favourites yet.</p>
          <p style={{ fontSize: 14, opacity: 0.6, marginTop: 8 }}>Songs you heart will appear here.</p>
        </div>
      ) : (
        <div style={s.list}>
          {favSongs.map((song, i) => {
            const isActive = current?.id === song.id;
            
            return (
              <div 
                key={song.id} 
                style={{
                  ...s.row,
                  background: isActive ? "var(--active-bg)" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = "var(--hover-bg)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = "transparent";
                }}
              >
                <img 
                  src={song.artwork} 
                  alt={song.title} 
                  style={{ ...s.art, cursor: "pointer" }} 
                  onClick={() => loadAndPlay(favSongs, i)}
                />
                
                <div style={s.info} onClick={() => loadAndPlay(favSongs, i)}>
                  <div style={{ ...s.title, color: isActive ? "var(--accent)" : "var(--text-main)" }}>
                    {song.title}
                  </div>
                  <div style={s.artist}>{song.artist}</div>
                </div>

                <button 
                  style={s.favBtn} 
                  onClick={() => toggleFavourite(song.id)}
                  title="Remove from favourites"
                >
                  ★
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const s = {
  page: {
    padding: "32px 24px",
    maxWidth: 1000,
    margin: "0 auto",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: "var(--text-main)",
    minHeight: "100vh",
    paddingBottom: 120, // Space for the player
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
    flexWrap: "wrap",
    gap: 16,
  },
  header: {
    fontSize: "clamp(24px, 4vw, 32px)",
    fontWeight: 700,
    margin: 0,
    letterSpacing: "-0.5px",
  },
  playAllBtn: {
    display: "flex",
    alignItems: "center",
    background: "var(--text-main)",
    color: "var(--bg-main)",
    border: "none",
    padding: "10px 24px",
    borderRadius: 24,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "transform 0.2s ease",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    background: "var(--bg-surface)",
    borderRadius: 16,
    border: "1px dashed var(--border-color)",
    color: "var(--text-muted)",
    fontSize: 16,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "8px 12px",
    borderRadius: 10,
    transition: "background 0.2s ease",
  },
  art: {
    width: 48,
    height: 48,
    borderRadius: 6,
    objectFit: "cover",
    flexShrink: 0,
    background: "var(--hover-bg)",
  },
  info: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 4,
    minWidth: 0, // Allows text truncation
    cursor: "pointer",
  },
  title: {
    fontSize: 15,
    fontWeight: 600,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    transition: "color 0.2s ease",
  },
  artist: {
    fontSize: 13,
    color: "var(--text-muted)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  favBtn: {
    background: "none",
    border: "none",
    color: "var(--accent)",
    fontSize: 20,
    cursor: "pointer",
    padding: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.2s ease",
  },
};