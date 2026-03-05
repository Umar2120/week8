export const PLATFORM_CONFIG = {
  8: { name: "Netflix", color: "#E50914", bg: "#141414", url: (title) => `https://www.netflix.com/search?q=${encodeURIComponent(title)}` },
  9: { name: "Prime Video", color: "#00A8E1", bg: "#0F171E", url: (title) => `https://www.amazon.com/s?k=${encodeURIComponent(title)}&i=instant-video` },
  337: { name: "Disney+", color: "#113CCF", bg: "#040B2C", url: (title) => `https://www.disneyplus.com/search/${encodeURIComponent(title)}` },
  15: { name: "Hulu", color: "#1CE783", bg: "#0B0B0B", url: (title) => `https://www.hulu.com/search?q=${encodeURIComponent(title)}` },
  384: { name: "HBO Max", color: "#7B2FBE", bg: "#0D0221", url: (title) => `https://play.max.com/search?q=${encodeURIComponent(title)}` },
  386: { name: "Peacock", color: "#FFFFFF", bg: "#1A1A2E", url: (title) => `https://www.peacocktv.com/search?q=${encodeURIComponent(title)}` },
  283: { name: "Crunchyroll", color: "#F47521", bg: "#1A0A00", url: (title) => `https://www.crunchyroll.com/search?q=${encodeURIComponent(title)}` },
  2: { name: "Apple TV+", color: "#FFFFFF", bg: "#1C1C1E", url: (title) => `https://tv.apple.com/search?term=${encodeURIComponent(title)}` },
  531: { name: "Paramount+", color: "#0064FF", bg: "#001033", url: (title) => `https://www.paramountplus.com/search/${encodeURIComponent(title)}/` },
  3: { name: "Google Play", color: "#4CAF50", bg: "#0A1628", url: (title) => `https://play.google.com/store/search?q=${encodeURIComponent(title)}&c=movies` },
  10: { name: "Amazon", color: "#FF9900", bg: "#0F1111", url: (title) => `https://www.amazon.com/s?k=${encodeURIComponent(title)}&i=movies-tv` },
  192: { name: "YouTube", color: "#FF0000", bg: "#0F0F0F", url: (title) => `https://www.youtube.com/results?search_query=${encodeURIComponent(title)}+full+movie` },
};

export const FALLBACK_PLATFORMS = [
  { name: "Netflix", color: "#E50914", bg: "#141414", url: (title) => `https://www.netflix.com/search?q=${encodeURIComponent(title)}` },
  { name: "Prime Video", color: "#00A8E1", bg: "#0F171E", url: (title) => `https://www.amazon.com/s?k=${encodeURIComponent(title)}&i=instant-video` },
  { name: "Disney+", color: "#113CCF", bg: "#040B2C", url: (title) => `https://www.disneyplus.com/search/${encodeURIComponent(title)}` },
  { name: "HBO Max", color: "#7B2FBE", bg: "#0D0221", url: (title) => `https://play.max.com/search?q=${encodeURIComponent(title)}` },
  { name: "Hulu", color: "#1CE783", bg: "#0B0B0B", url: (title) => `https://www.hulu.com/search?q=${encodeURIComponent(title)}` },
  { name: "Apple TV+", color: "#FFFFFF", bg: "#1C1C1E", url: (title) => `https://tv.apple.com/search?term=${encodeURIComponent(title)}` },
  { name: "YouTube", color: "#FF0000", bg: "#0F0F0F", url: (title) => `https://www.youtube.com/results?search_query=${encodeURIComponent(title)}+full+movie` },
  { name: "Google Play", color: "#4CAF50", bg: "#0A1628", url: (title) => `https://play.google.com/store/search?q=${encodeURIComponent(title)}&c=movies` },
];
