// src/pages/SharedMusicVideo.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MUSIC_VIDEOS, refreshMusicVideos } from "../data/musicVideos";

export default function SharedMusicVideo() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [video, setVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false); // Controls the full-screen modal

useEffect(() => {
  let cancelled = false;

  async function loadVideo() {
    // आधी उपलब्ध catalog मध्ये शोध
    const findVideo = () =>
      MUSIC_VIDEOS.find(
        (v) =>
          String(v.id) === String(id) ||
          String(v.addedAt) === String(id)
      );

    let found = findVideo();

    if (!cancelled && found) {
      setVideo(found);
    }

    // नवीन catalog API मधून refresh
    await refreshMusicVideos();

    found = findVideo();

    if (!cancelled) {
      setVideo(found || null);
    }
  }

  loadVideo();

  return () => {
    cancelled = true;
  };
}, [id]);

  if (!video) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", color: "#fff", background: "#000" }}>
        <h2>Video not found</h2>
        <button onClick={() => navigate("/")} style={{ marginTop: 20, padding: "10px 20px", borderRadius: 20, background: "#f92c47", border: "none", color: "#fff", cursor: "pointer", fontWeight: "bold" }}>
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="smv-page">
      <style>{`
        .smv-page {
          position: fixed; inset: 0;
          background: #1c1c1e; /* Apple Music dark gray */
          color: #fff;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          display: flex; align-items: flex-start; justify-content: center;
          padding: 80px 40px 40px; /* Push down from top */
          overflow-y: auto;
        }

        .smv-container {
          display: flex; align-items: flex-start; gap: 40px;
          max-width: 900px; width: 100%;
        }

        @media (max-width: 768px) {
          .smv-page { padding: 40px 20px; align-items: center; }
          .smv-container { flex-direction: column; gap: 24px; text-align: center; }
        }

        /* Left Side: Video Card */
        .smv-video-card {
          position: relative;
          width: 100%; max-width: 450px;
          aspect-ratio: 16 / 9;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1);
          flex-shrink: 0;
          background: #000;
        }

        .smv-video-card img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.3s ease;
        }

        .smv-video-card:hover img { transform: scale(1.02); }

        .smv-play-overlay {
          position: absolute; inset: 0;
          background: rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.2s ease;
        }

        .smv-video-card:hover .smv-play-overlay { opacity: 1; }

        /* Right Side: Info */
        .smv-info {
          flex: 1; display: flex; flex-direction: column; justify-content: center;
          padding-top: 10px;
        }

        @media (max-width: 768px) {
          .smv-info { padding-top: 0; align-items: center; }
        }

        .smv-title {
          font-size: 32px; font-weight: 700; margin: 0 0 8px 0;
          display: flex; align-items: center; gap: 8px;
        }

        .smv-title svg { width: 20px; height: 20px; color: #f92c47; }

        .smv-artist {
          font-size: 20px; font-weight: 500; margin: 0 0 12px 0;
          color: #fff; opacity: 0.9;
        }

        .smv-meta {
          font-size: 13px; font-weight: 600; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.5px;
        }

        /* Full Screen Player Modal */
        .smv-modal {
          position: fixed; inset: 0; background: #000; z-index: 9999;
          display: flex; flex-direction: column;
          animation: fadeIn 0.2s ease-out;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .smv-modal-header {
          position: absolute; top: 0; left: 0; right: 0; padding: 24px;
          background: linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%);
          z-index: 10; display: flex; justify-content: flex-start;
        }

        .smv-close-btn {
          background: rgba(255,255,255,0.15); border: none; color: #fff;
          width: 40px; height: 40px; border-radius: 50%;
          font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(10px); transition: background 0.2s;
        }
        .smv-close-btn:hover { background: rgba(255,255,255,0.3); }

        .smv-video-wrapper {
          flex: 1; display: flex; align-items: center; justify-content: center;
          overflow: hidden;
        }
        .smv-video-wrapper video {
          width: 100%; height: 100%; max-width: 100%; max-height: 100%;
          object-fit: contain; outline: none;
        }
      `}</style>

      <div className="smv-container">
        
        {/* LEFT: Video Thumbnail Card */}
        <div className="smv-video-card" onClick={() => setIsPlaying(true)}>
          <img src={video.thumbnail} alt={video.title} />
          <div className="smv-play-overlay">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="rgba(255,255,255,0.9)">
              <circle cx="12" cy="12" r="11" fill="rgba(0,0,0,0.4)" />
              <path d="M10 8l6 4-6 4V8z" fill="#fff" />
            </svg>
          </div>
        </div>

        {/* RIGHT: Details */}
        <div className="smv-info">
          <h1 className="smv-title">
            {video.title}
            {/* Star icon like in the screenshot */}
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </h1>
          <p className="smv-artist">{video.artist}</p>
          <p className="smv-meta">POP • 2026</p>
        </div>
      </div>

      {/* FULL SCREEN VIDEO PLAYER MODAL */}
      {isPlaying && (
        <div className="smv-modal">
          <div className="smv-modal-header">
            <button className="smv-close-btn" onClick={() => setIsPlaying(false)}>✕</button>
          </div>
          <div className="smv-video-wrapper">
            <video 
              src={video.url} 
              controls 
              autoPlay 
              playsInline
            />
          </div>
        </div>
      )}
    </div>
  );
}