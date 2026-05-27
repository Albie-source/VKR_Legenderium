import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-stone-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-700 text-lg font-bold text-white shadow-sm transition group-hover:bg-amber-800">
            Л
          </div>

          <div>
            <p className="logo-title text-2xl leading-none text-stone-900">
              Легендариум
            </p>
            <p className="text-lg font-bold leading-none text-stone-900">
              Легендариум
            </p>
            <p className="text-xs text-stone-500">
              Фольклор народов России
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          <NavLink href="/map">Карта</NavLink>
          <NavLink href="/library">Библиотека</NavLink>
          <NavLink href="/quests">Задания</NavLink>
          <NavLink href="/goals">Цели</NavLink>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="hidden rounded-xl bg-amber-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-800 sm:inline-flex"
                >
                  Админ-панель
                </Link>
              )}

              <Link
                href="/profile"
                className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
              >
                Профиль
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
            >
              Войти
            </Link>
          )}
        </div>
      </div>

      <nav className="flex gap-2 overflow-x-auto border-t border-stone-200 px-6 py-3 md:hidden">
        <MobileNavLink href="/map">Карта</MobileNavLink>
        <MobileNavLink href="/library">Библиотека</MobileNavLink>
        <MobileNavLink href="/quests">Задания</MobileNavLink>
        <MobileNavLink href="/goals">Цели</MobileNavLink>
      </nav>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-xl px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100 hover:text-stone-950"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="shrink-0 rounded-xl bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm"
    >
      {children}
    </Link>
  );
}
