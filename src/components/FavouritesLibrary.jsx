import { useMemo, useState } from "react";
import { poster } from "../tmdb";
import { FALLBACK_P, fmtRating, fmtYear } from "../utils/movieUtils";
import { CloseIcon, HeartIcon, PlayIcon, TrashIcon } from "./icons";
import { useFavs } from "../context/favoritesStore";

export default function FavouritesLibrary({ onMovieClick, onClose }) {
  const { favs, toggle, clearAll } = useFavs();
  const [confirmClear, setConfirmClear] = useState(false);
  const [sortBy, setSortBy] = useState("added");

  const sorted = useMemo(() => {
    const list = [...favs];
    if (sortBy === "rating") return list.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
    if (sortBy === "year") return list.sort((a, b) => (b.release_date || "").localeCompare(a.release_date || ""));
    if (sortBy === "title") return list.sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [favs, sortBy]);

  return (
    <div className="fav-overlay" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="fav-panel">
        <div className="fav-header">
          <div className="fav-header-left">
            <div className="fav-title-wrap">
              <HeartIcon s={20} filled />
              <h2 className="fav-title">My Favourites</h2>
              <span className="fav-count">{favs.length}</span>
            </div>
            {favs.length > 0 && (
              <div className="fav-sort">
                {["added", "rating", "year", "title"].map((sort) => (
                  <button key={sort} className={`sort-pill${sortBy === sort ? " active" : ""}`} onClick={() => setSortBy(sort)}>
                    {sort.charAt(0).toUpperCase() + sort.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="fav-header-right">
            {favs.length > 0 &&
              (confirmClear ? (
                <div className="fav-confirm">
                  <span>Clear all?</span>
                  <button
                    className="confirm-yes"
                    onClick={() => {
                      clearAll();
                      setConfirmClear(false);
                    }}
                  >
                    Yes
                  </button>
                  <button className="confirm-no" onClick={() => setConfirmClear(false)}>
                    No
                  </button>
                </div>
              ) : (
                <button className="fav-clear-btn" onClick={() => setConfirmClear(true)}>
                  <TrashIcon s={13} /> Clear All
                </button>
              ))}
            <button className="fav-close" onClick={onClose}>
              <CloseIcon s={18} />
            </button>
          </div>
        </div>

        <div className="fav-body">
          {favs.length === 0 ? (
            <div className="fav-empty">
              <div className="fav-empty-icon">
                <HeartIcon s={48} />
              </div>
              <h3>No favourites yet</h3>
              <p>Click the heart on any movie card to add it here</p>
            </div>
          ) : (
            <div className="fav-grid">
              {sorted.map((movie) => (
                <div key={movie.id} className="fav-item">
                  <div
                    className="fav-item-inner"
                    onClick={() => {
                      onMovieClick(movie);
                      onClose();
                    }}
                  >
                    <img
                      src={movie.poster_path ? poster(movie.poster_path) : FALLBACK_P(movie.title)}
                      alt={movie.title}
                      onError={(event) => {
                        event.target.src = FALLBACK_P(movie.title);
                      }}
                    />
                    <div className="fav-item-overlay">
                      <button className="fav-item-play">
                        <PlayIcon s={18} />
                      </button>
                    </div>
                  </div>

                  <div className="fav-item-info">
                    <p className="fav-item-title">{movie.title}</p>
                    <div className="fav-item-meta">
                      <span className="fav-item-score">★ {fmtRating(movie.vote_average)}</span>
                      <span className="fav-item-year">{fmtYear(movie.release_date)}</span>
                    </div>
                  </div>

                  <button
                    className="fav-item-remove"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggle(movie);
                    }}
                    title="Remove from favourites"
                  >
                    <CloseIcon s={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
