import { useCallback, useRef, useState } from "react";
import { poster, searchMovies } from "../tmdb";
import { FALLBACK_P, fmtRating, fmtYear } from "../utils/movieUtils";
import { CloseIcon, SearchIcon } from "./icons";

export default function SearchBar({ onSelect }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  const search = useCallback((text) => {
    if (!text.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        const data = await searchMovies(text);
        setResults(data.results || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
  }, []);

  const onChange = (event) => {
    const value = event.target.value;
    setQuery(value);
    search(value);
  };

  const clear = () => {
    setQuery("");
    setResults([]);
    inputRef.current?.focus();
  };

  const pick = (movie) => {
    setQuery("");
    setResults([]);
    setFocused(false);
    onSelect(movie);
  };

  const showDropdown = focused && query.trim().length > 0;

  return (
    <div className="search-wrap">
      <div className={`search-box${focused ? " focused" : ""}`}>
        <SearchIcon />
        <input
          ref={inputRef}
          className="search-input"
          type="text"
          placeholder="Search movies, genres..."
          value={query}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
        />
        {query && (
          <button className="search-clear" onClick={clear}>
            <CloseIcon s={15} />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="search-dropdown">
          {loading ? (
            <div className="sd-loading">
              <div
                style={{
                  width: 16,
                  height: 16,
                  border: "2px solid rgba(229,9,20,.2)",
                  borderTopColor: "var(--red)",
                  borderRadius: "50%",
                  animation: "spin .8s linear infinite",
                }}
              />
              <span>Searching...</span>
            </div>
          ) : results.length > 0 ? (
            results.slice(0, 8).map((movie) => (
              <div key={movie.id} className="sd-item" onMouseDown={() => pick(movie)}>
                <img
                  src={movie.poster_path ? poster(movie.poster_path, "w92") : FALLBACK_P(movie.title)}
                  alt={movie.title}
                  onError={(event) => {
                    event.target.src = FALLBACK_P(movie.title);
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="sd-title">{movie.title}</div>
                  <div className="sd-meta">
                    {fmtYear(movie.release_date)} · ★ {fmtRating(movie.vote_average)}
                  </div>
                </div>
                <span className="sd-badge">{fmtYear(movie.release_date)}</span>
              </div>
            ))
          ) : (
            <div className="sd-empty">No results for "{query}"</div>
          )}
        </div>
      )}
    </div>
  );
}
