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
import "./index.css";

/** Clears album theme on any route that isn't an album page */
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

/** /in/album/:slug/:id  →  /album/:id  (renders the normal AlbumDetails screen) */
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

          {/* Album screens — ALWAYS AlbumDetails, never SharedAlbum */}
          <Route path="/album/:id" element={<AlbumDetails />} />
          <Route path="/albums/:albumName" element={<AlbumDetails />} />

          <Route path="/search" element={<Search />} />

          {/* Shared song links → SharedSong */}
          <Route path="/in/song/:slug/:id" element={<SharedSong />} />
          <Route path="/in/song/:id" element={<SharedSong />} />

          {/* Shared album links → redirect into the normal AlbumDetails screen */}
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