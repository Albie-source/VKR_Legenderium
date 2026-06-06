"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

type LibraryPaginationProps = {
  currentPage: number;
  totalPages: number;
};

const ACTIVE_STYLE: React.CSSProperties = {
  backgroundColor: "#d8a342",
  borderColor: "#d8a342",
  color: "#06151a",
};

const INACTIVE_STYLE: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderColor: "#a8854a",
  color: "#1a1208",
};

const DISABLED_STYLE: React.CSSProperties = {
  backgroundColor: "#ede3d4",
  borderColor: "#d4c4ad",
  color: "#a89070",
  pointerEvents: "none",
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
        style={currentPage === 1 ? DISABLED_STYLE : INACTIVE_STYLE}
        className="rounded-2xl border px-4 py-2 text-sm font-bold shadow-md transition"
      >
        ← Назад
      </Link>

      <div className="flex items-center gap-1.5">
        {pages.map((item, i) =>
          item === "..." ? (
            <span
              key={`ellipsis-${i}`}
              style={{ color: "#6b5a3e" }}
              className="w-8 text-center text-sm font-bold"
            >
              …
            </span>
          ) : (
            <Link
              key={item}
              href={buildPageUrl(item)}
              style={item === currentPage ? ACTIVE_STYLE : INACTIVE_STYLE}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border text-sm font-extrabold shadow-md transition"
            >
              {item}
            </Link>
          )
        )}
      </div>

      <Link
        href={buildPageUrl(currentPage + 1)}
        aria-disabled={currentPage === totalPages}
        style={currentPage === totalPages ? DISABLED_STYLE : INACTIVE_STYLE}
        className="rounded-2xl border px-4 py-2 text-sm font-bold shadow-md transition"
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
