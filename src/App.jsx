import React, { useEffect } from "react";
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

// ✅ NEW: Import the Shared Music Video page
import SharedMusicVideo from "./pages/SharedMusicVideo";

import "./index.css";

function ThemeCleaner() {
  const loc = useLocation();
  useEffect(() => {
    const isAlbumPage =
      loc.pathname.startsWith("/albums/") ||
      loc.pathname.startsWith("/album/") ||
      loc.pathname.startsWith("/in/album/");
    if (!isAlbumPage) clearAlbumTheme();
  }, [loc.pathname]);
  return null;
}

function ShareAlbumRedirect() {
  const { id } = useParams();
  return <Navigate to={`/album/${id}`} replace />;
}

function AppShell() {
  return (
    <div className="app">
      <Navbar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/library" element={<Library />} />
          <Route path="/songs" element={<Songs />} />
          <Route path="/albums" element={<Albums />} />

          {/* Music Videos */}
          <Route path="/music-videos" element={<MusicVideo />} />

          {/* ✅ NEW: Shared Music Video Route */}
          <Route path="/in/music-video/:slug/:id" element={<SharedMusicVideo />} />

          {/* Album screens */}
          <Route path="/album/:id" element={<AlbumDetails />} />
          <Route path="/albums/:albumName" element={<AlbumDetails />} />

          <Route path="/search" element={<Search />} />

          {/* Shared song links */}
          <Route path="/in/song/:slug/:id" element={<SharedSong />} />
          <Route path="/in/song/:id" element={<SharedSong />} />

          {/* Shared album links */}
          <Route path="/in/album/:slug/:id" element={<ShareAlbumRedirect />} />
          <Route path="/in/album/:id" element={<ShareAlbumRedirect />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Player />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <PlayerProvider>
        <ThemeCleaner />
        <AppShell />
      </PlayerProvider>
    </BrowserRouter>
  );
}