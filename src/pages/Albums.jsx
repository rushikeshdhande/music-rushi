import React from "react";
import { Link } from "react-router-dom";
import { REMOTE_ALBUMS } from "../data/remoteAlbums";
import { albumShareUrl } from "../lib/shareUrl";

const Albums = () => {
  return (
    <div className="page">
      <h1>Albums</h1>
      <div className="grid">
        {REMOTE_ALBUMS.map((a) => (
          <Link
            key={a.id}
            to={`/in/album/${slugify(a.name)}/${a.numericId}`}
            className="card"
          >
            <img src={a.artwork} alt="" />
            <div className="card-title">{a.name}</div>
            <div className="card-sub">{a.artist}</div>
          </Link>
        ))}
      </div>
    </div>
  );
};

// tiny local slugify to avoid extra import
function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export default Albums;