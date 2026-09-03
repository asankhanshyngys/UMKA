export type CatalogCourse = {
  id: string;
  title: string;
  description: string;
  price: number;
  oldPrice: number | null;
  difficulty: string;
  thumbnail: string | null;
  modules: {
    id: string;
    title: string;
    description: string | null;
    previewImage: string | null;
    price: number;
    oldPrice: number | null;
    order: number;
    videos: { id: string }[];
  }[];
};
