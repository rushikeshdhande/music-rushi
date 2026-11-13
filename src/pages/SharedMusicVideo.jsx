// src/pages/SharedMusicVideo.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MUSIC_VIDEOS } from "../data/musicVideos";

export default function SharedMusicVideo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);

  useEffect(() => {
    // Find the video by ID (addedAt timestamp)
    const found = MUSIC_VIDEOS.find((v) => String(v.addedAt) === String(id));
    if (found) {
      setVideo(found);
    }
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
    <div style={{ position: "fixed", inset: 0, background: "#000", display: "flex", flexDirection: "column", zIndex: 9999 }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "20px 30px", display: "flex", justifyContent: "flex-start", zIndex: 10, background: "linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)" }}>
        <button 
          onClick={() => navigate("/music-videos")}
          style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "white", width: 40, height: 40, borderRadius: "50%", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(10px)" }}
        >
          ✕
        </button>
      </div>
      
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <video 
          src={video.url} 
          controls 
          autoPlay 
          playsInline
          style={{ width: "100%", height: "100%", maxWidth: "100%", maxHeight: "100%", objectFit: "contain", outline: "none" }}
        />
      </div>
    </div>
  );
}