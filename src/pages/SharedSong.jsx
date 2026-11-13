import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { findSongByNumericId, ALL_SONGS } from "../data/remoteAlbums";
import { usePlayer } from "../contexts/PlayerContext";

// Your app's bundle ID (Android) or URL Scheme
const APP_PACKAGE = "com.netease.cloudmusic"; 

export default function SharedSong() {
  const { id, slug } = useParams();
  const { loadAndPlay } = usePlayer();
  const [song, setSong] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const found = findSongByNumericId(id);
    if (found) setSong(found);
    else setNotFound(true);
  }, [id]);

  // Auto-open app on mobile (runs once when the page loads)
  useEffect(() => {
    if (!song) return;
    const isMobile = /android|iphone|ipad/i.test(navigator.userAgent);
    if (!isMobile) return;
    
    const deepLink =
      `intent://music-rushi.vercel.app/in/album/${slug}/${id}` +
      `#Intent;scheme=https;package=${APP_PACKAGE};` +
      `S.browser_fallback_url=${encodeURIComponent(window.location.href)};end`;
      
    const t = setTimeout(() => {
      try { window.location.href = deepLink; } catch {}
    }, 800);
    
    return () => clearTimeout(t);
  }, [song, id, slug]);

  // Function to handle manual "Open in App" button click
  const handleOpenInApp = () => {
    const deepLink =
      `intent://music-rushi.vercel.app/in/album/${slug}/${id}` +
      `#Intent;scheme=https;package=${APP_PACKAGE};` +
      `S.browser_fallback_url=${encodeURIComponent(window.location.href)};end`;
    window.location.href = deepLink;
  };

  if (notFound) {
    return (
      <div className="ss-page" style={{ justifyContent: "center", alignItems: "center" }}>
        <h1 style={{ color: "#fff", marginBottom: 20 }}>Song not found</h1>
        <Link to="/" className="ss-btn ss-btn-primary" style={{ width: "auto", padding: "12px 24px" }}>Go to Home</Link>
      </div>
    );
  }
  
  if (!song) return <div className="ss-page" style={{ justifyContent: "center", alignItems: "center", color: "#fff" }}>Loading…</div>;

  return (
    <div className="ss-page">
      <style>{`
        .ss-page {
          position: fixed; inset: 0; 
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 24px; 
          overflow: hidden; 
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background: #000; color: #fff;
        }

        .ss-bg {
          position: absolute; inset: 0; z-index: 0;
          background-size: cover; background-position: center;
          filter: blur(60px) saturate(1.5); opacity: 0.4;
          transform: scale(1.1); pointer-events: none;
        }
        
        .ss-content {
          position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center;
          width: 100%; max-width: 360px; text-align: center;
        }

        .ss-artwork {
          width: 220px; height: 220px; border-radius: 12px;
          object-fit: cover; box-shadow: 0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1);
          margin-bottom: 24px;
        }

        /* ✅ Multi-line support for long titles and artists */
        .ss-title {
          font-size: 24px; font-weight: 700; margin: 0 0 6px; line-height: 1.3;
          letter-spacing: -0.02em;
          display: -webkit-box;
          -webkit-line-clamp: 2; /* Allows max 2 lines */
          -webkit-box-orient: vertical;
          overflow: hidden;
          width: 100%;
        }
        .ss-artist {
          font-size: 17px; font-weight: 500; color: #f92c47; margin: 0 0 6px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          width: 100%;
        }
        .ss-album {
          font-size: 14px; color: #a1a1aa; margin: 0 0 24px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%;
        }

        .ss-btn {
          width: 100%; padding: 14px 20px; border-radius: 12px;
          font-size: 16px; font-weight: 600; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          text-decoration: none; border: none; transition: opacity 0.2s;
        }
        .ss-btn:hover { opacity: 0.8; }
        
        .ss-btn-primary {
          background: #f92c47; color: #fff;
        }
        .ss-btn-secondary {
          background: rgba(255,255,255,0.1); color: #fff; margin-top: 12px;
          border: 1px solid rgba(255,255,255,0.1);
        }
      `}</style>

      <div className="ss-bg" style={{ backgroundImage: `url(${song.artwork})` }} />

      <div className="ss-content">
        <img src={song.artwork} alt={song.title} className="ss-artwork" />
        
        <h1 className="ss-title">{song.title}</h1>
        <p className="ss-artist">{song.artist}</p>
        <p className="ss-album">From "{song.album}"</p>

        <button
          className="ss-btn ss-btn-primary"
          onClick={() => loadAndPlay(ALL_SONGS, ALL_SONGS.indexOf(song))}
        >
          ▶ Play on Web
        </button>

       
        
      </div>
    </div>
  );
}