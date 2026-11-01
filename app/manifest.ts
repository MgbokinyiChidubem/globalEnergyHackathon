import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SolarSizer AI",
    short_name: "SolarSizer",
    description: "Right-size your solar system and see the month it beats your generator.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a1030",
    theme_color: "#0a1030",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
