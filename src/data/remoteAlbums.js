// src/data/remoteAlbums.js   (WEB — plain JavaScript)
// ⚠️ KEEP IN SYNC with E:\Music\src\services\api\remoteAlbums.ts
//    The REMOTE_ALBUMS array + every helper must be identical.

export const REMOTE_ALBUMS = [
  {
    id: "album_mirzapur",
    numericId: "1762679280",
    name: "Mirzapur",
    artist: "Various Artists",
    artwork:
      "https://res.cloudinary.com/gwjb2ayo/image/upload/v1794327558/592x592bb.webp",
    songs: [
      {
        id: "song_vaaroon",
        numericId: "1762679281",
        title: "Vaaroon (Original Motion Picture Soundtrack) - EP",
        artist: "Mirzapur",
        album: "Mirzapur",
        uri: "https://res.cloudinary.com/gwjb2ayo/video/upload/v1794327924/Vaaroon_Forever_Mirzapur_320_Kbps_1.mp3",
        duration: 0,
        artwork:
          "https://res.cloudinary.com/gwjb2ayo/image/upload/v1794327558/592x592bb.webp",
        albumArt:
          "https://res.cloudinary.com/gwjb2ayo/image/upload/v1794327558/592x592bb.webp",
        isFavorite: false,
        dateAdded: Date.now(),
        dateModified: Date.now(),
      },
    ],
  },
  {
    id: "album_vedaa",
    numericId: "1762679285",
    name: "Vedaa (Original Motion Picture Soundtrack) - EP",
    artist: "Amaal Mallik, Yuva, Manan Bhardwaj",
    artwork:
      "https://res.cloudinary.com/gwjb2ayo/image/upload/v1794416537/Screenshot_2026-11-11_223132.png",
    songs: [
      {
        id: "song_zaroorat_se_zyada",
        numericId: "1762679286",
        title: "Zaroorat Se Zyada",
        artist: "Arijit Singh, Amaal Mallik",
        album: "Vedaa (Original Motion Picture Soundtrack) - EP",
        uri: "https://res.cloudinary.com/gwjb2ayo/video/upload/v1794416729/Zaroorat_Se_Zyada_LYRICS_-_Arijit_Singh_Amaal_Malik_Vedaa_John_Abraham_Tamannaah_B_Kunaal.mp3",
        duration: 0,
        artwork:
          "https://res.cloudinary.com/gwjb2ayo/image/upload/v1794416537/Screenshot_2026-11-11_223132.png",
        albumArt:
          "https://res.cloudinary.com/gwjb2ayo/image/upload/v1794416537/Screenshot_2026-11-11_223132.png",
        isFavorite: false,
        dateAdded: Date.now(),
        dateModified: Date.now(),
      },
      {
        id: "song_zaroorat_se_zyada_duet",
        numericId: "1762679287",
        title: "Zaroorat Se Zyada (Duet)",
        artist: "Arijit Singh, Amaal Mallik",
        album: "Vedaa (Original Motion Picture Soundtrack) - EP",
        uri: "https://res.cloudinary.com/gwjb2ayo/video/upload/v1794468980/Vedaa_2024_-_Zaroorat_Se_Zyada_-_Duet__mp3.pm.mp3",
        duration: 0,
        artwork:
          "https://res.cloudinary.com/gwjb2ayo/image/upload/v1794416537/Screenshot_2026-11-11_223132.png",
        albumArt:
          "https://res.cloudinary.com/gwjb2ayo/image/upload/v1794416537/Screenshot_2026-11-11_223132.png",
        isFavorite: false,
        dateAdded: Date.now(),
        dateModified: Date.now(),
      },
    ],
  },
];

export const ALL_SONGS = REMOTE_ALBUMS.flatMap((a) => a.songs);

export function findSongByNumericId(numericId) {
  if (numericId == null) return undefined;
  const id = String(numericId);
  return ALL_SONGS.find(
    (s) => String(s.numericId) === id || String(s.id) === id
  );
}

export function findSongById(id) {
  if (id == null) return undefined;
  return ALL_SONGS.find((s) => String(s.id) === String(id));
}

export function findAlbumByNumericId(numericId) {
  if (numericId == null) return undefined;
  const id = String(numericId);
  return REMOTE_ALBUMS.find(
    (a) => String(a.numericId) === id || String(a.id) === id
  );
}

export function findAlbumById(id) {
  if (id == null) return undefined;
  return REMOTE_ALBUMS.find((a) => String(a.id) === String(id));
}

export function findAlbumForSong(song) {
  if (!song) return undefined;
  return (
    REMOTE_ALBUMS.find((a) => a.songs.some((s) => s.id === song.id)) ||
    REMOTE_ALBUMS.find((a) => a.name === song.album)
  );
}