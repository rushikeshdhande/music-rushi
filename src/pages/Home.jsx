import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "../contexts/PlayerContext";
import { useSyncStore } from "../lib/syncStore";
import { ALL_SONGS, findAlbumForSong } from "../data/remoteAlbums";

const IconChevron = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5l7 7-7 7" />
  </svg>
);

export default function Home() {
  const nav = useNavigate();
  const { loadAndPlay } = usePlayer();
  const { recent, counts } = useSyncStore();

  const topPicks = useMemo(() => {
    const ranked = ALL_SONGS
      .filter((s) => counts[s.id] > 0)
      .sort((a, b) => (counts[b.id] || 0) - (counts[a.id] || 0));
    const fill = ALL_SONGS.filter((s) => !ranked.find((r) => r.id === s.id));
    return [...ranked, ...fill].slice(0, 10);
  }, [counts]);

  const recentlyPlayed = useMemo(() => {
    return recent
      .map((id) => ALL_SONGS.find((s) => s.id === id))
      .filter(Boolean)
      .slice(0, 10);
  }, [recent]);

  const playAll = (list) => {
    if (list.length > 0) loadAndPlay(list, 0);
  };

  const openAlbumForSong = (song) => {
    const album = findAlbumForSong(song);
    if (album) nav(`/album/${album.numericId}`);
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.headerTitle}>Home</h1>

      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>Top Picks for You</h2>
      </div>

      <div style={styles.horizontalScroll}>
        {topPicks.map((pick) => (
          <div
            key={pick.id}
            style={styles.topCard}
            onClick={() => openAlbumForSong(pick)}
          >
            <div style={styles.artContainer}>
              <img src={pick.artwork} style={styles.art} alt="" />
              <div style={styles.gradientOverlay} />
            </div>
            <div style={styles.topCardInfo}>
              <p style={styles.topLabel}>Made for you</p>
              <p style={styles.topName}>{pick.title}</p>
              <p style={styles.topSub}>{pick.artist}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ ...styles.sectionHeader, marginTop: 24 }}>
        <h2 style={styles.sectionTitle} onClick={() => nav("/library")}>
          Recently Played <IconChevron />
        </h2>
      </div>

      <div style={styles.horizontalScroll}>
        {recentlyPlayed.length > 0 ? (
          recentlyPlayed.map((song) => (
            <div key={song.id} style={styles.songCard} onClick={() => playAll(recentlyPlayed)}>
              <img src={song.artwork} style={styles.songArt} alt="" />
              <p style={styles.cardTitle}>{song.title}</p>
              <p style={styles.cardSub}>{song.artist}</p>
            </div>
          ))
        ) : (
          <p style={{ color: "#888", paddingLeft: 16, fontSize: "13px" }}>No recent songs yet.</p>
        )}
      </div>

      <div style={{ ...styles.sectionHeader, marginTop: 24 }}>
        <h2 style={styles.sectionTitle} onClick={() => nav("/songs")}>
          Songs <IconChevron />
        </h2>
      </div>

      <div style={styles.horizontalScroll}>
        {ALL_SONGS.slice(0, 10).map((song) => (
          <div key={song.id} style={styles.songCard} onClick={() => playAll(ALL_SONGS)}>
            <img src={song.artwork} style={styles.songArt} alt="" />
            <p style={styles.cardTitle}>{song.title}</p>
            <p style={styles.cardSub}>{song.artist}</p>
          </div>
        ))}
      </div>

      <div style={{ height: 80 }} />
    </div>
  );
}

const styles = {
  page: { padding: "20px", paddingBottom: "100px", maxWidth: "1400px", margin: "0 auto", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" },
  headerTitle: { fontSize: "28px", fontWeight: "800", color: "#fff", marginBottom: "20px", letterSpacing: "-0.5px" },
  sectionHeader: { display: "flex", alignItems: "center", marginBottom: "12px", cursor: "pointer" },
  sectionTitle: { fontSize: "18px", fontWeight: "700", color: "#fff", margin: 0, display: "flex", alignItems: "center", gap: "4px", letterSpacing: "-0.2px" },
  horizontalScroll: { display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "12px", scrollbarWidth: "none" },
  
  topCard: { width: "160px", height: "220px", borderRadius: "10px", overflow: "hidden", display: "flex", flexDirection: "column", backgroundColor: "#1c1c1e", flexShrink: 0, cursor: "pointer", boxShadow: "0 8px 24px rgba(0,0,0,0.3)" },
  artContainer: { height: "160px", position: "relative" },
  art: { width: "100%", height: "100%", objectFit: "cover" },
  gradientOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, height: "60px", background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)" },
  topCardInfo: { padding: "8px 12px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", background: "#1c1c1e" },
  topLabel: { fontSize: "9px", fontWeight: "600", color: "rgba(255,255,255,0.6)", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" },
  topName: { fontSize: "13px", fontWeight: "700", color: "#fff", margin: "2px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  topSub: { fontSize: "11px", color: "rgba(255,255,255,0.7)", margin: "2px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  
  songCard: { width: "120px", flexShrink: 0, cursor: "pointer" },
  songArt: { width: "120px", height: "120px", borderRadius: "6px", objectFit: "cover", backgroundColor: "#2c2c2e" },
  cardTitle: { fontSize: "13px", fontWeight: "600", color: "#fff", margin: "6px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  cardSub: { fontSize: "11px", color: "#a1a1aa", margin: "2px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
};