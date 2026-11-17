// src/data/remoteAlbums.js
// Web catalog — loaded from Music API

// Fixed: Removed the trailing /music if your API is actually /api/albums
const ALBUMS_API_URL = "/api/music";

// ✅ EXPORT MUTABLE LISTS
export let REMOTE_ALBUMS = [];
export let ALL_SONGS = [];

// Callback to notify React components
let onUpdateCallback = null;
export function setAlbumsUpdateCallback(cb) {
  onUpdateCallback = cb;
}

export async function refreshRemoteAlbums() {
  try {
    const response = await fetch(`${ALBUMS_API_URL}/albums`, {
      method: "GET",
      headers: { "Accept": "application/json" },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();

    if (result?.success !== true || !Array.isArray(result.data)) {
      throw new Error("Invalid albums API response");
    }

    const albums = result.data;

    // Validate catalog before replacing existing data
    const albumIds = new Set();
    const songIds = new Set();
    const numericIds = new Set();

    for (const album of albums) {
      if (!album?.id || !album?.numericId || !album?.name || !Array.isArray(album.songs)) {
        throw new Error("Invalid album data");
      }

      if (albumIds.has(String(album.id)) || numericIds.has(String(album.numericId))) {
        throw new Error("Duplicate album ID");
      }

      albumIds.add(String(album.id));
      numericIds.add(String(album.numericId));

      for (const song of album.songs) {
        if (!song?.id || !song?.numericId || !song?.title || !song?.uri) {
          throw new Error("Invalid song data");
        }

        if (songIds.has(String(song.id)) || numericIds.has(String(song.numericId))) {
          throw new Error("Duplicate song ID");
        }

        songIds.add(String(song.id));
        numericIds.add(String(song.numericId));
      }
    }

    // ✅ FIX: Reassign variables to trigger React State updates
    REMOTE_ALBUMS = [...albums];
    ALL_SONGS = REMOTE_ALBUMS.flatMap((album) => album.songs);

    console.log(`[Music API] ${REMOTE_ALBUMS.length} albums, ${ALL_SONGS.length} songs loaded`);

    // Notify UI
    if (onUpdateCallback) {
      onUpdateCallback({ albums: REMOTE_ALBUMS, songs: ALL_SONGS });
    }

    return true;
  } catch (error) {
    console.warn("[Music API] Album refresh failed:", error);
    return false;
  }
}

// ─── SEARCH HELPERS (These remain the same) ───

export function findSongByNumericId(numericId) {
  if (numericId == null) return undefined;
  const id = String(numericId);
  return ALL_SONGS.find(
    (song) => String(song.numericId) === id || String(song.id) === id
  );
}

export function findSongById(id) {
  if (id == null) return undefined;
  return ALL_SONGS.find((song) => String(song.id) === String(id));
}

export function findAlbumByNumericId(numericId) {
  if (numericId == null) return undefined;
  const id = String(numericId);
  return REMOTE_ALBUMS.find(
    (album) => String(album.numericId) === id || String(album.id) === id
  );
}

export function findAlbumById(id) {
  if (id == null) return undefined;
  return REMOTE_ALBUMS.find((album) => String(album.id) === String(id));
}

export function findAlbumForSong(song) {
  if (!song) return undefined;
  return (
    REMOTE_ALBUMS.find((album) =>
      album.songs.some((item) => String(item.id) === String(song.id))
    ) || REMOTE_ALBUMS.find((album) => album.name === song.album)
  );
}