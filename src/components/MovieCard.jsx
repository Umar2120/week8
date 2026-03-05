import { useState } from "react";
import { poster } from "../tmdb";
import { FALLBACK_P, fmtRating, fmtYear } from "../utils/movieUtils";
import { HeartIcon, InfoIcon, PlayIcon, StarIcon } from "./icons";
import { useFavs } from "../context/favoritesStore";

export default function MovieCard({ movie, onClick }) {
  const [hovered, setHovered] = useState(false);
  const [burst, setBurst] = useState(false);
  const { toggle, isFav } = useFavs();
  const faved = isFav(movie.id);
  const posterPath = movie.poster_path ? poster(movie.poster_path) : null;

  const handleHeart = (event) => {
    event.stopPropagation();
    toggle(movie);
    if (!faved) {
      setBurst(true);
      setTimeout(() => setBurst(false), 600);
    }
  };

  return (
    <div className="movie-card" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={onClick}>
      {posterPath ? (
        <img
          src={posterPath}
          alt={movie.title}
          loading="lazy"
          onError={(event) => {
            event.target.onerror = null;
            event.target.src = FALLBACK_P(movie.title);
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: 234,
            background: "#1a1a1a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#333",
            fontSize: 10,
            padding: 8,
            textAlign: "center",
          }}
        >
          {movie.title}
        </div>
      )}

      <button
        className={`card-heart${faved ? " faved" : ""}${burst ? " burst" : ""}${hovered || faved ? " visible" : ""}`}
        onClick={handleHeart}
        title={faved ? "Remove from favourites" : "Add to favourites"}
      >
        <HeartIcon s={13} filled={faved} />
      </button>

      <div className="card-overlay">
        <p className="card-title">{movie.title}</p>
        <div className="card-meta">
          <StarIcon />
          <span className="card-score">{fmtRating(movie.vote_average)}</span>
          <span className="card-year">• {fmtYear(movie.release_date)}</span>
        </div>
        {hovered && (
          <div className="card-btns">
            <button
              className="card-btn-play"
              onClick={(event) => {
                event.stopPropagation();
                onClick();
              }}
            >
              <PlayIcon s={11} /> Watch
            </button>
            <button
              className="card-btn-info"
              onClick={(event) => {
                event.stopPropagation();
                onClick();
              }}
            >
              <InfoIcon />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
