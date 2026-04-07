import { Link } from "react-router-dom";

export function VideoCard({ item }) {
  const thumbnail = item.thumbnailUrl || item.posterUrl || "";
  const releaseLabel = item.year
    ? String(item.year).slice(0, 4)
    : "Archive Pick";

  return (
    <article className="card">
      <div className="card__media">
        {thumbnail ? (
          <img src={thumbnail} alt={item.title} className="card__thumb" />
        ) : (
          <div className="card__thumb card__thumb--placeholder">
            {item.title.slice(0, 1)}
          </div>
        )}
        <div className="card__overlay">
          <span className="card__badge">{item.genre}</span>
        </div>
      </div>
      <div className="card__body">
        <p className="card__meta">{releaseLabel}</p>
        <h3>{item.title}</h3>
        <Link to={`/watch/${item.id}`} className="card__link">
          Enter Screening
        </Link>
      </div>
    </article>
  );
}
