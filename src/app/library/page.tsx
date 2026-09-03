import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { getCurrentUser } from "@/lib/auth";
import { getBookCoverUrl } from "@/lib/book-cover";
import { prisma } from "@/lib/prisma";

export default async function LibraryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [t, purchases] = await Promise.all([
    getTranslations("library"),
    prisma.bookPurchase.findMany({
      where: { userId: user.id, status: "COMPLETED", book: { deletedAt: null } },
      select: { book: { select: { id: true, title: true, author: true, coverImageKey: true } } },
      orderBy: { purchasedAt: "desc" },
    }),
  ]);
  const books = purchases.map(({ book }) => book);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="main-with-mobile-nav px-4 py-12 sm:px-6 lg:px-12 xl:px-20">
        <p className="text-sm text-foreground-subtle">{t("eyebrow")}</p>
        <h1 className="mt-1 font-serif text-4xl text-foreground">{t("title")}</h1>

        {books.length > 0 ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {books.map((book) => {
              const coverUrl = getBookCoverUrl(book);

              return (
                <article key={book.id} className="flex gap-4 rounded-2xl border border-border bg-card p-4">
                  <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-lg bg-background">
                    {coverUrl && (
                      <Image src={coverUrl} alt="" fill className="object-cover" sizes="80px" />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="text-xs text-foreground-subtle">{book.author}</p>
                    <h2 className="mt-1 text-lg font-semibold text-foreground">{book.title}</h2>
                    <Link
                      href={`/books/${book.id}/read`}
                      className="mt-auto inline-block text-sm font-medium text-accent hover:text-accent-dark"
                    >
                      {t("read")}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <section className="mt-10 rounded-2xl border border-border bg-card p-6">
            <p className="text-foreground-muted">{t("emptyDescription")}</p>
            <Link
              href="/#books"
              className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white"
            >
              {t("browseBooks")}
            </Link>
          </section>
        )}
      </main>
    </div>
  );
}
