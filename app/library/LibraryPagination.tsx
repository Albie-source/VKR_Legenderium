"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

type LibraryPaginationProps = {
  currentPage: number;
  totalPages: number;
};

export default function LibraryPagination({
  currentPage,
  totalPages,
}: LibraryPaginationProps) {
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function buildPageUrl(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    const qs = params.toString();
    return qs ? `/library?${qs}` : "/library";
  }

  const pages = buildPageList(currentPage, totalPages);

  return (
    <nav className="mt-10 flex items-center justify-center gap-2">
      <Link
        href={buildPageUrl(currentPage - 1)}
        aria-disabled={currentPage === 1}
        className={[
          "rounded-2xl border px-4 py-2 text-sm font-bold shadow-md transition",
          currentPage === 1
            ? "pointer-events-none border-[#d4c4ad] bg-[#ede3d4] text-stone-400"
            : "border-[#c8a87a] bg-white text-black hover:border-[#d8a342] hover:text-[#9f661f]",
        ].join(" ")}
      >
        ← Назад
      </Link>

      <div className="flex items-center gap-1.5">
        {pages.map((item, i) =>
          item === "..." ? (
            <span
              key={`ellipsis-${i}`}
              className="w-8 text-center text-sm font-bold text-stone-500"
            >
              …
            </span>
          ) : (
            <Link
              key={item}
              href={buildPageUrl(item)}
              className={[
                "flex h-10 w-10 items-center justify-center rounded-2xl border text-sm font-extrabold shadow-md transition",
                item === currentPage
                  ? "border-[#d8a342] bg-[#d8a342] text-[#06151a]"
                  : "border-[#c8a87a] bg-white text-black hover:border-[#d8a342] hover:text-[#9f661f]",
              ].join(" ")}
            >
              {item}
            </Link>
          )
        )}
      </div>

      <Link
        href={buildPageUrl(currentPage + 1)}
        aria-disabled={currentPage === totalPages}
        className={[
          "rounded-2xl border px-4 py-2 text-sm font-bold shadow-md transition",
          currentPage === totalPages
            ? "pointer-events-none border-[#d4c4ad] bg-[#ede3d4] text-stone-400"
            : "border-[#c8a87a] bg-white text-black hover:border-[#d8a342] hover:text-[#9f661f]",
        ].join(" ")}
      >
        Вперёд →
      </Link>
    </nav>
  );
}

function buildPageList(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [1];

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");

  pages.push(total);

  return pages;
}
