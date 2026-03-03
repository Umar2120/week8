// ============================================================
//  tmdb.js  –  All TMDB API calls
//  Replace TMDB_API_KEY with your key from themoviedb.org
// ============================================================

export const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || "a767fbc283ae5a7b588872bbc2d175b0";
export const BASE_URL     = "https://api.themoviedb.org/3";
export const IMG_BASE     = "https://image.tmdb.org/t/p";

export const poster   = (path, size = "w500")    => path ? `${IMG_BASE}/${size}${path}` : null;
export const backdrop = (path, size = "w1280")   => path ? `${IMG_BASE}/${size}${path}` : null;

const get = async (endpoint, params = {}) => {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set("api_key", TMDB_API_KEY);
  url.searchParams.set("language", "en-US");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB ${res.status}: ${res.statusText}`);
  return res.json();
};

// ── Movie lists ──────────────────────────────────────────────
export const getTrending      = (page = 1) => get("/trending/movie/week",          { page });
export const getNowPlaying    = (page = 1) => get("/movie/now_playing",             { page });
export const getPopular       = (page = 1) => get("/movie/popular",                 { page });
export const getTopRated      = (page = 1) => get("/movie/top_rated",               { page });
export const getUpcoming      = (page = 1) => get("/movie/upcoming",                { page });

// ── By genre ─────────────────────────────────────────────────
export const getByGenre = (genreId, page = 1) =>
  get("/discover/movie", { with_genres: genreId, sort_by: "popularity.desc", page });

// ── Search ───────────────────────────────────────────────────
export const searchMovies = (query, page = 1) =>
  get("/search/movie", { query, page, include_adult: false });

// ── Details & extras ─────────────────────────────────────────
export const getMovieDetails = (id) =>
  get(`/movie/${id}`, { append_to_response: "credits,release_dates" });

export const getMovieVideos = async (id) => {
  const data = await get(`/movie/${id}/videos`);
  // Prefer official YouTube trailers, then teasers
  const videos = data.results || [];
  const trailer =
    videos.find((v) => v.site === "YouTube" && v.type === "Trailer" && v.official) ||
    videos.find((v) => v.site === "YouTube" && v.type === "Trailer") ||
    videos.find((v) => v.site === "YouTube" && v.type === "Teaser") ||
    videos.find((v) => v.site === "YouTube");
  return trailer ? trailer.key : null;
};

export const getWatchProviders = (id) => get(`/movie/${id}/watch/providers`);

export const getSimilar = (id, page = 1) => get(`/movie/${id}/similar`, { page });

// ── Genre list ───────────────────────────────────────────────
export const getGenreList = () => get("/genre/movie/list");

// ── Row definitions (label + fetcher) ────────────────────────
export const ROWS = [
  { id: "trending",   label: "🔥 Trending This Week",   fetch: getTrending   },
  { id: "now",        label: "🎬 Now Playing",           fetch: getNowPlaying  },
  { id: "popular",    label: "⚡ Most Popular",           fetch: getPopular     },
  { id: "toprated",   label: "⭐ Top Rated All Time",    fetch: getTopRated    },
  { id: "upcoming",   label: "🚀 Coming Soon",           fetch: getUpcoming    },
  // Genre rows
  { id: "action",     label: "💥 Action",                fetch: (p) => getByGenre(28, p)   },
  { id: "scifi",      label: "🛸 Science Fiction",       fetch: (p) => getByGenre(878, p)  },
  { id: "thriller",   label: "🔪 Thriller",              fetch: (p) => getByGenre(53, p)   },
  { id: "horror",     label: "👁 Horror",                fetch: (p) => getByGenre(27, p)   },
  { id: "animation",  label: "🎨 Animation",             fetch: (p) => getByGenre(16, p)   },
  { id: "drama",      label: "🎭 Drama",                 fetch: (p) => getByGenre(18, p)   },
  { id: "crime",      label: "🕵️ Crime",                 fetch: (p) => getByGenre(80, p)   },
];

export const NAV_CATEGORIES = [
  { id: "all",       label: "All"             },
  { id: "trending",  label: "🔥 Trending"     },
  { id: "now",       label: "🎬 Now Playing"  },
  { id: "action",    label: "💥 Action"        },
  { id: "scifi",     label: "🛸 Sci-Fi"        },
  { id: "thriller",  label: "🔪 Thriller"     },
  { id: "horror",    label: "👁 Horror"        },
  { id: "drama",     label: "🎭 Drama"         },
  { id: "animation", label: "🎨 Animation"    },
  { id: "crime",     label: "🕵️ Crime"         },
];
