const GENRE_MAP = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

export const FALLBACK_P = (title) =>
  `https://placehold.co/156x234/111111/e50914?text=${encodeURIComponent(title || "?")}`;

export const FALLBACK_B = (title) =>
  `https://placehold.co/1280x720/111111/e50914?text=${encodeURIComponent(title || "?")}`;

export const genreLabel = (ids = []) =>
  ids
    .slice(0, 2)
    .map((id) => GENRE_MAP[id])
    .filter(Boolean)
    .join(" / ") || "Movie";

export const fmtRating = (value) => (value ? value.toFixed(1) : "N/A");
export const fmtYear = (date) => (date ? date.slice(0, 4) : "-");
