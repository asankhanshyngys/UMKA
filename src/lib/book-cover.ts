export function getBookCoverUrl(book: { id: string; coverImageKey: string | null }) {
  if (!book.coverImageKey) return null;
  return /^https?:\/\//i.test(book.coverImageKey) ? book.coverImageKey : `/api/books/${book.id}/cover`;
}
