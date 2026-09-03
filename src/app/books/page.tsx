import { Header } from "@/components/layout/Header";
import { BooksCatalog } from "@/components/landing/BooksCatalog";
import { getPublishedBooks } from "@/features/books/server";

export default async function BooksPage() {
  const books = await getPublishedBooks();
  return <div className="min-h-screen bg-background"><Header /><main className="main-with-mobile-nav"><BooksCatalog books={books} /></main></div>;
}
