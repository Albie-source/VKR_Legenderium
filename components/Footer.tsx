import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-[#06151a] text-[#fff8e8]">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d8a342]/30 bg-[#0f2b2e] text-xl font-extrabold text-[#d8a342]">
                Л
              </div>
              <div>
                <p className="text-lg font-extrabold leading-none tracking-tight">Легендариум</p>
                <p className="mt-0.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#cbbba7]">
                  Фольклор народов России
                </p>
              </div>
            </div>
            <p className="text-sm leading-7 text-[#cbbba7]">
              Интерактивная образовательная платформа для изучения легенд,
              сказаний и традиций народов России.
            </p>
          </div>

          <div>
            <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.2em] text-[#d8a342]">
              Разделы
            </p>
            <ul className="space-y-2.5">
              {[
                { href: "/map", label: "Карта легенд" },
                { href: "/library", label: "Библиотека" },
                { href: "/quests", label: "Задания" },
                { href: "/profile", label: "Профиль" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-[#cbbba7] transition hover:text-[#d8a342]"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.2em] text-[#d8a342]">
              О проекте
            </p>
            <p className="text-sm leading-7 text-[#cbbba7]">
              Проект создан в рамках выпускной квалификационной работы.
              Платформа объединяет академические материалы и современные
              интерактивные технологии для популяризации народного творчества.
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-[#cbbba7]">
          © {new Date().getFullYear()} Легендариум — Фольклор народов России
        </div>
      </div>
    </footer>
  );
}
