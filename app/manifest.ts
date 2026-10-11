import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nexa",
    short_name: "Nexa",
    description:
      "Catalogue, commandes, conversations et livraison pour les commerçants Nexa.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f6f7f8",
    theme_color: "#4b5563",
    lang: "fr",
    icons: [
      {
        src: "/brand/nexa-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/nexa-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
