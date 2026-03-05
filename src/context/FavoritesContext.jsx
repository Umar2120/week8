import { useCallback, useState } from "react";
import { FavCtx } from "./favoritesStore";

export function FavProvider({ children }) {
  const [favs, setFavs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cinex_favs") || "[]");
    } catch {
      return [];
    }
  });

  const save = (list) => {
    setFavs(list);
    try {
      localStorage.setItem("cinex_favs", JSON.stringify(list));
    } catch {
      // Ignore write failures in private mode/storage-restricted environments.
    }
  };

  const toggle = useCallback((movie) => {
    setFavs((prev) => {
      const exists = prev.some((m) => m.id === movie.id);
      const next = exists ? prev.filter((m) => m.id !== movie.id) : [movie, ...prev];
      try {
        localStorage.setItem("cinex_favs", JSON.stringify(next));
      } catch {
        // Ignore write failures in private mode/storage-restricted environments.
      }
      return next;
    });
  }, []);

  const isFav = useCallback((id) => favs.some((m) => m.id === id), [favs]);
  const clearAll = useCallback(() => save([]), []);

  return <FavCtx.Provider value={{ favs, toggle, isFav, clearAll }}>{children}</FavCtx.Provider>;
}
