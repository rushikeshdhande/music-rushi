import React from "react";
import { usePlayer } from "../contexts/PlayerContext";
import { ALL_SONGS } from "../data/remoteAlbums";
import { shareSong } from "../lib/shareUrl";

const Songs = () => {
  const { loadAndPlay, current } = usePlayer();

  return (
    <div className="songs-page">
      <style>{`
        .songs-page {
          max-width: 960px;
          margin: 0 auto;
          padding: 32px 24px 96px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #f5f5f7;
        }

        /* ===== Header ===== */
        .songs-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 8px;
        }
        .songs-title {
          font-size: 2.25rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin: 0;
        }
        .songs-count {
          color: #a1a1aa;
          font-size: 0.9rem;
          margin: 6px 0 0;
        }
        .play-all-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #1db954;
          color: #0a0a0a;
          border: none;
          border-radius: 999px;
          padding: 12px 22px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.2s, background 0.2s;
          box-shadow: 0 4px 16px rgba(29, 185, 84, 0.25);
        }
        .play-all-btn:hover {
          background: #1ed760;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(29, 185, 84, 0.35);
        }
        .play-all-btn:active { transform: translateY(0); }

        /* ===== List ===== */
        .song-list {
          list-style: none;
          padding: 0;
          margin: 20px 0 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .song-row {
          display: grid;
          grid-template-columns: 28px 48px 1fr auto;
          align-items: center;
          gap: 14px;
          padding: 8px 12px;
          border-radius: 8px;
          transition: background 0.15s;
          cursor: pointer;
        }
        .song-row:hover { background: rgba(255, 255, 255, 0.06); }
        .song-row.active { background: rgba(29, 185, 84, 0.12); }
        .song-row.active .song-title { color: #1db954; }

        .song-index {
          font-size: 0.85rem;
          color: #71717a;
          text-align: center;
          font-variant-numeric: tabular-nums;
        }

        .song-art {
          width: 48px;
          height: 48px;
          border-radius: 6px;
          object-fit: cover;
          background: #27272a;
        }

        .song-info { min-width: 0; }
        .song-title {
          font-size: 0.95rem;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 2px;
        }
        .song-artist {
          font-size: 0.8rem;
          color: #a1a1aa;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .song-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          opacity: 0.6;
          transition: opacity 0.15s;
        }
        .song-row:hover .song-actions { opacity: 1; }

        .icon-btn {
          background: transparent;
          border: none;
          color: #a1a1aa;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.05rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s, color 0.15s, transform 0.15s;
        }
        .icon-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }
        .icon-btn:active { transform: scale(0.92); }

        .share-btn:hover { color: #4da3ff; }

        /* ===== Playing indicator ===== */
        .playing-indicator {
          display: inline-flex;
          align-items: flex-end;
          gap: 2px;
          height: 14px;
        }
        .playing-indicator span {
          width: 3px;
          background: #1db954;
          border-radius: 1px;
          animation: bounce 0.9s ease-in-out infinite;
        }
        .playing-indicator span:nth-child(1) { height: 60%; animation-delay: -0.2s; }
        .playing-indicator span:nth-child(2) { height: 100%; animation-delay: -0.4s; }
        .playing-indicator span:nth-child(3) { height: 40%; animation-delay: 0s; }
        @keyframes bounce {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
        }

        /* ===== Empty ===== */
        .songs-empty {
          text-align: center;
          padding: 64px 24px;
          color: #a1a1aa;
        }
        .songs-empty .empty-icon {
          font-size: 2.5rem;
          margin-bottom: 12px;
          opacity: 0.6;
        }

        /* ===== Responsive ===== */
        @media (max-width: 600px) {
          .songs-page { padding: 20px 16px 96px; }
          .songs-title { font-size: 1.75rem; }
          .songs-header { flex-direction: column; align-items: flex-start; }
          .song-row { grid-template-columns: 44px 1fr auto; gap: 10px; }
          .song-index { display: none; }
          .song-art { width: 44px; height: 44px; }
        }
      `}</style>

      <header className="songs-header">
        <div>
          <h1 className="songs-title">Songs</h1>
          <p className="songs-count">
            {ALL_SONGS.length} {ALL_SONGS.length === 1 ? "song" : "songs"} in your library
          </p>
        </div>
        <button className="play-all-btn" onClick={() => loadAndPlay(ALL_SONGS, 0)}>
          ▶ Play All
        </button>
      </header>

      {ALL_SONGS.length === 0 ? (
        <div className="songs-empty">
          <div className="empty-icon">🎵</div>
          <p>No songs in your library yet</p>
        </div>
      ) : (
        <ul className="song-list">
          {ALL_SONGS.map((song, i) => {
            const isActive = current?.id === song.id;
            return (
              <li
                key={song.id}
                className={`song-row ${isActive ? "active" : ""}`}
                onClick={() => loadAndPlay(ALL_SONGS, i)}
              >
                <span className="song-index">
                  {isActive ? (
                    <span className="playing-indicator">
                      <span /><span /><span />
                    </span>
                  ) : (
                    i + 1
                  )}
                </span>

                <img
                  src={song.artwork}
                  alt={`${song.title} artwork`}
                  className="song-art"
                  loading="lazy"
                />

                <div className="song-info">
                  <div className="song-title">{song.title}</div>
                  <div className="song-artist">{song.artist}</div>
                </div>

                <div
                  className="song-actions"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="icon-btn share-btn"
                    onClick={() => shareSong(song)}
                    title="Share song"
                    aria-label="Share song"
                  >
                    ⤴
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Songs;