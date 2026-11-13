// src/data/musicVideos.js
export const cloudinaryThumb = (url) =>
  url
    .replace("/video/upload/", "/video/upload/so_8,w_640,h_360,c_fill,q_auto/")
    .replace(/\.mp4$/i, ".jpg");

const MAJBOOR_URL =
  "https://res.cloudinary.com/gwjb2ayo/video/upload/v1792785469/Majboor___Sheheryar_Rehan_x_Zoha_Waseem___Music_Video_2025___Aap_ka_he_kehna_banta_1080p.mp4";

const MAJBOOR_THUMBNAIL =
  "https://res.cloudinary.com/gwjb2ayo/image/upload/v1793086630/VS--YouTube-1020MajboorSheheryarRehanxZohaWaseemMusicVideo2025Aapkahekehnabanta-YouTube-2_32.jpg";

export const MUSIC_VIDEOS = [
  {
    id: "mv_majboor",
    title: "Majboor",
    artist: "Sheheryar Rehan & Zoha Wassem",
    url: MAJBOOR_URL,
    thumbnail: MAJBOOR_THUMBNAIL,
    addedAt: 1761300000000,
  },
];

// ✅ Added ?ls to the end of the URL here
export function musicVideoShareUrl(video) {
  const slug = video.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const id = video.addedAt; 
  return `https://music-rushi.vercel.app/in/music-video/${slug}/${id}?ls`;
}