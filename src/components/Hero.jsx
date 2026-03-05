import { useCallback, useEffect, useRef, useState } from "react";
import { backdrop, getTrending, poster } from "../tmdb";
import { FALLBACK_B, FALLBACK_P, fmtRating, fmtYear, genreLabel } from "../utils/movieUtils";
import { PlayIcon, TrailerIcon } from "./icons";

const BANNER_INTERVAL = 3000;

export default function Hero({ onMovieClick }) {
  const [movies, setMovies] = useState([]);
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);
  const [paused, setPaused] = useState(false);

  const timerRef = useRef(null);
  const progressRef = useRef(null);
  const startedAt = useRef(null);
  const elapsed = useRef(0);

  useEffect(() => {
    getTrending(1)
      .then((data) => {
        const pool = (data.results || []).filter((movie) => movie.backdrop_path && movie.poster_path).slice(0, 10);
        setMovies(pool);
      })
      .catch(() => {});
  }, []);

  const goTo = useCallback((nextIndex) => {
    setFading(true);
    setTimeout(() => {
      setIndex(nextIndex);
      setProgress(0);
      elapsed.current = 0;
      startedAt.current = Date.now();
      setFading(false);
    }, 500);
  }, []);

  const startProgress = useCallback(() => {
    cancelAnimationFrame(progressRef.current);
    startedAt.current = Date.now() - elapsed.current;

    const tick = () => {
      const spent = Date.now() - startedAt.current;
      const percent = Math.min((spent / BANNER_INTERVAL) * 100, 100);
      setProgress(percent);
      if (percent < 100) {
        progressRef.current = requestAnimationFrame(tick);
      }
    };

    progressRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (!movies.length || paused) return;
    startProgress();
    timerRef.current = setTimeout(() => {
      goTo((index + 1) % movies.length);
    }, BANNER_INTERVAL);
    return () => {
      clearTimeout(timerRef.current);
      cancelAnimationFrame(progressRef.current);
    };
  }, [movies, index, paused, goTo, startProgress]);

  const onMouseEnter = () => {
    setPaused(true);
    elapsed.current = Date.now() - (startedAt.current || Date.now());
    clearTimeout(timerRef.current);
    cancelAnimationFrame(progressRef.current);
  };

  const onMouseLeave = () => {
    setPaused(false);
  };

  if (!movies.length) return <div className="hero-skel skeleton" />;

  const movie = movies[index];
  const genres = genreLabel(movie.genre_ids || []);

  return (
    <div className="hero" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {movies.map((item, itemIndex) => (
        <img
          key={item.id}
          className={`hero-bg hero-bg-slide${itemIndex === index ? (fading ? " fade-out" : " active") : ""}`}
          src={backdrop(item.backdrop_path) || FALLBACK_B(item.title)}
          alt={item.title}
          onError={(event) => {
            event.target.src = FALLBACK_B(item.title);
          }}
        />
      ))}

      <div className="hero-overlay" />

      <div className={`hero-content${fading ? " content-fade" : ""}`}>
        <div className="hero-eyebrow">
          <span className="hero-eyebrow-dot" /> FEATURED TONIGHT
        </div>
        <h1 className="hero-title">{movie.title}</h1>
        <div className="hero-meta">
          <span className="hero-score">★ {fmtRating(movie.vote_average)}</span>
          <span className="hero-dot">•</span>
          <span className="hero-info">{fmtYear(movie.release_date)}</span>
          {genres && (
            <>
              <span className="hero-dot">•</span>
              <span className="hero-genre">{genres.toUpperCase()}</span>
            </>
          )}
        </div>
        <p className="hero-desc">
          {(movie.overview || "").slice(0, 200)}
          {(movie.overview || "").length > 200 ? "..." : ""}
        </p>
        <div className="hero-btns">
          <button className="btn-primary" onClick={() => onMovieClick(movie)}>
            <PlayIcon s={20} /> Watch Now
          </button>
          <button className="btn-ghost" onClick={() => onMovieClick(movie)}>
            <TrailerIcon s={18} /> Trailer
          </button>
        </div>
      </div>

      <div className="hero-controls">
        <div className="hero-dots">
          {movies.map((item, itemIndex) => (
            <button
              key={item.id}
              className={`hero-dot-btn${itemIndex === index ? " active" : ""}`}
              onClick={() => {
                if (itemIndex !== index) goTo(itemIndex);
              }}
              title={item.title}
            />
          ))}
        </div>

        <div className="hero-thumbs">
          {movies.map((item, itemIndex) => (
            <button
              key={item.id}
              className={`hero-thumb${itemIndex === index ? " active" : ""}`}
              onClick={() => {
                if (itemIndex !== index) goTo(itemIndex);
              }}
              title={item.title}
            >
              <img
                src={poster(item.poster_path, "w92")}
                alt={item.title}
                onError={(event) => {
                  event.target.src = FALLBACK_P(item.title);
                }}
              />
              <div className="thumb-overlay" />
              {itemIndex === index && <div className="thumb-active-bar" style={{ width: `${progress}%` }} />}
            </button>
          ))}
        </div>
      </div>

      <div className="hero-progress">
        <div className="hero-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <button className="hero-arrow left" onClick={() => goTo((index - 1 + movies.length) % movies.length)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button className="hero-arrow right" onClick={() => goTo((index + 1) % movies.length)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
