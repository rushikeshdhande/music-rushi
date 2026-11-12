const SHARE_BASE = "https://music-rushi.vercel.app";

export function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function songShareUrl(song) {
  const slug = slugify(song.title) || "song";
  const id = song.numericId || song.id;
  return `${SHARE_BASE}/in/song/${slug}/${id}`;
}

export function albumShareUrl(album) {
  const slug = slugify(album.name) || "album";
  const id = album.numericId || album.id;
  return `${SHARE_BASE}/in/album/${slug}/${id}`;
}

export async function shareSong(song) {
  if (!song) return;
  const url = songShareUrl(song);
  const title = song.title || "Listen to this song";
  const text = `🎵 ${song.title}\nBy ${song.artist || "Unknown Artist"}\n\nListen: ${url}`;
  return _share(title, text, url);
}

export async function shareAlbum(album) {
  if (!album) return;
  const url = albumShareUrl(album);
  const title = album.name || "Listen to this album";
  const text = `💿 ${album.name}\nBy ${album.artist || "Various Artists"}\n\nListen: ${url}`;
  return _share(title, text, url);
}

async function _share(title, text, url) {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return;
    } catch (e) {
      if (e?.name === "AbortError") return;
    }
  }
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
    } else {
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    _toast("Link copied!");
  } catch (e) {
    console.warn("[share] failed:", e);
  }
}

function _toast(msg) {
  const t = document.createElement("div");
  t.textContent = msg;
  Object.assign(t.style, {
    position: "fixed", bottom: "100px", left: "50%",
    transform: "translateX(-50%)", background: "#1c1c1e", color: "#fff",
    padding: "10px 18px", borderRadius: "999px", fontSize: "14px",
    fontWeight: "600", zIndex: 9999, boxShadow: "0 6px 24px rgba(0,0,0,0.3)",
  });
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2000);
}