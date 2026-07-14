import type { MetadataRoute } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://snaptab.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${appUrl}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${appUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${appUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
