import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "../contexts/PlayerContext";
import { useSyncStore } from "../lib/syncStore";
import { ALL_SONGS, findAlbumForSong } from "../data/remoteAlbums";

const IconChevron = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5l7 7-7 7" />
  </svg>
);

// ✅ Hook to extract dominant color from image
const useDominantColor = (imageUrl) => {
  const [color, setColor] = useState("#1c1c1e");

  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = "Anonymous"; 
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = 1;
      canvas.height = 1;
      
      ctx.drawImage(img, 0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      
      const darkR = Math.floor(r * 0.4);
      const darkG = Math.floor(g * 0.4);
      const darkB = Math.floor(b * 0.4);
      
      setColor(`rgb(${darkR}, ${darkG}, ${darkB})`);
    };

    img.onerror = () => setColor("#1c1c1e");
  }, [imageUrl]);

  return color;
};

// ✅ Individual Card Component
const TopPickCard = ({ pick, onClick }) => {
  const bgColor = useDominantColor(pick.artwork);

  return (
    <div style={styles.topCard} onClick={onClick}>
      {/* Artwork + Reflection Container */}
      <div style={styles.artWrapper}>
        <img src={pick.artwork} style={styles.art} alt="" />
        
        {/* Reflection Effect */}
        <div style={styles.reflectionContainer}>
          <img src={pick.artwork} style={styles.reflectionImg} alt="" />
          <div style={{ ...styles.reflectionFade, background: `linear-gradient(to bottom, ${bgColor}00 0%, ${bgColor} 100%)` }} />
        </div>
      </div>
      
      {/* ✅ Text Info Container with High Shadow and Overlap */}
      <div 
        style={{ 
          ...styles.topCardInfo, 
          backgroundColor: bgColor,
          boxShadow: `0 -24px 30px -5px ${bgColor}, 0 -4px 10px rgba(0,0,0,0.5)`, 
          marginTop: "-2px", 
        }}
      >
        <p style={styles.topLabel}>Made for you</p>
        <p style={styles.topName}>{pick.title}</p>
        <p style={styles.topSub}>{pick.artist}</p>
      </div>
    </div>
  );
};

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
          <TopPickCard 
            key={pick.id} 
            pick={pick} 
            onClick={() => openAlbumForSong(pick)} 
          />
        ))}
      </div>

      <div style={{ ...styles.sectionHeader, marginTop: 40 }}>
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
          <p style={{ color: "#888", paddingLeft: 20 }}>No recent songs yet.</p>
        )}
      </div>

      <div style={{ ...styles.sectionHeader, marginTop: 40 }}>
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

      <div style={{ height: 100 }} />
    </div>
  );
}

const styles = {
  page: { padding: "24px", paddingBottom: "120px", maxWidth: "1400px", margin: "0 auto", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" },
  headerTitle: { fontSize: "36px", fontWeight: "800", color: "#fff", marginBottom: "30px", letterSpacing: "-1px" },
  sectionHeader: { display: "flex", alignItems: "center", marginBottom: "16px", cursor: "pointer" },
  sectionTitle: { fontSize: "22px", fontWeight: "700", color: "#fff", margin: 0, display: "flex", alignItems: "center", gap: "4px", letterSpacing: "-0.3px" },
  horizontalScroll: { display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "16px", scrollbarWidth: "none" },
  
  // ✅ Overall Card Height Reduced
  topCard: { width: "220px", height: "280px", borderRadius: "12px", overflow: "hidden", display: "flex", flexDirection: "column", backgroundColor: "#1c1c1e", flexShrink: 0, cursor: "pointer", boxShadow: "0 10px 30px rgba(0,0,0,0.3)", position: "relative" },
  
  artWrapper: { height: "220px", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2 },
  art: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  
  reflectionContainer: { 
    position: "absolute", 
    top: "100%", 
    width: "100%", 
    height: "70px", 
    overflow: "hidden", 
    zIndex: 1,
    opacity: 0.35,
    pointerEvents: "none",
  },
  reflectionImg: { 
    width: "100%", 
    height: "220px", 
    objectFit: "cover", 
    transform: "scaleY(-1)",
    WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)",
    maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)",
  },
  reflectionFade: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 3,
  },
  
  // ✅ Text Container Height Reduced
  topCardInfo: { 
    height: "60px", // 👈 Reduced from flex-based to fixed 60px
    padding: "8px 16px", // 👈 Adjusted padding to fit the smaller height
    display: "flex", 
    flexDirection: "column", 
    justifyContent: "center", // 👈 Centered vertically for better look in small space
    zIndex: 5,
    transition: "background-color 0.3s ease",
    position: "relative",
    borderRadius: "0 0 12px 12px",
  },
  topLabel: { fontSize: "11px", fontWeight: "600", color: "rgba(255,255,255,0.6)", margin: 0, textTransform: "uppercase" },
  topName: { fontSize: "14px", fontWeight: "700", color: "#fff", margin: "2px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  topSub: { fontSize: "12px", color: "rgba(255,255,255,0.7)", margin: "1px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  
  songCard: { width: "160px", flexShrink: 0, cursor: "pointer" },
  songArt: { width: "160px", height: "160px", borderRadius: "8px", objectFit: "cover", backgroundColor: "#2c2c2e" },
  cardTitle: { fontSize: "14px", fontWeight: "600", color: "#fff", margin: "8px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  cardSub: { fontSize: "12px", color: "#a1a1aa", margin: "2px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
};