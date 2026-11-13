// src/pages/MusicVideo.jsx
import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MUSIC_VIDEOS, musicVideoShareUrl } from "../data/musicVideos";

const showToast = (msg) => console.log("[toast]", msg);

// ─── Icons ────────────────────────────────────────────────────────────────
const SortMenuIcon = ({ size = 16, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 16 16" fill={color}>
    <path d="M3.644 1.78.191 5.3A.7.7 0 0 0 0 5.752c0 .362.246.608.602.608a.58.58 0 0 0 .43-.178l1.423-1.47 1.1-1.271-.068 1.58v8.785c0 .363.253.616.616.616.355 0 .608-.253.608-.616V5.02L4.65 3.44l1.094 1.272 1.429 1.47a.56.56 0 0 0 .424.178c.355 0 .601-.246.601-.608a.67.67 0 0 0-.191-.452L4.56 1.78a.614.614 0 0 0-.917 0zm8.718 12.444 3.447-3.536a.64.64 0 0 0 .191-.45c0-.363-.246-.603-.602-.603a.56.56 0 0 0-.424.171l-1.422 1.47-1.1 1.28.06-1.58V2.189a.59.59 0 0 0-.608-.615.59.59 0 0 0-.615.615v8.787l.068 1.58-1.1-1.28-1.423-1.47a.57.57 0 0 0-.424-.17c-.355 0-.608.239-.608.601a.65.65 0 0 0 .198.451l3.446 3.536a.62.62 0 0 0 .916 0" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
    <path d="M6.9 12.9c.3 0 .5-.1.7-.4l5.3-8.4c.1-.1.1-.3.1-.4 0-.4-.2-.6-.6-.6-.3 0-.4.1-.6.3l-5 8-2.6-3.5c-.2-.2-.3-.3-.6-.3s-.6.2-.6.6c0 .2.1.3.2.5l3 3.9c.2.2.4.3.7.3z" />
  </svg>
);

const PlayCircleIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="rgba(255,255,255,0.9)">
    <circle cx="12" cy="12" r="11" fill="rgba(0,0,0,0.5)" />
    <path d="M10 8l6 4-6 4V8z" fill="#fff" />
  </svg>
);

const DotsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="19" cy="12" r="2" />
  </svg>
);

