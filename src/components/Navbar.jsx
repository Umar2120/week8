import { HeartIcon, LogoIcon } from "./icons";
import SearchBar from "./SearchBar";

export default function Navbar({
  activeCat,
  categories,
  onCategoryChange,
  showFavs,
  onToggleFavs,
  favCount,
  onSelectMovie,
}) {
  return (
    <nav className="navbar">
      <div className="logo">
        <div className="logo-icon">
          <LogoIcon />
        </div>
        <span className="logo-text">MOVIEDEKHO</span>
      </div>

      <div className="nav-cats">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`cat-pill${activeCat === category.id ? " active" : ""}`}
            onClick={() => onCategoryChange(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>

      <button className={`nav-fav-btn${showFavs ? " active" : ""}`} onClick={onToggleFavs}>
        <HeartIcon s={16} filled={favCount > 0} />
        <span>My List</span>
        {favCount > 0 && <span className="nav-fav-badge">{favCount}</span>}
      </button>

      <SearchBar onSelect={onSelectMovie} />
    </nav>
  );
}
