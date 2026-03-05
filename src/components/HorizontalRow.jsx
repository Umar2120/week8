import { useCallback, useEffect, useRef, useState } from "react";
import MovieCard from "./MovieCard";

export default function HorizontalRow({ title, fetchFn, onMovieClick }) {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const rowRef = useRef(null);
  const drag = useRef(null);
  const isDrag = useRef(false);

  const load = useCallback(
    async (nextPage) => {
      setLoading(true);
      try {
        const data = await fetchFn(nextPage);
        const results = (data.results || []).filter((movie) => movie.poster_path);
        setMovies((prev) => (nextPage === 1 ? results : [...prev, ...results]));
        setHasMore(nextPage < Math.min(data.total_pages || 1, 10));
      } catch {
        // Keep the row stable if an API request fails.
      } finally {
        setLoading(false);
      }
    },
    [fetchFn],
  );

  useEffect(() => {
    setMovies([]);
    setPage(1);
    setHasMore(true);
    load(1);
  }, [load]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;
    const next = page + 1;
    setPage(next);
    load(next);
  }, [hasMore, loading, page, load]);

  const onMouseDown = (event) => {
    isDrag.current = false;
    drag.current = { x: event.clientX, scrollLeft: rowRef.current.scrollLeft };
  };

  const onMouseMove = (event) => {
    if (!drag.current) return;
    const deltaX = event.clientX - drag.current.x;
    if (Math.abs(deltaX) > 4) isDrag.current = true;
    rowRef.current.scrollLeft = drag.current.scrollLeft - deltaX;
  };

  const onMouseUp = () => {
    drag.current = null;
  };

  const onScroll = () => {
    const element = rowRef.current;
    if (element && element.scrollLeft + element.clientWidth >= element.scrollWidth - 320) {
      loadMore();
    }
  };

  if (loading && movies.length === 0) {
    return (
      <div className="movie-row">
        <div className="row-head">
          <div className="row-bar" />
          <h3 className="row-title">{title}</h3>
        </div>
        <div className="row-scroll" style={{ pointerEvents: "none" }}>
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="card-skel skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="movie-row">
      <div className="row-head">
        <div className="row-bar" />
        <h3 className="row-title">{title}</h3>
      </div>
      <div
        ref={rowRef}
        className="row-scroll"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onScroll={onScroll}
      >
        {movies.map((movie, index) => (
          <MovieCard key={`${movie.id}-${index}`} movie={movie} onClick={() => !isDrag.current && onMovieClick(movie)} />
        ))}
        {loading && <div className="card-skel skeleton" style={{ minWidth: 156, height: 234, flexShrink: 0 }} />}
        <div className="row-end" />
      </div>
    </div>
  );
}
