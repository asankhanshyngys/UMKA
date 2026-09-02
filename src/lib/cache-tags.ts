/** Stable, centralized tags for public content only. Never use these for user data. */
export const CACHE_TAGS = {
  courses: "courses",
  course: (id: string) => `course:${id}`,
  settings: "settings",
} as const;
