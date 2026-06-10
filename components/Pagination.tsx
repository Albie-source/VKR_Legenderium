import Link from "next/link";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  basePath: string;
  light?: boolean;
};

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
  light = false,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pageHref = (page: number) =>
    page === 1 ? basePath : `${basePath}?page=${page}`;

  // Показываем первую, последнюю, текущую и соседние страницы
  const pages: (number | "gap")[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== "gap") {
      pages.push("gap");
    }
  }

  const linkBase = light
    ? "border-stone-300 bg-white text-stone-700 hover:bg-stone-100"
    : "border-[#e4d4bf] bg-white text-stone-700 hover:bg-[#fff8e8]";

  return (
    <nav
      aria-label="Постраничная навигация"
      className="flex flex-wrap items-center justify-center gap-2 py-6"
    >
      {currentPage > 1 && (
        <Link
          href={pageHref(currentPage - 1)}
          className={`rounded-xl border px-4 py-2 text-sm font-bold transition ${linkBase}`}
        >
          ← Назад
        </Link>
      )}

      {pages.map((p, i) =>
        p === "gap" ? (
          <span key={`gap-${i}`} className="px-2 text-stone-400">
            …
          </span>
        ) : p === currentPage ? (
          <span
            key={p}
            aria-current="page"
            className="rounded-xl bg-[#d8a342] px-4 py-2 text-sm font-extrabold text-[#06151a]"
          >
            {p}
          </span>
        ) : (
          <Link
            key={p}
            href={pageHref(p)}
            className={`rounded-xl border px-4 py-2 text-sm font-bold transition ${linkBase}`}
          >
            {p}
          </Link>
        ),
      )}

      {currentPage < totalPages && (
        <Link
          href={pageHref(currentPage + 1)}
          className={`rounded-xl border px-4 py-2 text-sm font-bold transition ${linkBase}`}
        >
          Вперёд →
        </Link>
      )}
    </nav>
  );
}
