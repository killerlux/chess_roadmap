import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://chess-roadmap.local/",
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
