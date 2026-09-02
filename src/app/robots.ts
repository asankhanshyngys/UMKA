import type { MetadataRoute } from "next";

const baseUrl = (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/dashboard", "/learn", "/profile", "/login", "/register", "/reset-password", "/forgot-password", "/verify-email"] }, sitemap: `${baseUrl}/sitemap.xml` };
}
