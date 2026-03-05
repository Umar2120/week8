import { ROWS, getTrending, getPopular, getNowPlaying, getUpcoming, getByGenre } from "../tmdb";

export const CAT_ROWS = {
  all: ROWS,
  trending: [
    { id: "t1", label: "🔥 Trending This Week", fetch: getTrending },
    { id: "t2", label: "⚡ Most Popular", fetch: getPopular },
  ],
  now: [
    { id: "n1", label: "🎬 Now Playing", fetch: getNowPlaying },
    { id: "n2", label: "🚀 Coming Soon", fetch: getUpcoming },
  ],
  action: [{ id: "a1", label: "💥 Action", fetch: (page) => getByGenre(28, page) }],
  scifi: [{ id: "s1", label: "🛸 Science Fiction", fetch: (page) => getByGenre(878, page) }],
  thriller: [{ id: "th1", label: "🔪 Thriller", fetch: (page) => getByGenre(53, page) }],
  horror: [{ id: "h1", label: "👁 Horror", fetch: (page) => getByGenre(27, page) }],
  drama: [{ id: "d1", label: "🎭 Drama", fetch: (page) => getByGenre(18, page) }],
  animation: [{ id: "an1", label: "🎨 Animation", fetch: (page) => getByGenre(16, page) }],
  crime: [{ id: "cr1", label: "🕵️ Crime & Thriller", fetch: (page) => getByGenre(80, page) }],
};

export const EXTRA_ROWS = [
  { id: "ex1", label: "🎖 War Films", fetch: (page) => getByGenre(10752, page) },
  { id: "ex2", label: "❤️ Romance", fetch: (page) => getByGenre(10749, page) },
  { id: "ex3", label: "🔍 Mystery", fetch: (page) => getByGenre(9648, page) },
  { id: "ex4", label: "🧙 Fantasy", fetch: (page) => getByGenre(14, page) },
  { id: "ex5", label: "🎵 Music & Docs", fetch: (page) => getByGenre(99, page) },
  { id: "ex6", label: "🌍 Adventure", fetch: (page) => getByGenre(12, page) },
];
