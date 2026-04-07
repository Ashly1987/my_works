import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiClient } from "../services/apiClient";

function isBrowserPlayableVideo(url) {
  if (!url) {
    return false;
  }

  const lowered = String(url).toLowerCase();
  return (
    lowered.endsWith(".mp4") ||
    lowered.endsWith(".webm") ||
    lowered.endsWith(".ogg") ||
    lowered.includes(".m3u8")
  );
}

export function WatchPage() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const content = await apiClient.getContentDetail(id);
        setItem(content);
      } catch (err) {
        setError(err.message);
      }
    }

    load();
  }, [id]);

  if (error) {
    return (
      <main className="page">
        <p className="error">{error}</p>
      </main>
    );
  }

  if (!item) {
    return (
      <main className="page">
        <p>Loading video...</p>
      </main>
    );
  }

  const mediaUrl = item.streamUrl || item.downloadUrl || "";
  const isPlayable = isBrowserPlayableVideo(mediaUrl);
  const hasMediaLink = Boolean(mediaUrl);

  return (
    <main className="page watch">
      <div className="watch__header">
        <Link to="/" className="watch__back">
          Back to Home
        </Link>
        <p className="watch__eyebrow">{item.genre || "Feature Presentation"}</p>
        <h1>{item.title}</h1>
        <p className="watch__description">{item.description}</p>
      </div>
      {isPlayable ? (
        <div className="watch__stage">
          <video
            controls
            width="100%"
            poster={item.thumbnailUrl || item.posterUrl}
            src={mediaUrl}
          />
        </div>
      ) : hasMediaLink ? (
        <a
          href={mediaUrl}
          target="_blank"
          rel="noreferrer"
          className="watch__external-link"
        >
          {item.thumbnailUrl || item.posterUrl ? (
            <img
              src={item.thumbnailUrl || item.posterUrl}
              alt={`${item.title} poster`}
              className="watch__poster"
            />
          ) : null}
          <span className="watch__cta">Open movie link / Download</span>
        </a>
      ) : (
        <p className="error">No source link is available for this title.</p>
      )}
    </main>
  );
}
