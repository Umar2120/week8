import { createContext, useContext } from "react";

export const FavCtx = createContext(null);

export const useFavs = () => useContext(FavCtx);
