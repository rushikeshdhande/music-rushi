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
      },
    ],
  },
  {
    id: "album_vedaa",
    numericId: "1762679285",
    name: "Vedaa (Original Motion Picture Soundtrack) - EP",
    artist: "Arijit Singh, Amaal Mallik",
    artwork:
      "https://res.cloudinary.com/gwjb2ayo/image/upload/v1794416537/Screenshot_2026-11-11_223132.png",
    songs: [
      {
        id: "song_zaroorat_se_zyada",
        numericId: "1762679281",
        title: "Zaroorat Se Zyada",
        artist: "Arijit Singh, Amaal Mallik",
        album: "Vedaa (Original Motion Picture Soundtrack) - EP",
        uri: "https://res.cloudinary.com/gwjb2ayo/video/upload/v1794416729/Zaroorat_Se_Zyada_LYRICS_-_Arijit_Singh_Amaal_Malik_Vedaa_John_Abraham_Tamannaah_B_Kunaal.mp3",
        duration: 0,
        artwork:
          "https://res.cloudinary.com/gwjb2ayo/image/upload/v1794416537/Screenshot_2026-11-11_223132.png",
      },
    ],
  },
];

export const ALL_SONGS = REMOTE_ALBUMS.flatMap((a) => a.songs);
export const ALL_ALBUMS = REMOTE_ALBUMS;

// helpers
export function findSongByNumericId(numericId) {
  return ALL_SONGS.find((s) => String(s.numericId) === String(numericId));
}

export function findAlbumByNumericId(numericId) {
  return ALL_ALBUMS.find((a) => String(a.numericId) === String(numericId));
}