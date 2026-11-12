import { useState, useMemo } from "react";
import { ALL_SONGS } from "../data/remoteAlbums";
import { usePlayer } from "../contexts/PlayerContext";

export default function Search() {
  const [q, setQ] = useState("");
  const { loadAndPlay, current } = usePlayer();

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return ALL_SONGS.filter((s) =>
      `${s.title} ${s.artist} ${s.album}`.toLowerCase().includes(term)
    );
  }, [q]);

  return (
    <div className="search-page">
      <style>{`
        .search-page {
          max-width: 960px;
          margin: 0 auto;
          padding: 32px 24px 96px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #f5f5f7;
        }
        .search-header { margin-bottom: 24px; }
        .search-title {
          font-size: 2.25rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin: 0 0 4px;
        }
        .search-subtitle {
          color: #a1a1aa;
          font-size: 0.95rem;
          margin: 0;
        }
        .search-bar {
          position: relative;
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 0 12px;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .search-bar:focus-within {
          border-color: #1db954;
          background: rgba(255, 255, 255, 0.09);
          box-shadow: 0 0 0 3px rgba(29, 185, 84, 0.15);
        }
        .search-icon {
          width: 20px;
          height: 20px;
          color: #a1a1aa;
          flex-shrink: 0;
        }
        .search-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #f5f5f7;
          font-size: 1rem;
          padding: 14px 12px;
        }
        .search-input::placeholder { color: #71717a; }
        .search-input::-webkit-search-cancel-button { display: none; }
        .search-clear {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: #d4d4d8;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s;
        }
        .search-clear:hover {
          background: rgba(255, 255, 255, 0.2);
          color: #fff;
        }
        .search-meta {
          margin: 20px 0 12px;
          font-size: 0.85rem;
          color: #a1a1aa;
          letter-spacing: 0.02em;
        }
        .search-empty {
          text-align: center;
          padding: 64px 24px;
          color: #a1a1aa;
        }
        .empty-icon {
          font-size: 2.5rem;
          margin-bottom: 12px;
          opacity: 0.6;
        }
        .empty-hint {
          font-size: 0.85rem;
          color: #71717a;
          margin-top: 4px;
        }
        .song-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .song-row {
          display: grid;
          grid-template-columns: 28px 48px 1fr 32px;
          align-items: center;
          gap: 14px;
          width: 100%;
          padding: 8px 12px;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: inherit;
          text-align: left;
          cursor: pointer;
          transition: background 0.15s;
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
        .song-dot { opacity: 0.5; margin: 0 2px; }
        .song-play {
          font-size: 0.7rem;
          color: #71717a;
          opacity: 0;
          transition: opacity 0.15s;
        }
        .song-row:hover .song-play { opacity: 1; color: #1db954; }
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
        @media (max-width: 600px) {
          .search-page { padding: 20px 16px 96px; }
          .search-title { font-size: 1.75rem; }
          .song-row { grid-template-columns: 20px 44px 1fr; gap: 10px; }
          .song-art { width: 44px; height: 44px; }
          .song-play { display: none; }
        }
      `}</style>

      <header className="search-header">
        <h1 className="search-title">Search</h1>
        <p className="search-subtitle">
          Find songs, artists, and albums from your library
        </p>
      </header>

      <div className="search-bar">
        <svg className="search-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
          />
        </svg>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search songs, artists, or albums"
          className="search-input"
          autoFocus
        />
        {q && (
          <button
            type="button"
            className="search-clear"
            onClick={() => setQ("")}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {q.trim() && (
        <div className="search-meta">
          {results.length} {results.length === 1 ? "result" : "results"} for "
          {q.trim()}"
        </div>
      )}

      {!q.trim() && (
        <div className="search-empty">
          <div className="empty-icon">🎵</div>
          <p>Start typing to search your music library</p>
        </div>
      )}

      {q.trim() && results.length === 0 && (
        <div className="search-empty">
          <div className="empty-icon">🔍</div>
          <p>No results found for "{q.trim()}"</p>
          <p className="empty-hint">Try a different keyword</p>
        </div>
      )}

      {results.length > 0 && (
        <ul className="song-list">
          {results.map((s, i) => {
            const isActive = current?.id === s.id;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  className={`song-row ${isActive ? "active" : ""}`}
                  onClick={() => loadAndPlay(results, i)}
                  aria-current={isActive ? "true" : undefined}
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
                    src={s.artwork}
                    alt={`${s.album} artwork`}
                    className="song-art"
                    loading="lazy"
                  />
                  <div className="song-info">
                    <div className="song-title">{s.title}</div>
                    <div className="song-artist">
                      {s.artist} <span className="song-dot">•</span> {s.album}
                    </div>
                  </div>
                  <span className="song-play">▶</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}