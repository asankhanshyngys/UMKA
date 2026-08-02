import Link from "next/link";

export function Header() {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
      <Link href="/" className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
          <span className="font-serif text-lg font-medium text-white">U</span>
        </div>
        <span className="text-sm font-medium text-foreground">УМКА</span>
      </Link>

      <nav className="flex items-center gap-8">
        <Link
          href="#subscriptions"
          className="text-sm text-foreground-muted transition-colors hover:text-foreground"
        >
          Подписки
        </Link>
        <Link
          href="#catalog"
          className="text-sm text-foreground-muted transition-colors hover:text-foreground"
        >
          Темы
        </Link>
        <Link
          href="#"
          className="text-sm text-foreground-muted transition-colors hover:text-foreground"
        >
          Войти
        </Link>
      </nav>
    </header>
  );
}
