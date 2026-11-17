 
import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useParams,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Player from "./components/Player";

import { PlayerProvider } from "./contexts/PlayerContext";
import { clearAlbumTheme } from "./lib/albumTheme";

import Home from "./pages/Home";
import Library from "./pages/Library";
import Songs from "./pages/Songs";
import Albums from "./pages/Albums";
import AlbumDetails from "./pages/AlbumDetails";
import Search from "./pages/Search";
import SharedSong from "./pages/SharedSong";
import MusicVideo from "./pages/MusicVideo";
import SharedMusicVideo from "./pages/SharedMusicVideo";

import { refreshRemoteAlbums } from "./data/remoteAlbums";
import { refreshMusicVideos } from "./data/musicVideos";

import "./index.css";

// Load remote music catalog before rendering pages
function CatalogLoader({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadCatalog() {
      console.log("[Music API] Loading catalog...");

      const [albumsLoaded, videosLoaded] = await Promise.all([
        refreshRemoteAlbums(),
        refreshMusicVideos(),
      ]);

      console.log("[Music API] Catalog loading completed", {
        albumsLoaded,
        videosLoaded,
      });

      if (active) {
        setReady(true);
      }
    }

    loadCatalog().catch((error) => {
      console.error("[Music API] Catalog loading error:", error);

      if (active) {
        setReady(true);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  if (!ready) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000",
          color: "#fff",
          fontSize: "15px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Loading your music...
      </div>
    );
  }

  return children;
}

// Clear album theme outside album pages
function ThemeCleaner() {
  const { pathname } = useLocation();

  useEffect(() => {
    const isAlbumPage =
      pathname.startsWith("/albums/") ||
      pathname.startsWith("/album/") ||
      pathname.startsWith("/in/album/");

    if (!isAlbumPage) {
      clearAlbumTheme();
    }
  }, [pathname]);

  return null;
}

// Redirect shared album links
function ShareAlbumRedirect() {
  const { id } = useParams();

  return <Navigate to={`/album/${id}`} replace />;
}

// Application routes and layout
function AppShell() {
  return (
    <>
      <style>{`
        .main {
          padding-bottom: calc(
            120px + env(safe-area-inset-bottom, 0px)
          );
        }

        @media (max-width: 640px) {
          .main {
            padding-bottom: calc(
              96px + env(safe-area-inset-bottom, 0px)
            );
          }
        }
      `}</style>

      <div className="app">
        <Navbar />

        <main className="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/library" element={<Library />} />
            <Route path="/songs" element={<Songs />} />
            <Route path="/albums" element={<Albums />} />
            <Route path="/music-videos" element={<MusicVideo />} />

            <Route
              path="/in/music-video/:slug/:id"
              element={<SharedMusicVideo />}
            />

            <Route path="/album/:id" element={<AlbumDetails />} />
            <Route path="/albums/:albumName" element={<AlbumDetails />} />

            <Route path="/search" element={<Search />} />

            <Route
              path="/in/song/:slug/:id"
              element={<SharedSong />}
            />

            <Route
              path="/in/song/:id"
              element={<SharedSong />}
            />

            <Route
              path="/in/album/:slug/:id"
              element={<ShareAlbumRedirect />}
            />

            <Route
              path="/in/album/:id"
              element={<ShareAlbumRedirect />}
            />

            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />
          </Routes>
        </main>
      </div>

      <Player />
    </>
  );
}

// Root application
export default function App() {
  return (
    <BrowserRouter>
      <PlayerProvider>
        <CatalogLoader>
          <ThemeCleaner />
          <AppShell />
        </CatalogLoader>
      </PlayerProvider>
    </BrowserRouter>
  );
} 