export default function MusicVideo() {
  const navigate = useNavigate();
  const [activeVideo, setActiveVideo] = useState(null);
  
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");
  
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Close the menu if clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const list = useMemo(() => {
    let l = MUSIC_VIDEOS.slice();
    const q = query.trim().toLowerCase();
    if (q) {
      l = l.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.artist.toLowerCase().includes(q),
      );
    }

    l.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "title") {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === "recent") {
        comparison = a.addedAt - b.addedAt;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return l;
  }, [sortBy, sortOrder, query]);

  const handleShare = async (e, video) => {
    e.stopPropagation(); 
    const url = musicVideoShareUrl(video);
    try {
      await navigator.clipboard.writeText(url);
      showToast("Link copied!");
      const t = document.createElement("div");
      t.textContent = "Link copied!";
      Object.assign(t.style, {
        position: "fixed", bottom: "100px", left: "50%", transform: "translateX(-50%)",
        background: "#1c1c1e", color: "#fff", padding: "10px 18px", borderRadius: "999px",
        fontSize: "14px", fontWeight: "600", zIndex: 9999, boxShadow: "0 6px 24px rgba(0,0,0,0.3)",
      });
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 2000);
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  };

  const MenuItem = ({ label, isSelected, onClick }) => (
    <li className="contextual-menu-item">
      <button type="button" className="contextual-menu-btn" onClick={() => { onClick(); setShowMenu(false); }}>
        <span className="contextual-menu-text">{label}</span>
        <span className="contextual-menu-icon">
          {isSelected && <CheckIcon />}
        </span>
      </button>
    </li>
  );

  return (
    <div className="mv-page">
      <style>{`
        .mv-page { padding: 24px var(--page-pad, 16px) 120px; max-width: 900px; margin: 0 auto; color: var(--text-main, #f5f5f7); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        @media (max-width: 768px) { .mv-page { padding-top: 72px; } }
        
        /* Header */
        .mv-head { display: flex; align-items: center; justify-content: center; margin-bottom: 24px; position: relative; }
        .mv-title { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.02em; }
        .mv-menu-btn-wrap { position: absolute; right: 0; top: 50%; transform: translateY(-50%); z-index: 101; }
        .mv-icon-btn { background: transparent; border: none; color: var(--text-main, #fff); width: 40px; height: 40px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: opacity 0.15s ease; border-radius: 8px; }
        .mv-icon-btn:hover { background: rgba(255,255,255,0.1); }
        
        /* Grid */
        .mv-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 24px; }
        
        @media (max-width: 768px) {
          .mv-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; column-gap: 12px; row-gap: 20px; }
          .mv-card-title { font-size: 14px; margin-top: 8px; }
          .mv-card-artist { font-size: 12px; margin-top: 2px; }
          .mv-card-dots { width: 28px; height: 28px; bottom: 8px; right: 8px; opacity: 1; }
        }
        
        /* Card */
        .mv-card { display: flex; flex-direction: column; background: transparent; border: none; padding: 0; text-align: left; cursor: pointer; font-family: inherit; color: inherit; position: relative; width: 100%; min-width: 0; overflow: hidden; }
        .mv-thumb-wrap { border-radius: 12px; overflow: hidden; background: var(--nav-bg, #1c1c1e); border: 1px solid rgba(255,255,255,0.1); box-sizing: border-box; aspect-ratio: 16 / 9; position: relative; width: 100%; }
        .mv-thumb { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.3s ease; }
        
        .mv-hover-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); opacity: 0; transition: opacity 0.2s ease; display: flex; align-items: center; justify-content: center; }
        .mv-card:hover .mv-hover-overlay { opacity: 1; }
        .mv-card:hover .mv-thumb { transform: scale(1.03); }
        
        .mv-card-dots { position: absolute; bottom: 12px; right: 12px; background: rgba(0,0,0,0.6); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; opacity: 0; transition: opacity 0.2s ease, transform 0.2s ease; backdrop-filter: blur(4px); }
        .mv-card:hover .mv-card-dots { opacity: 1; }
        .mv-card-dots:hover { background: rgba(0,0,0,0.9); transform: scale(1.1); }
        
        .mv-card-title { color: var(--text-main, #fff); font-size: 16px; font-weight: 600; margin-top: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; }
        .mv-card-artist { color: var(--text-muted, #a1a1aa); font-size: 14px; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; }

        /* ── POPUP MENU ──────────────────────────────────────── */
        .mv-popup-backdrop {
          position: fixed; inset: 0; z-index: 9998; display: none;
        }
        
        .mv-popup {
          position: absolute; top: 60px; right: 16px;
          background: #1c1c1e; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;
          padding: 6px 0; z-index: 9999; min-width: 200px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5); animation: dropIn 0.15s ease-out;
        }
        @keyframes dropIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

        .contextual-menu__list { list-style: none; padding: 0; margin: 0; }
        .contextual-menu-item { width: 100%; }
        .contextual-menu-btn { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 14px 20px; background: none; border: none; color: #fff; font-size: 16px; text-align: left; cursor: pointer; transition: background 0.1s ease; }
        .contextual-menu-btn:hover { background: rgba(255,255,255,0.1); }
        .contextual-menu-text { flex: 1; }
        .contextual-menu-icon { display: flex; align-items: center; justify-content: center; width: 16px; height: 16px; color: #f92c47; }
        .contextual-menu__group { position: relative; margin-top: 6px; padding-top: 6px; }
        .contextual-menu__group::before { content: ""; position: absolute; top: 0; left: 16px; right: 16px; height: 1px; background: rgba(255,255,255,0.1); }

        /* Mobile Floating Square Popup */
        @media (max-width: 768px) {
          .mv-popup-backdrop { display: block; background: rgba(0,0,0,0.5); }
          .mv-popup {
            position: fixed; 
            top: auto; 
            bottom: 40px; /* Floats 40px above bottom */
            left: 50%;
            transform: translateX(-50%); /* Centers it horizontally */
            width: 90%; 
            max-width: 320px; /* Prevents it from being 100% width */
            border-radius: 16px; /* Fully rounded corners */
            border: 1px solid rgba(255,255,255,0.1);
            animation: slideUpFade 0.2s ease-out;
            padding-bottom: 6px;
          }
          @keyframes slideUpFade { 
            from { opacity: 0; transform: translate(-50%, 20px); } 
            to { opacity: 1; transform: translate(-50%, 0); } 
          }
        }

        /* ── FULL SCREEN VIDEO MODAL ─────────────────────────────────── */
        .video-modal { position: fixed; inset: 0; background: #000; display: flex; flex-direction: column; z-index: 10000; }
        .video-modal-header { position: absolute; top: 0; left: 0; right: 0; padding: 20px 30px; display: flex; justify-content: flex-start; align-items: center; z-index: 10; background: linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%); }
        .video-close-btn { background: rgba(255,255,255,0.15); border: none; color: white; width: 40px; height: 40px; border-radius: 50%; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s; backdrop-filter: blur(10px); }
        .video-close-btn:hover { background: rgba(255,255,255,0.3); }
        .video-container { flex: 1; display: flex; align-items: center; justify-content: center; background: #000; overflow: hidden; }
        .video-container video { width: 100%; height: 100%; max-width: 100%; max-height: 100%; object-fit: contain; outline: none; }
      `}</style>

      {/* ── HEADER ── */}
      <div className="mv-head">
        <h1 className="mv-title">Music Videos</h1>
        
        <div className="mv-menu-btn-wrap">
          <button className="mv-icon-btn" onClick={() => setShowMenu(!showMenu)}>
            <SortMenuIcon size={16} color="currentColor" />
          </button>
        </div>
      </div>

      {/* ── POPUP MENU ── */}
      {showMenu && (
        <>
          <div className="mv-popup-backdrop" onClick={() => setShowMenu(false)} />
          
          <div className="mv-popup" ref={menuRef}>
            <ul className="contextual-menu__list" role="menu">
              <MenuItem label="Title" isSelected={sortBy === "title"} onClick={() => setSortBy("title")} />
              <MenuItem label="Recently Added" isSelected={sortBy === "recent"} onClick={() => setSortBy("recent")} />
              
              <div className="contextual-menu__group">
                <MenuItem label="Ascending" isSelected={sortOrder === "asc"} onClick={() => setSortOrder("asc")} />
                <MenuItem label="Descending" isSelected={sortOrder === "desc"} onClick={() => setSortOrder("desc")} />
              </div>
            </ul>
          </div>
        </>
      )}

      {/* ── GRID ── */}
      {list.length === 0 ? (
        <p style={{ textAlign: "center", color: "#888", marginTop: 40 }}>No music videos found.</p>
      ) : (
        <div className="mv-grid">
          {list.map((v) => (
            <div key={v.id} className="mv-card" onClick={() => setActiveVideo(v)}>
              <div className="mv-thumb-wrap">
                <img src={v.thumbnail} alt={v.title} className="mv-thumb" loading="lazy" draggable={false} />
                
                <div className="mv-hover-overlay">
                  <PlayCircleIcon />
                </div>

                <button 
                  className="mv-card-dots" 
                  onClick={(e) => handleShare(e, v)}
                  title="Share"
                >
                  <DotsIcon />
                </button>
              </div>
              <div className="mv-card-title">{v.title}</div>
              <div className="mv-card-artist">{v.artist}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── FULL SCREEN HTML5 VIDEO PLAYER MODAL ── */}
      {activeVideo && (
        <div className="video-modal">
          <div className="video-modal-header">
            <button className="video-close-btn" onClick={() => setActiveVideo(null)}>✕</button>
          </div>
          
          <div className="video-container">
            <video 
              src={activeVideo.url} 
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