"use client";

import { useSyncExternalStore } from "react";

/** SSR-safe media-query hook (returns `serverDefault` on the server). */
export function useMediaQuery(query: string, serverDefault = false): boolean {
  return useSyncExternalStore(
    (callback) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    () => window.matchMedia(query).matches,
    () => serverDefault,
  );
}
