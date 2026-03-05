import { useCallback, useEffect, useState } from "react";
import { backdrop, getMovieDetails, getMovieVideos, poster } from "../tmdb";
import { FALLBACK_B, FALLBACK_P, fmtRating, fmtYear, genreLabel } from "../utils/movieUtils";
import { BackIcon, CloseIcon, HeartIcon, PlayIcon, TrailerIcon } from "./icons";
import { useFavs } from "../context/favoritesStore";
import StreamingPanel from "./StreamingPanel";

function ModalFavBtn({ movie }) {
  const { toggle, isFav } = useFavs();
  const faved = isFav(movie.id);

  return (
    <button
      className={`modal-btn-fav${faved ? " faved" : ""}`}
      onClick={() => toggle(movie)}
      title={faved ? "Remove from favourites" : "Add to favourites"}
    >
      <HeartIcon s={18} filled={faved} />
      {faved ? "Saved" : "Save"}
    </button>
  );
}

export default function MovieModal({ movie, onClose }) {
  const [mode, setMode] = useState(null);
  const [trailerId, setTrailerId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    getMovieDetails(movie.id).then(setDetails).catch(() => {});
    return () => {
      document.body.style.overflow = "";
    };
  }, [movie.id]);

  const fetchTrailer = useCallback(async () => {
    if (trailerId) return trailerId;
    setBusy(true);
    try {
      const key = await getMovieVideos(movie.id);
      setTrailerId(key || null);
      return key;
    } catch {
      return null;
    } finally {
      setBusy(false);
    }
  }, [movie.id, trailerId]);

  const openTrailer = async () => {
    await fetchTrailer();
    setMode("trailer");
  };

  const backdropPath = movie.backdrop_path ? backdrop(movie.backdrop_path) : FALLBACK_B(movie.title);
  const posterPath = movie.poster_path ? poster(movie.poster_path) : FALLBACK_P(movie.title);
  const runtime = details?.runtime ? `${details.runtime}m` : "";
  const genres = genreLabel(movie.genre_ids || details?.genres?.map((item) => item.id) || []);

  return (
    <div className="modal-overlay" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-top">
          <img src={backdropPath} alt={movie.title} onError={(event) => { event.target.src = FALLBACK_B(movie.title); }} />
          <div className="modal-top-grad" />
          <button className="modal-close" onClick={onClose}>
            <CloseIcon s={17} />
          </button>
          <div className="modal-title-area">
            <div className="modal-genre-tag">{genres.toUpperCase()}</div>
            <h2 className="modal-title">{movie.title}</h2>
          </div>
        </div>

        <div className="modal-body">
          <div className="modal-row">
            <img className="modal-poster" src={posterPath} alt={movie.title} onError={(event) => { event.target.src = FALLBACK_P(movie.title); }} />
            <div style={{ flex: 1 }}>
              <div className="modal-tags">
                {[fmtYear(movie.release_date), runtime, `★ ${fmtRating(movie.vote_average)}`, genres]
                  .filter(Boolean)
                  .map((tag, index) => (
                    <span key={index} className="modal-tag">
                      {tag}
                    </span>
                  ))}
              </div>
              <p className="modal-overview">{movie.overview || "No description available."}</p>
            </div>
          </div>

          {mode === null && (
            <div className="modal-btns">
              <button className="modal-btn-watch" onClick={() => setMode("streaming")}>
                <PlayIcon s={20} /> Watch Full Movie
              </button>
              <button className="modal-btn-trailer" onClick={openTrailer} disabled={busy}>
                <TrailerIcon s={18} /> {busy ? "Loading..." : "Watch Trailer"}
              </button>
              <ModalFavBtn movie={movie} />
            </div>
          )}

          {mode === "streaming" && <StreamingPanel movie={movie} onBack={() => setMode(null)} />}

          {mode === "trailer" && (
            <div className="video-wrap">
              <div className="video-head">
                <div className="video-label">
                  <TrailerIcon s={13} /> TRAILER - {movie.title}
                </div>
                <button className="video-back" onClick={() => setMode(null)}>
                  <BackIcon /> Back
                </button>
              </div>

              <div className="player-wrap">
                {trailerId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${trailerId}?autoplay=1&rel=0&modestbranding=1`}
                    title={`${movie.title} Trailer`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="trailer-loading">
                    <div className="spinner" />
                    <p>{busy ? "Fetching trailer..." : "No trailer available"}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
