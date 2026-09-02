export type CatalogCourse = {
  id: string;
  title: string;
  description: string;
  price: number;
  difficulty: string;
  thumbnail: string | null;
  modules: {
    id: string;
    title: string;
    description: string | null;
    price: number;
    order: number;
    videos: { id: string }[];
  }[];
};
