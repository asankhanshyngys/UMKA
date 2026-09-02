"use client";

import { BarChart3, BookOpen, ExternalLink, GraduationCap, LayoutDashboard, LibraryBig, Menu, Settings, X, CreditCard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";

type AdminNavItem = { href: string; key: string; icon: LucideIcon };
type AdminNavGroup = { title: string; items: AdminNavItem[] };

const groups: AdminNavGroup[] = [
  { title: "content", items: [{ href: "/admin", key: "overview", icon: LayoutDashboard }, { href: "/admin/courses", key: "coursesLessons", icon: BookOpen }, { href: "/admin/books", key: "books", icon: LibraryBig }, { href: "/admin/teachers", key: "teachers", icon: GraduationCap }] },
  { title: "commerce", items: [{ href: "/admin/payments", key: "payments", icon: CreditCard }, { href: "/admin/analytics", key: "analytics", icon: BarChart3 }] },
  { title: "system", items: [{ href: "/admin/settings", key: "settings", icon: Settings }] },
];

export function AdminNavigation({ adminName, brand, panel, site }: { adminName: string; brand: string; panel: string; site: string }) {
  const t = useTranslations("admin");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = groups.flatMap((group) => group.items);
  const current = links.find((item) => pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`)));
  const nav = (mobile = false) => <nav className="space-y-4">{groups.map((group) => <div key={group.title}><p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">{t(group.title)}</p><div className="space-y-1">{group.items.map(({ href, key, icon: Icon }) => { const active = pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`)); return <Link key={href} href={href} onClick={() => mobile && setOpen(false)} aria-current={active ? "page" : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${active ? "bg-accent/10 text-accent" : "text-foreground-muted hover:bg-background hover:text-foreground"}`}><Icon className="h-4 w-4" aria-hidden="true" />{t(key)}</Link>; })}</div></div>)}</nav>;

  return <>
    <header className="sticky top-0 z-30 border-b border-border bg-card"><div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-12 xl:px-20"><div className="flex items-center gap-3"><button type="button" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="admin-mobile-nav" onClick={() => setOpen((value) => !value)} className="rounded-lg border border-border p-2 lg:hidden">{open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button><Link href="/admin" className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent font-serif text-lg text-white">U</span><span><span className="block text-sm font-semibold">{brand}</span><span className="block text-xs text-foreground-subtle">{panel}</span></span></Link></div><div className="flex items-center gap-3"><span className="hidden text-sm text-foreground-muted sm:inline">{current ? t(current.key) : adminName}</span><Link href="/" className="hidden items-center gap-2 text-sm text-foreground-muted hover:text-foreground sm:inline-flex"><ExternalLink className="h-4 w-4" />{site}</Link></div></div></header>
    <aside className="fixed left-12 top-24 z-20 hidden w-[220px] lg:block xl:left-20"><div className="rounded-2xl border border-border bg-card p-3">{nav()}</div></aside>
    {open && <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setOpen(false)}><aside id="admin-mobile-nav" onClick={(event) => event.stopPropagation()} className="h-full w-72 max-w-[85vw] overflow-y-auto bg-card p-5 shadow-xl"><div className="mb-6 flex items-center justify-between"><span className="font-semibold">{panel}</span><button type="button" aria-label="Close navigation" onClick={() => setOpen(false)} className="rounded-lg p-2"><X className="h-5 w-5" /></button></div>{nav(true)}</aside></div>}
  </>;
}
