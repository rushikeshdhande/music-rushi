import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Player from "./components/Player";
import { PlayerProvider } from "./contexts/PlayerContext";
import { useSyncStore } from "./lib/syncStore";

import Home from "./pages/Home";
import Library from "./pages/Library";
import Songs from "./pages/Songs";
import Albums from "./pages/Albums";
import AlbumDetails from "./pages/AlbumDetails";
import Artists from "./pages/Artists";
import ArtistDetails from "./pages/ArtistDetails";
import Favourites from "./pages/Favourites";
import Playlists from "./pages/Playlists";
import PlaylistDetails from "./pages/PlaylistDetails";
import Search from "./pages/Search";
import Videos from "./pages/Videos";
import New from "./pages/New";
import Radio from "./pages/Radio";
import SharedSong from "./pages/SharedSong";
import SharedAlbum from "./pages/SharedAlbum";
import "./index.css";

export default function App() {
  const hydrate = useSyncStore((s) => s.hydrate);
  useEffect(() => { hydrate(); }, [hydrate]);

  return (
    <BrowserRouter>
      <PlayerProvider>
        <div className="app">
          <Navbar />
          <main className="main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/library" element={<Library />} />
              <Route path="/songs" element={<Songs />} />
              <Route path="/albums" element={<Albums />} />
              <Route path="/albums/:albumName" element={<AlbumDetails />} />
              <Route path="/artists" element={<Artists />} />
              <Route path="/artists/:artistName" element={<ArtistDetails />} />
              <Route path="/favourites" element={<Favourites />} />
              <Route path="/playlists" element={<Playlists />} />
              <Route path="/playlists/:id" element={<PlaylistDetails />} />
              <Route path="/search" element={<Search />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="/new" element={<New />} />
              <Route path="/radio" element={<Radio />} />

              {/* Shared deep links */}
              <Route path="/in/song/:slug/:id" element={<SharedSong />} />
              <Route path="/in/song/:id" element={<SharedSong />} />
              <Route path="/in/album/:slug/:id" element={<SharedAlbum />} />
              <Route path="/in/album/:id" element={<SharedAlbum />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Player />
        </div>
      </PlayerProvider>
    </BrowserRouter>
  );
}