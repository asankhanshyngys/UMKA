"use client";

import { useEffect } from "react";

export function CatalogHashScroller() {
  useEffect(() => {
    if (window.location.hash !== "#catalog") return;

    const timeoutId = window.setTimeout(() => {
      document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return null;
}
