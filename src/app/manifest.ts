import type { MetadataRoute } from "next";
import ruMessages from "@/messages/ru.json";

export default function manifest(): MetadataRoute.Manifest {
  // TODO: Add real 192x192 and 512x512 application icons to public/ when they are prepared.
  return {
    name: ruMessages.metadata.title,
    short_name: "UMKA",
    description: "Онлайн-обучение английскому языку",
    start_url: "/",
    display: "standalone",
    background_color: "#F9F7F2",
    theme_color: "#1B3C35",
  };
}
