import { useEffect, useMemo, useState } from "react";
import { getWatchProviders } from "../tmdb";
import { BackIcon, PlayIcon } from "./icons";
import { FALLBACK_PLATFORMS, PLATFORM_CONFIG } from "../constants/streamingPlatforms";

function PlatformCard({ platform }) {
  return (
    <a className="platform-card" href={platform.url} target="_blank" rel="noreferrer" style={{ "--pc-color": platform.color, "--pc-bg": platform.bg }}>
      <div className="pc-inner">
        {platform.logo ? (
          <img className="pc-logo-img" src={platform.logo} alt={platform.name} />
        ) : (
          <div className="pc-logo-text" style={{ color: platform.color }}>
            {platform.name.charAt(0)}
          </div>
        )}
        <span className="pc-name">{platform.name}</span>
        {platform.type === "stream" && <span className="pc-badge stream">Stream</span>}
        {platform.type === "rent" && <span className="pc-badge rent">Rent</span>}
        {platform.type === "buy" && <span className="pc-badge buy">Buy</span>}
        {platform.type === "search" && <span className="pc-badge search">Search</span>}
      </div>
      <div className="pc-arrow">→</div>
    </a>
  );
}

export default function StreamingPanel({ movie, onBack }) {
  const [providers, setProviders] = useState(null);
  const [loadingProviders, setLoadingProviders] = useState(true);

  useEffect(() => {
    getWatchProviders(movie.id)
      .then((data) => {
        const regions = data?.results || {};
        const region = regions.IN || regions.US || Object.values(regions)[0] || null;
        setProviders(region);
      })
      .catch(() => setProviders(null))
      .finally(() => setLoadingProviders(false));
  }, [movie.id]);

  const allProviders = useMemo(() => {
    if (!providers) return [];
    const seen = new Set();
    const merged = [];
    [...(providers.flatrate || []), ...(providers.rent || []), ...(providers.buy || [])].forEach((provider) => {
      if (!seen.has(provider.provider_id)) {
        seen.add(provider.provider_id);
        merged.push(provider);
      }
    });
    return merged;
  }, [providers]);

  const platforms = useMemo(() => {
    if (allProviders.length > 0) {
      return allProviders.map((provider) => {
        const config = PLATFORM_CONFIG[provider.provider_id];
        return {
          id: provider.provider_id,
          name: config?.name || provider.provider_name,
          color: config?.color || "#e50914",
          bg: config?.bg || "#1a1a1a",
          logo: provider.logo_path ? `https://image.tmdb.org/t/p/w92${provider.logo_path}` : null,
          url: config
            ? config.url(movie.title)
            : `https://www.google.com/search?q=watch+${encodeURIComponent(movie.title)}+online`,
          type: providers.flatrate?.find((item) => item.provider_id === provider.provider_id)
            ? "stream"
            : providers.rent?.find((item) => item.provider_id === provider.provider_id)
              ? "rent"
              : "buy",
        };
      });
    }

    return FALLBACK_PLATFORMS.map((platform, index) => ({
      id: index,
      ...platform,
      logo: null,
      url: platform.url(movie.title),
      type: "search",
    }));
  }, [allProviders, providers, movie.title]);

  return (
    <div className="streaming-panel">
      <div className="sp-header">
        <button className="video-back" onClick={onBack}>
          <BackIcon /> Back
        </button>
        <div className="sp-title">
          <PlayIcon s={14} /> Where to Watch
          <span className="sp-movie-name">{movie.title}</span>
        </div>
      </div>

      {loadingProviders ? (
        <div className="sp-loading">
          <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
          <span>Finding streaming options...</span>
        </div>
      ) : (
        <>
          {allProviders.length === 0 && <p className="sp-notice">No provider data found for your region. Search on these platforms:</p>}

          {allProviders.length > 0 && (
            <>
              {providers?.flatrate?.length > 0 && <div className="sp-group-label">Included with Subscription</div>}
              <div className="sp-grid">
                {platforms
                  .filter((platform) => platform.type === "stream")
                  .map((platform) => (
                    <PlatformCard key={platform.id} platform={platform} />
                  ))}
              </div>

              {providers?.rent?.length > 0 && (
                <div className="sp-group-label" style={{ marginTop: 16 }}>
                  Rent or Buy
                </div>
              )}
              <div className="sp-grid">
                {platforms
                  .filter((platform) => platform.type === "rent" || platform.type === "buy")
                  .map((platform) => (
                    <PlatformCard key={platform.id} platform={platform} />
                  ))}
              </div>
            </>
          )}

          {allProviders.length === 0 && (
            <div className="sp-grid">
              {platforms.map((platform) => (
                <PlatformCard key={platform.id} platform={platform} />
              ))}
            </div>
          )}

          <p className="sp-attribution">
            Streaming data provided by{" "}
            <a href="https://www.justwatch.com" target="_blank" rel="noreferrer">
              JustWatch
            </a>{" "}
            via TMDB. Availability varies by region.
          </p>
        </>
      )}
    </div>
  );
}
