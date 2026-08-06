export type CatalogCourse = {
  id: string;
  title: string;
  description: string;
  price: number;
  difficulty: string;
  thumbnail: string | null;
  modules: { id: string; videos: { id: string }[] }[];
};
