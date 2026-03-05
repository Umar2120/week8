import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { getByGenre, NAV_CATEGORIES, ROWS, TMDB_API_KEY } from "./tmdb";
import { FavProvider } from "./context/FavoritesContext";
import { useFavs } from "./context/favoritesStore";
import { CAT_ROWS, EXTRA_ROWS } from "./constants/categoryRows";
import ApiBanner from "./components/ApiBanner";
import FavouritesLibrary from "./components/FavouritesLibrary";
import Hero from "./components/Hero";
import HorizontalRow from "./components/HorizontalRow";
import MoodMatcher from "./components/MoodMatcher";
import MovieModal from "./components/MovieModal";
import Navbar from "./components/Navbar";
import { GENRE_NAME_MAP } from "./utils/moodMatcher";

const API_MISSING = !TMDB_API_KEY || TMDB_API_KEY === "YOUR_TMDB_API_KEY_HERE";

function AppInner() {
  const [activeCat, setActiveCat] = useState("all");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [extraRows, setExtraRows] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFavs, setShowFavs] = useState(false);
  const [moodRows, setMoodRows] = useState([]);
  const [moodInfo, setMoodInfo] = useState(null);
  const { favs } = useFavs();

  const extraIndexRef = useRef(0);
  const mainRef = useRef(null);

  const currentRows = useMemo(() => CAT_ROWS[activeCat] || ROWS, [activeCat]);

  const loadMoreRows = useCallback(() => {
    if (loadingMore || activeCat !== "all" || extraIndexRef.current >= EXTRA_ROWS.length) return;
    setLoadingMore(true);
    setTimeout(() => {
      const batch = EXTRA_ROWS.slice(extraIndexRef.current, extraIndexRef.current + 2);
      extraIndexRef.current += 2;
      setExtraRows((prev) => [...prev, ...batch]);
      setLoadingMore(false);
    }, 300);
  }, [loadingMore, activeCat]);

  useEffect(() => {
    const element = mainRef.current;
    if (!element) return;
    const onScroll = () => {
      if (element.scrollTop + element.clientHeight >= element.scrollHeight - 600) {
        loadMoreRows();
      }
    };
    element.addEventListener("scroll", onScroll);
    return () => element.removeEventListener("scroll", onScroll);
  }, [loadMoreRows]);

  const handleCategoryChange = (categoryId) => {
    setActiveCat(categoryId);
    setExtraRows([]);
    extraIndexRef.current = 0;
  };

  const handleMoodMatch = (match) => {
    const rows = match.genreIds.map((genreId, index) => ({
      id: `mood-${genreId}-${index}`,
      label: `🤖 ${GENRE_NAME_MAP[genreId] || "Recommended"} for your mood`,
      fetch: (page) => getByGenre(genreId, page),
    }));
    setMoodRows(rows);
    setMoodInfo(match);
    setActiveCat("all");
  };

  return (
    <div className="app-root">
      <Navbar
        activeCat={activeCat}
        categories={NAV_CATEGORIES}
        onCategoryChange={handleCategoryChange}
        showFavs={showFavs}
        onToggleFavs={() => setShowFavs((value) => !value)}
        favCount={favs.length}
        onSelectMovie={setSelectedMovie}
      />

      {API_MISSING && <ApiBanner />}

      <main className="main-scroll" ref={mainRef}>
        <MoodMatcher onMoodMatch={handleMoodMatch} />

        {moodRows.length > 0 && (
          <section className="mood-results">
            <div className="mood-results-head">
              <div>
                <h4>AI Mood Picks</h4>
                <p>
                  Based on: "{moodInfo?.input}" · Match: {moodInfo?.profileLabel} ({moodInfo?.confidence}%)
                </p>
              </div>
              <button
                className="mood-clear-btn"
                onClick={() => {
                  setMoodRows([]);
                  setMoodInfo(null);
                }}
              >
                Clear
              </button>
            </div>
            {moodRows.map((row) => (
              <HorizontalRow key={row.id} title={row.label} fetchFn={row.fetch} onMovieClick={setSelectedMovie} />
            ))}
          </section>
        )}

        {activeCat === "all" && <Hero onMovieClick={setSelectedMovie} />}

        <div className="rows-container">
          {currentRows.map((row) => (
            <HorizontalRow
              key={`${activeCat}-${row.id}`}
              title={row.label}
              fetchFn={row.fetch}
              onMovieClick={setSelectedMovie}
            />
          ))}

          {extraRows.map((row) => (
            <HorizontalRow key={row.id} title={row.label} fetchFn={row.fetch} onMovieClick={setSelectedMovie} />
          ))}

          {loadingMore && (
            <div className="load-more">
              <div className="sm-spin" />
              <span>LOADING MORE</span>
            </div>
          )}
        </div>
      </main>

      {selectedMovie && <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />}

      {showFavs && <FavouritesLibrary onMovieClick={setSelectedMovie} onClose={() => setShowFavs(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <FavProvider>
      <AppInner />
    </FavProvider>
  );
}
