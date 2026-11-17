// src/data/musicVideos.js

// Fixed: Removed the trailing /music if your API is actually /api/videos
// If your API is truly /api/music/videos, change this back to /api/music
const VIDEOS_API_URL = "/api/music";

// ✅ EXPORT A MUTABLE REFERENCE (but we will use a listener to trigger UI updates)
export let MUSIC_VIDEOS = [];

// Callback to notify React components when data is loaded
let onUpdateCallback = null;
export function setVideosUpdateCallback(cb) {
  onUpdateCallback = cb;
}

export const cloudinaryThumb = (url) => {
  if (!url || typeof url !== "string") return "";

  return url
    .replace(
      "/video/upload/",
      "/video/upload/so_8,w_640,h_360,c_fill,q_auto/"
    )
    .replace(/\.mp4$/i, ".jpg");
};

export async function refreshMusicVideos() {
  try {
    // Added headers and cache bypass to ensure fresh data
    const response = await fetch(`${VIDEOS_API_URL}/videos`, {
      method: "GET",
      headers: { "Accept": "application/json" },
      cache: "no-store" 
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();

    if (result?.success !== true || !Array.isArray(result.data)) {
      throw new Error("Invalid videos API response");
    }

    const videos = result.data;

    const validVideos = videos.every(
      (video) =>
        video &&
        typeof video.id === "string" &&
        typeof video.title === "string" &&
        typeof video.artist === "string" &&
        typeof video.url === "string" &&
        typeof video.thumbnail === "string" &&
        typeof video.addedAt === "number"
    );

    if (!validVideos) {
      throw new Error("Invalid video fields");
    }

    // ✅ FIX: Reassign instead of splice to force React re-renders
    MUSIC_VIDEOS = [...videos];

    console.log(`[Music API] ${MUSIC_VIDEOS.length} videos loaded`);

    // Notify UI
    if (onUpdateCallback) onUpdateCallback(MUSIC_VIDEOS);

    return true;
  } catch (error) {
    console.warn("[Music API] Video refresh failed:", error);
    return false;
  }
}


export function musicVideoShareUrl(video) {
  const slug = video.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const id = video.addedAt ?? video.id;

  return `https://music-rushi.vercel.app/in/music-video/${slug}/${id}`;
}
