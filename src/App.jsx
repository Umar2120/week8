import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import "./App.css";
import {
  TMDB_API_KEY, poster, backdrop,
  getTrending, getNowPlaying, getPopular, getTopRated, getUpcoming, getByGenre,
  searchMovies, getMovieDetails, getMovieVideos, getWatchProviders,
  ROWS, NAV_CATEGORIES,
} from "./tmdb";

/* ============================================================
   ICONS
   ============================================================ */
const PlayIcon    = ({ s = 18 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>;
const TrailerIcon = ({ s = 16 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>;
const SearchIcon  = ()           => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const CloseIcon   = ({ s = 18 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>;
const InfoIcon    = ()           => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>;
const StarIcon    = ()           => <svg width="11" height="11" viewBox="0 0 24 24" fill="#e50914"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>;
const BackIcon    = ()           => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>;
const LogoIcon    = ()           => <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>;

/* ============================================================
   HELPERS
   ============================================================ */
const FALLBACK_P = (t) => `https://placehold.co/156x234/111111/e50914?text=${encodeURIComponent(t || "?")}`;
const FALLBACK_B = (t) => `https://placehold.co/1280x720/111111/e50914?text=${encodeURIComponent(t || "?")}`;

const GENRE_MAP = {
  28:"Action",12:"Adventure",16:"Animation",35:"Comedy",80:"Crime",
  99:"Documentary",18:"Drama",10751:"Family",14:"Fantasy",36:"History",
  27:"Horror",10402:"Music",9648:"Mystery",10749:"Romance",878:"Sci-Fi",
  10770:"TV Movie",53:"Thriller",10752:"War",37:"Western",
};

const genreLabel = (ids = []) => ids.slice(0,2).map(id => GENRE_MAP[id]).filter(Boolean).join(" / ") || "Movie";
const fmtRating  = (v) => v ? v.toFixed(1) : "N/A";
const fmtYear    = (d) => d ? d.slice(0,4) : "—";

/* ============================================================
   MOVIE MODAL
   ============================================================ */
/* ============================================================
   STREAMING PLATFORM CONFIG
   ============================================================ */
const PLATFORM_CONFIG = {
  8:   { name:"Netflix",        color:"#E50914", bg:"#141414", url:(t)=>`https://www.netflix.com/search?q=${encodeURIComponent(t)}` },
  9:   { name:"Prime Video",    color:"#00A8E1", bg:"#0F171E", url:(t)=>`https://www.amazon.com/s?k=${encodeURIComponent(t)}&i=instant-video` },
  337: { name:"Disney+",        color:"#113CCF", bg:"#040B2C", url:(t)=>`https://www.disneyplus.com/search/${encodeURIComponent(t)}` },
  15:  { name:"Hulu",           color:"#1CE783", bg:"#0B0B0B", url:(t)=>`https://www.hulu.com/search?q=${encodeURIComponent(t)}` },
  384: { name:"HBO Max",        color:"#7B2FBE", bg:"#0D0221", url:(t)=>`https://play.max.com/search?q=${encodeURIComponent(t)}` },
  386: { name:"Peacock",        color:"#FFFFFF", bg:"#1A1A2E", url:(t)=>`https://www.peacocktv.com/search?q=${encodeURIComponent(t)}` },
  283: { name:"Crunchyroll",    color:"#F47521", bg:"#1A0A00", url:(t)=>`https://www.crunchyroll.com/search?q=${encodeURIComponent(t)}` },
  2:   { name:"Apple TV+",      color:"#FFFFFF", bg:"#1C1C1E", url:(t)=>`https://tv.apple.com/search?term=${encodeURIComponent(t)}` },
  531: { name:"Paramount+",     color:"#0064FF", bg:"#001033", url:(t)=>`https://www.paramountplus.com/search/${encodeURIComponent(t)}/` },
  3:   { name:"Google Play",    color:"#4CAF50", bg:"#0A1628", url:(t)=>`https://play.google.com/store/search?q=${encodeURIComponent(t)}&c=movies` },
  10:  { name:"Amazon",         color:"#FF9900", bg:"#0F1111", url:(t)=>`https://www.amazon.com/s?k=${encodeURIComponent(t)}&i=movies-tv` },
  192: { name:"YouTube",        color:"#FF0000", bg:"#0F0F0F", url:(t)=>`https://www.youtube.com/results?search_query=${encodeURIComponent(t)}+full+movie` },
};

// Fallback search links always shown if no providers found
const FALLBACK_PLATFORMS = [
  { name:"Netflix",     color:"#E50914", bg:"#141414", url:(t)=>`https://www.netflix.com/search?q=${encodeURIComponent(t)}` },
  { name:"Prime Video", color:"#00A8E1", bg:"#0F171E", url:(t)=>`https://www.amazon.com/s?k=${encodeURIComponent(t)}&i=instant-video` },
  { name:"Disney+",     color:"#113CCF", bg:"#040B2C", url:(t)=>`https://www.disneyplus.com/search/${encodeURIComponent(t)}` },
  { name:"HBO Max",     color:"#7B2FBE", bg:"#0D0221", url:(t)=>`https://play.max.com/search?q=${encodeURIComponent(t)}` },
  { name:"Hulu",        color:"#1CE783", bg:"#0B0B0B", url:(t)=>`https://www.hulu.com/search?q=${encodeURIComponent(t)}` },
  { name:"Apple TV+",   color:"#FFFFFF", bg:"#1C1C1E", url:(t)=>`https://tv.apple.com/search?term=${encodeURIComponent(t)}` },
  { name:"YouTube",     color:"#FF0000", bg:"#0F0F0F", url:(t)=>`https://www.youtube.com/results?search_query=${encodeURIComponent(t)}+full+movie` },
  { name:"Google Play", color:"#4CAF50", bg:"#0A1628", url:(t)=>`https://play.google.com/store/search?q=${encodeURIComponent(t)}&c=movies` },
];

/* ============================================================
   STREAMING PANEL
   ============================================================ */
function StreamingPanel({ movie, onBack }) {
  const [providers,    setProviders]    = useState(null);
  const [loadingProv,  setLoadingProv]  = useState(true);

  useEffect(() => {
    getWatchProviders(movie.id).then(data => {
      // Try IN (India) first, then US, then first available country
      const regions = data?.results || {};
      const region  = regions["IN"] || regions["US"] || Object.values(regions)[0] || null;
      setProviders(region);
    }).catch(()=>setProviders(null))
      .finally(()=>setLoadingProv(false));
  }, [movie.id]);

  // Merge flatrate + rent + buy provider lists, de-dupe by provider_id
  const allProviders = useMemo(() => {
    if (!providers) return [];
    const seen = new Set();
    const list  = [];
    ([...(providers.flatrate||[]), ...(providers.rent||[]), ...(providers.buy||[])]).forEach(p => {
      if (!seen.has(p.provider_id)) { seen.add(p.provider_id); list.push(p); }
    });
    return list;
  }, [providers]);

  // Build enriched platform list
  const platforms = useMemo(() => {
    if (allProviders.length > 0) {
      return allProviders.map(p => {
        const cfg = PLATFORM_CONFIG[p.provider_id];
        return {
          id:       p.provider_id,
          name:     cfg?.name   || p.provider_name,
          color:    cfg?.color  || "#e50914",
          bg:       cfg?.bg     || "#1a1a1a",
          logo:     p.logo_path ? `https://image.tmdb.org/t/p/w92${p.logo_path}` : null,
          url:      cfg ? cfg.url(movie.title) : `https://www.google.com/search?q=watch+${encodeURIComponent(movie.title)}+online`,
          type:     providers.flatrate?.find(x=>x.provider_id===p.provider_id) ? "stream"
                  : providers.rent?.find(x=>x.provider_id===p.provider_id)    ? "rent"
                  : "buy",
        };
      });
    }
    // Fallback
    return FALLBACK_PLATFORMS.map((p,i) => ({ id:i, ...p, logo:null, url:p.url(movie.title), type:"search" }));
  }, [allProviders, providers, movie.title]);

  return (
    <div className="streaming-panel">
      <div className="sp-header">
        <button className="video-back" onClick={onBack}><BackIcon/> Back</button>
        <div className="sp-title">
          <PlayIcon s={14}/> Where to Watch
          <span className="sp-movie-name">{movie.title}</span>
        </div>
      </div>

      {loadingProv ? (
        <div className="sp-loading">
          <div className="spinner" style={{width:28,height:28,borderWidth:3}}/>
          <span>Finding streaming options…</span>
        </div>
      ) : (
        <>
          {allProviders.length === 0 && (
            <p className="sp-notice">
              No provider data found for your region. Search on these platforms:
            </p>
          )}

          {/* Group by type */}
          {allProviders.length > 0 && (
            <>
              {providers?.flatrate?.length > 0 && <div className="sp-group-label">✅ Included with Subscription</div>}
              <div className="sp-grid">
                {platforms.filter(p=>p.type==="stream").map(p => (
                  <PlatformCard key={p.id} platform={p} movieTitle={movie.title}/>
                ))}
              </div>
              {providers?.rent?.length > 0 && <div className="sp-group-label" style={{marginTop:16}}>💳 Rent or Buy</div>}
              <div className="sp-grid">
                {platforms.filter(p=>p.type==="rent"||p.type==="buy").map(p => (
                  <PlatformCard key={p.id} platform={p} movieTitle={movie.title}/>
                ))}
              </div>
            </>
          )}

          {allProviders.length === 0 && (
            <div className="sp-grid">
              {platforms.map(p => <PlatformCard key={p.id} platform={p} movieTitle={movie.title}/>)}
            </div>
          )}

          <p className="sp-attribution">
            Streaming data provided by{" "}
            <a href="https://www.justwatch.com" target="_blank" rel="noreferrer">JustWatch</a> via TMDB.
            Availability varies by region.
          </p>
        </>
      )}
    </div>
  );
}

function PlatformCard({ platform }) {
  return (
    <a className="platform-card" href={platform.url} target="_blank" rel="noreferrer"
      style={{"--pc-color": platform.color, "--pc-bg": platform.bg}}>
      <div className="pc-inner">
        {platform.logo
          ? <img className="pc-logo-img" src={platform.logo} alt={platform.name}/>
          : <div className="pc-logo-text" style={{color: platform.color}}>{platform.name.charAt(0)}</div>
        }
        <span className="pc-name">{platform.name}</span>
        {platform.type === "stream" && <span className="pc-badge stream">Stream</span>}
        {platform.type === "rent"   && <span className="pc-badge rent">Rent</span>}
        {platform.type === "buy"    && <span className="pc-badge buy">Buy</span>}
        {platform.type === "search" && <span className="pc-badge search">Search</span>}
      </div>
      <div className="pc-arrow">→</div>
    </a>
  );
}

/* ============================================================
   MOVIE MODAL
   ============================================================ */
function MovieModal({ movie, onClose }) {
  const [mode, setMode]         = useState(null);   // null | 'trailer' | 'streaming'
  const [trailerId, setTrailer] = useState(null);
  const [busy, setBusy]         = useState(false);
  const [details, setDetails]   = useState(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    getMovieDetails(movie.id).then(setDetails).catch(() => {});
    return () => { document.body.style.overflow = ""; };
  }, [movie.id]);

  const fetchTrailer = useCallback(async () => {
    if (trailerId) return trailerId;
    setBusy(true);
    try {
      const key = await getMovieVideos(movie.id);
      setTrailer(key || null);
      return key;
    } catch { return null; }
    finally { setBusy(false); }
  }, [movie.id, trailerId]);

  const onTrailer = async () => { await fetchTrailer(); setMode("trailer"); };

  const bd      = movie.backdrop_path ? backdrop(movie.backdrop_path) : FALLBACK_B(movie.title);
  const ps      = movie.poster_path   ? poster(movie.poster_path)     : FALLBACK_P(movie.title);
  const runtime = details?.runtime    ? `${details.runtime}m`         : "";
  const genres  = genreLabel(movie.genre_ids || details?.genres?.map(g=>g.id) || []);

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-top">
          <img src={bd} alt={movie.title} onError={e => { e.target.src = FALLBACK_B(movie.title); }}/>
          <div className="modal-top-grad"/>
          <button className="modal-close" onClick={onClose}><CloseIcon s={17}/></button>
          <div className="modal-title-area">
            <div className="modal-genre-tag">{genres.toUpperCase()}</div>
            <h2 className="modal-title">{movie.title}</h2>
          </div>
        </div>

        <div className="modal-body">
          <div className="modal-row">
            <img className="modal-poster" src={ps} alt={movie.title}
              onError={e => { e.target.src = FALLBACK_P(movie.title); }}/>
            <div style={{flex:1}}>
              <div className="modal-tags">
                {[fmtYear(movie.release_date), runtime, `⭐ ${fmtRating(movie.vote_average)}`, genres]
                  .filter(Boolean).map((t,i) => <span key={i} className="modal-tag">{t}</span>)}
              </div>
              <p className="modal-overview">{movie.overview || "No description available."}</p>
            </div>
          </div>

          {/* ── Main action buttons ── */}
          {mode === null && (
            <div className="modal-btns">
              <button className="modal-btn-watch" onClick={() => setMode("streaming")}>
                <PlayIcon s={20}/> Watch Full Movie
              </button>
              <button className="modal-btn-trailer" onClick={onTrailer} disabled={busy}>
                <TrailerIcon s={18}/> {busy ? "Loading…" : "Watch Trailer"}
              </button>
            </div>
          )}

          {/* ── Streaming providers panel ── */}
          {mode === "streaming" && (
            <StreamingPanel movie={movie} onBack={() => setMode(null)}/>
          )}

          {/* ── YouTube trailer player ── */}
          {mode === "trailer" && (
            <div className="video-wrap">
              <div className="video-head">
                <div className="video-label"><TrailerIcon s={13}/> TRAILER — {movie.title}</div>
                <button className="video-back" onClick={() => setMode(null)}><BackIcon/> Back</button>
              </div>
              <div className="player-wrap">
                {trailerId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${trailerId}?autoplay=1&rel=0&modestbranding=1`}
                    title={`${movie.title} Trailer`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="trailer-loading">
                    <div className="spinner"/>
                    <p>{busy ? "Fetching trailer…" : "No trailer available"}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MOVIE CARD
   ============================================================ */
function MovieCard({ movie, onClick }) {
  const [hovered, setHovered] = useState(false);
  const ps = movie.poster_path ? poster(movie.poster_path) : null;

  return (
    <div className="movie-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}>
      {ps
        ? <img src={ps} alt={movie.title} loading="lazy"
            onError={e => { e.target.onerror=null; e.target.src=FALLBACK_P(movie.title); }}/>
        : <div style={{width:"100%",height:234,background:"#1a1a1a",display:"flex",alignItems:"center",
            justifyContent:"center",color:"#333",fontSize:10,padding:8,textAlign:"center"}}>{movie.title}</div>
      }
      <div className="card-overlay">
        <p className="card-title">{movie.title}</p>
        <div className="card-meta">
          <StarIcon/>
          <span className="card-score">{fmtRating(movie.vote_average)}</span>
          <span className="card-year">• {fmtYear(movie.release_date)}</span>
        </div>
        {hovered && (
          <div className="card-btns">
            <button className="card-btn-play" onClick={e=>{e.stopPropagation();onClick();}}>
              <PlayIcon s={11}/> Watch
            </button>
            <button className="card-btn-info" onClick={e=>{e.stopPropagation();onClick();}}>
              <InfoIcon/>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   HORIZONTAL ROW — live TMDB data + drag + horizontal inf. scroll
   ============================================================ */
function HorizontalRow({ title, fetchFn, onMovieClick }) {
  const [movies,  setMovies]  = useState([]);
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const rowRef = useRef(null);
  const drag   = useRef(null);
  const isDrag = useRef(false);

  const load = useCallback(async (p) => {
    setLoading(true);
    try {
      const data    = await fetchFn(p);
      const results = (data.results || []).filter(m => m.poster_path); // only movies with posters
      setMovies(prev => p === 1 ? results : [...prev, ...results]);
      setHasMore(p < Math.min(data.total_pages || 1, 10));
    } catch { /* noop */ }
    finally { setLoading(false); }
  }, [fetchFn]);

  useEffect(() => { setMovies([]); setPage(1); setHasMore(true); load(1); }, [load]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;
    const next = page + 1;
    setPage(next);
    load(next);
  }, [hasMore, loading, page, load]);

  /* drag scroll */
  const onMD = e => { isDrag.current=false; drag.current={x:e.clientX,sl:rowRef.current.scrollLeft}; };
  const onMM = e => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    if (Math.abs(dx) > 4) isDrag.current = true;
    rowRef.current.scrollLeft = drag.current.sl - dx;
  };
  const onMU = () => { drag.current = null; };

  const onScroll = () => {
    const el = rowRef.current;
    if (el && el.scrollLeft + el.clientWidth >= el.scrollWidth - 320) loadMore();
  };

  /* skeleton */
  if (loading && movies.length === 0) {
    return (
      <div className="movie-row">
        <div className="row-head"><div className="row-bar"/><h3 className="row-title">{title}</h3></div>
        <div className="row-scroll" style={{pointerEvents:"none"}}>
          {Array.from({length:8}).map((_,i)=><div key={i} className="card-skel skeleton"/>)}
        </div>
      </div>
    );
  }

  return (
    <div className="movie-row">
      <div className="row-head"><div className="row-bar"/><h3 className="row-title">{title}</h3></div>
      <div ref={rowRef} className="row-scroll"
        onMouseDown={onMD} onMouseMove={onMM} onMouseUp={onMU} onMouseLeave={onMU} onScroll={onScroll}>
        {movies.map((m, i) => (
          <MovieCard key={`${m.id}-${i}`} movie={m}
            onClick={() => !isDrag.current && onMovieClick(m)}/>
        ))}
        {loading && <div className="card-skel skeleton" style={{minWidth:156,height:234,flexShrink:0}}/>}
        <div className="row-end"/>
      </div>
    </div>
  );
}

/* ============================================================
   HERO BANNER — auto-rotates every 3 s with progress bar
   ============================================================ */
const BANNER_INTERVAL = 3000;

function Hero({ onMovieClick }) {
  const [movies,  setMovies]  = useState([]);
  const [idx,     setIdx]     = useState(0);
  const [prog,    setProg]    = useState(0);
  const [fading,  setFading]  = useState(false);   // triggers CSS cross-fade
  const [paused,  setPaused]  = useState(false);
  const timerRef  = useRef(null);
  const progRef   = useRef(null);
  const startedAt = useRef(null);
  const elapsed   = useRef(0);

  /* fetch pool */
  useEffect(() => {
    getTrending(1).then(d => {
      const pool = (d.results||[]).filter(m=>m.backdrop_path && m.poster_path).slice(0,10);
      setMovies(pool);
    }).catch(()=>{});
  }, []);

  /* go to a specific slide */
  const goTo = useCallback((nextIdx) => {
    setFading(true);
    setTimeout(() => {
      setIdx(nextIdx);
      setProg(0);
      elapsed.current = 0;
      startedAt.current = Date.now();
      setFading(false);
    }, 500);
  }, []);

  /* progress ticker */
  const startProgress = useCallback(() => {
    cancelAnimationFrame(progRef.current);
    startedAt.current = Date.now() - elapsed.current;
    const tick = () => {
      const spent = Date.now() - startedAt.current;
      const pct   = Math.min((spent / BANNER_INTERVAL) * 100, 100);
      setProg(pct);
      if (pct < 100) { progRef.current = requestAnimationFrame(tick); }
    };
    progRef.current = requestAnimationFrame(tick);
  }, []);

  /* auto-advance */
  useEffect(() => {
    if (!movies.length || paused) return;
    startProgress();
    timerRef.current = setTimeout(() => {
      goTo((idx + 1) % movies.length);
    }, BANNER_INTERVAL);
    return () => { clearTimeout(timerRef.current); cancelAnimationFrame(progRef.current); };
  }, [movies, idx, paused, goTo, startProgress]);

  /* pause on hover */
  const onMouseEnter = () => {
    setPaused(true);
    elapsed.current = Date.now() - (startedAt.current || Date.now());
    clearTimeout(timerRef.current);
    cancelAnimationFrame(progRef.current);
  };
  const onMouseLeave = () => { setPaused(false); };

  if (!movies.length) return <div className="hero-skel skeleton"/>;

  const movie  = movies[idx];
  const bd     = backdrop(movie.backdrop_path) || FALLBACK_B(movie.title);
  const genres = genreLabel(movie.genre_ids || []);

  return (
    <div className="hero" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>

      {/* All backdrop images stacked — active one is visible */}
      {movies.map((m, i) => (
        <img
          key={m.id}
          className={`hero-bg hero-bg-slide${i === idx ? (fading ? " fade-out" : " active") : ""}`}
          src={backdrop(m.backdrop_path) || FALLBACK_B(m.title)}
          alt={m.title}
          onError={e=>{ e.target.src=FALLBACK_B(m.title); }}
        />
      ))}

      <div className="hero-overlay"/>

      {/* Content — fades on change */}
      <div className={`hero-content${fading ? " content-fade" : ""}`}>
        <div className="hero-eyebrow">
          <span className="hero-eyebrow-dot"/> FEATURED TONIGHT
        </div>
        <h1 className="hero-title">{movie.title}</h1>
        <div className="hero-meta">
          <span className="hero-score">⭐ {fmtRating(movie.vote_average)}</span>
          <span className="hero-dot">•</span>
          <span className="hero-info">{fmtYear(movie.release_date)}</span>
          {genres && <><span className="hero-dot">•</span><span className="hero-genre">{genres.toUpperCase()}</span></>}
        </div>
        <p className="hero-desc">
          {(movie.overview||"").slice(0,200)}{(movie.overview||"").length>200?"…":""}
        </p>
        <div className="hero-btns">
          <button className="btn-primary" onClick={()=>onMovieClick(movie)}>
            <PlayIcon s={20}/> Watch Now
          </button>
          <button className="btn-ghost" onClick={()=>onMovieClick(movie)}>
            <TrailerIcon s={18}/> Trailer
          </button>
        </div>
      </div>

      {/* Bottom controls bar */}
      <div className="hero-controls">
        {/* Dot nav */}
        <div className="hero-dots">
          {movies.map((m, i) => (
            <button
              key={m.id}
              className={`hero-dot-btn${i === idx ? " active" : ""}`}
              onClick={() => { if(i !== idx) goTo(i); }}
              title={m.title}
            />
          ))}
        </div>

        {/* Thumbnail strip */}
        <div className="hero-thumbs">
          {movies.map((m, i) => (
            <button
              key={m.id}
              className={`hero-thumb${i === idx ? " active" : ""}`}
              onClick={() => { if(i !== idx) goTo(i); }}
              title={m.title}
            >
              <img
                src={poster(m.poster_path, "w92")}
                alt={m.title}
                onError={e=>{ e.target.src=FALLBACK_P(m.title); }}
              />
              <div className="thumb-overlay"/>
              {i === idx && <div className="thumb-active-bar" style={{width:`${prog}%`}}/>}
            </button>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="hero-progress">
        <div className="hero-progress-fill" style={{width:`${prog}%`}}/>
      </div>

      {/* Prev / Next arrows */}
      <button className="hero-arrow left"
        onClick={()=>goTo((idx - 1 + movies.length) % movies.length)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <button className="hero-arrow right"
        onClick={()=>goTo((idx + 1) % movies.length)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>
    </div>
  );
}

/* ============================================================
   SEARCH BAR
   ============================================================ */
function SearchBar({ onSelect }) {
  const [query,   setQuery]   = useState("");
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef  = useRef(null);
  const timer     = useRef(null);

  const search = useCallback((q) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try   { const d = await searchMovies(q); setResults(d.results || []); }
      catch { setResults([]); }
      finally { setLoading(false); }
    }, 350);
  }, []);

  const onChange = e => { setQuery(e.target.value); search(e.target.value); };
  const clear    = () => { setQuery(""); setResults([]); inputRef.current?.focus(); };
  const pick     = m  => { setQuery(""); setResults([]); setFocused(false); onSelect(m); };
  const showDrop = focused && query.trim().length > 0;

  return (
    <div className="search-wrap">
      <div className={`search-box${focused?" focused":""}`}>
        <SearchIcon/>
        <input ref={inputRef} className="search-input" type="text"
          placeholder="Search movies, genres…"
          value={query} onChange={onChange}
          onFocus={()=>setFocused(true)}
          onBlur={()=>setTimeout(()=>setFocused(false),200)}/>
        {query && <button className="search-clear" onClick={clear}><CloseIcon s={15}/></button>}
      </div>

      {showDrop && (
        <div className="search-dropdown">
          {loading ? (
            <div className="sd-loading">
              <div style={{width:16,height:16,border:"2px solid rgba(229,9,20,.2)",borderTopColor:"var(--red)",borderRadius:"50%",animation:"spin .8s linear infinite"}}/>
              <span>Searching…</span>
            </div>
          ) : results.length > 0 ? (
            results.slice(0,8).map(m => (
              <div key={m.id} className="sd-item" onMouseDown={()=>pick(m)}>
                <img src={m.poster_path ? poster(m.poster_path,"w92") : FALLBACK_P(m.title)}
                  alt={m.title} onError={e=>{e.target.src=FALLBACK_P(m.title);}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div className="sd-title">{m.title}</div>
                  <div className="sd-meta">{fmtYear(m.release_date)} · ⭐ {fmtRating(m.vote_average)}</div>
                </div>
                <span className="sd-badge">{fmtYear(m.release_date)}</span>
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

/* ============================================================
   CATEGORY → ROWS MAP
   ============================================================ */
const CAT_ROWS = {
  all:       ROWS,
  trending:  [{id:"t1",label:"🔥 Trending This Week",   fetch:getTrending},
              {id:"t2",label:"⚡ Most Popular",           fetch:getPopular}],
  now:       [{id:"n1",label:"🎬 Now Playing",            fetch:getNowPlaying},
              {id:"n2",label:"🚀 Coming Soon",             fetch:getUpcoming}],
  action:    [{id:"a1",label:"💥 Action",                 fetch:p=>getByGenre(28,p)}],
  scifi:     [{id:"s1",label:"🛸 Science Fiction",        fetch:p=>getByGenre(878,p)}],
  thriller:  [{id:"th1",label:"🔪 Thriller",              fetch:p=>getByGenre(53,p)}],
  horror:    [{id:"h1",label:"👁 Horror",                 fetch:p=>getByGenre(27,p)}],
  drama:     [{id:"d1",label:"🎭 Drama",                  fetch:p=>getByGenre(18,p)}],
  animation: [{id:"an1",label:"🎨 Animation",             fetch:p=>getByGenre(16,p)}],
  crime:     [{id:"cr1",label:"🕵️ Crime & Thriller",      fetch:p=>getByGenre(80,p)}],
};

const EXTRA_ROWS = [
  {id:"ex1",label:"🎖 War Films",       fetch:p=>getByGenre(10752,p)},
  {id:"ex2",label:"❤️ Romance",          fetch:p=>getByGenre(10749,p)},
  {id:"ex3",label:"🔍 Mystery",          fetch:p=>getByGenre(9648,p)},
  {id:"ex4",label:"🧙 Fantasy",          fetch:p=>getByGenre(14,p)},
  {id:"ex5",label:"🎵 Music & Docs",     fetch:p=>getByGenre(99,p)},
  {id:"ex6",label:"🌍 Adventure",        fetch:p=>getByGenre(12,p)},
];

const API_MISSING = !TMDB_API_KEY || TMDB_API_KEY === "YOUR_TMDB_API_KEY_HERE";

/* ============================================================
   APP
   ============================================================ */
export default function App() {
  const [activeCat,     setActiveCat]     = useState("all");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [extraRows,     setExtraRows]     = useState([]);
  const [loadingMore,   setLoadingMore]   = useState(false);
  const extraIdx = useRef(0);
  const mainRef  = useRef(null);

  const currentRows = useMemo(() => CAT_ROWS[activeCat] || ROWS, [activeCat]);

  /* Vertical infinite scroll — appends more genre rows */
  const loadMoreRows = useCallback(() => {
    if (loadingMore || activeCat !== "all" || extraIdx.current >= EXTRA_ROWS.length) return;
    setLoadingMore(true);
    setTimeout(() => {
      const batch = EXTRA_ROWS.slice(extraIdx.current, extraIdx.current + 2);
      extraIdx.current += 2;
      setExtraRows(prev => [...prev, ...batch]);
      setLoadingMore(false);
    }, 300);
  }, [loadingMore, activeCat]);

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const fn = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 600) loadMoreRows();
    };
    el.addEventListener("scroll", fn);
    return () => el.removeEventListener("scroll", fn);
  }, [loadMoreRows]);

  const handleCat = (id) => { setActiveCat(id); setExtraRows([]); extraIdx.current = 0; };

  return (
    <div className="app-root">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">
          <div className="logo-icon"><LogoIcon/></div>
          <span className="logo-text">MOVIEDEKHO</span>
        </div>
        <div className="nav-cats">
          {NAV_CATEGORIES.map(c => (
            <button key={c.id} className={`cat-pill${activeCat===c.id?" active":""}`}
              onClick={()=>handleCat(c.id)}>{c.label}</button>
          ))}
        </div>
        <SearchBar onSelect={setSelectedMovie}/>
      </nav>

      {/* API key warning */}
      {API_MISSING && (
        <div className="api-banner">
          <span>⚠️</span>
          <span>
            No TMDB API key found. Create <code>.env</code> with <code>VITE_TMDB_API_KEY=your_key</code>.
            Get a free key at{" "}
            <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noreferrer">
              themoviedb.org
            </a>
          </span>
        </div>
      )}

      {/* MAIN */}
      <main className="main-scroll" ref={mainRef}>
        {activeCat === "all" && <Hero onMovieClick={setSelectedMovie}/>}

        <div className="rows-container">
          {currentRows.map(row => (
            <HorizontalRow key={`${activeCat}-${row.id}`}
              title={row.label} fetchFn={row.fetch} onMovieClick={setSelectedMovie}/>
          ))}
          {extraRows.map(row => (
            <HorizontalRow key={row.id}
              title={row.label} fetchFn={row.fetch} onMovieClick={setSelectedMovie}/>
          ))}
          {loadingMore && (
            <div className="load-more">
              <div className="sm-spin"/>
              <span>LOADING MORE</span>
            </div>
          )}
        </div>
      </main>

      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={()=>setSelectedMovie(null)}/>
      )}
    </div>
  );
}
