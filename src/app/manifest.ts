import type { MetadataRoute } from "next";
import ruMessages from "@/messages/ru.json";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: ruMessages.metadata.title,
    short_name: "UMKA",
    description: "Онлайн-обучение английскому языку",
    start_url: "/",
    display: "standalone",
    background_color: "#F9F7F2",
    theme_color: "#1B3C35",
    icons: [
      { src: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { src: "/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
  };
}
