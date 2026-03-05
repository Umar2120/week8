export default function ApiBanner() {
  return (
    <div className="api-banner">
      <span>⚠️</span>
      <span>
        No TMDB API key found. Create <code>.env</code> with <code>VITE_TMDB_API_KEY=your_key</code>. Get a free key at{" "}
        <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noreferrer">
          themoviedb.org
        </a>
      </span>
    </div>
  );
}
