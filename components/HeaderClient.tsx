"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

type HeaderUser = {
  name: string;
  email: string;
  role: string;
} | null;

type HeaderGoal = {
  id: number;
  title: string;
  description: string | null;
  requiredMaterialsCount: number;
  currentProgress: number;
  isCompleted: boolean;
  rewardReceived: boolean;
  cardTitle: string;
  genreNames: string[];
  topicNames: string[];
};

type HeaderClientProps = {
  user: HeaderUser;
  goals: HeaderGoal[];
};

export default function HeaderClient({ user, goals }: HeaderClientProps) {
  const [isGoalsOpen, setIsGoalsOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#06151a]/88 shadow-sm shadow-black/20 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-6 py-4">
          <Link href="/" className="group flex shrink-0 items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d8a342]/30 bg-[#0f2b2e] text-2xl font-extrabold leading-none text-[#d8a342] shadow-lg shadow-black/20 transition group-hover:-translate-y-0.5 group-hover:border-[#d8a342]/60">
              Л
            </div>

            <div>
              <p className="text-[1.65rem] font-extrabold leading-none tracking-tight text-[#fff8e8]">
                Легендариум
              </p>
              <p className="mt-1 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#cbbba7]">
                Фольклор народов России
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex lg:gap-10">
            <HeaderNavItem href="/map" id="nav-map">Карта</HeaderNavItem>
            <HeaderNavItem href="/library" id="nav-library">Библиотека</HeaderNavItem>
            <HeaderNavItem href="/quests" id="nav-quests">Задания</HeaderNavItem>

            {user && (
              <HeaderNavButton onClick={() => setIsGoalsOpen(true)}>
                Цели
              </HeaderNavButton>
            )}
          </nav>

          <div className="flex shrink-0 items-center gap-3">
          {user?.role === "ADMIN" ? (
            <Link
              href="/admin"
              className="rounded-2xl bg-[#d8a342] px-5 py-3 text-sm font-extrabold !text-[#06151a] shadow-md transition hover:bg-[#f0bd5b]"
            >
              Админ-панель
            </Link>
          ) : user ? (
            <Link
              id="nav-profile"
              href="/profile"
              className="rounded-2xl bg-[#d8a342] px-5 py-3 text-sm font-extrabold !text-[#06151a] shadow-md transition hover:bg-[#f0bd5b]"
            >
              Профиль
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-2xl bg-[#d8a342] px-5 py-3 text-sm font-extrabold !text-[#06151a] shadow-md transition hover:bg-[#f0bd5b]"
            >
              Войти
            </Link>
          )}
          </div>
        </div>

        <nav className="flex gap-3 overflow-x-auto border-t border-white/10 px-6 py-3 md:hidden">
          <MobileNavLink href="/map">Карта</MobileNavLink>
          <MobileNavLink href="/library">Библиотека</MobileNavLink>
          <MobileNavLink href="/quests">Задания</MobileNavLink>

          {user && (
            <button
              type="button"
              onClick={() => setIsGoalsOpen(true)}
              className="shrink-0 rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-extrabold !text-[#fff8e8]"
            >
              Цели
            </button>
          )}
        </nav>
      </header>

      {user && (
        <GoalsPanel
          isOpen={isGoalsOpen}
          onClose={() => setIsGoalsOpen(false)}
          goals={goals}
        />
      )}
    </>
  );
}

function HeaderNavItem({
  href,
  id,
  children,
}: {
  href: string;
  id?: string;
  children: ReactNode;
}) {
  return (
    <Link
      id={id}
      href={href}
      className="rounded-xl px-2 py-1 text-[16px] font-extrabold text-[#fff8e8] transition hover:text-[#d8a342]"
    >
      {children}
    </Link>
  );
}

function HeaderNavButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-[16px] font-extrabold text-[#fff8e8] transition hover:text-[#d8a342]"
    >
      {children}
    </button>
  );
}

function MobileNavLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="shrink-0 rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-extrabold !text-[#fff8e8]"
    >
      {children}
    </Link>
  );
}

function GoalsPanel({
  isOpen,
  onClose,
  goals,
}: {
  isOpen: boolean;
  onClose: () => void;
  goals: HeaderGoal[];
}) {
  return (
    <div
      className={[
        "fixed inset-0 z-[100] transition",
        isOpen ? "pointer-events-auto" : "pointer-events-none",
      ].join(" ")}
    >
      <div
        onClick={onClose}
        className={[
          "absolute inset-0 bg-black/60 transition-opacity",
          isOpen ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />

      <aside
        className={[
          "absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#06151a] shadow-2xl transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <div className="legendarium-ornament border-b border-white/10 bg-[#0b1f22] p-6">
          <div className="relative">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="mb-3 text-xs font-black uppercase tracking-[0.32em] text-[#d8a342]">
                  Цели изучения
                </p>

                <h2 className="text-3xl font-extrabold leading-tight text-[#fff8e8]">
                  Мой маршрут
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-[#fff8e8] transition hover:bg-white/16"
              >
                Закрыть
              </button>
            </div>

            <p className="leading-7 text-[#cbbba7]">
              Здесь отображаются активные цели, прогресс изучения материалов и
              коллекционные карточки.
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {goals.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/8 p-5 text-[#cbbba7] shadow-sm">
              Активные цели пока не добавлены.
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => {
                const percent =
                  goal.requiredMaterialsCount > 0
                    ? Math.min(
                        Math.round(
                          (goal.currentProgress / goal.requiredMaterialsCount) *
                            100
                        ),
                        100
                      )
                    : 0;

                return (
                  <article
                    key={goal.id}
                    className="rounded-[1.8rem] border border-white/10 bg-white/8 p-5 shadow-lg shadow-black/20 backdrop-blur"
                  >
                    <div className="mb-4 flex flex-wrap gap-2">
                      {goal.genreNames.map((name) => (
                        <span key={name} className="badge-genre">{name}</span>
                      ))}
                      {goal.topicNames.map((name) => (
                        <span key={name} className="badge-topic">{name}</span>
                      ))}

                      {goal.isCompleted && (
                        <span className="badge-success">Выполнена</span>
                      )}
                    </div>

                    <h3 className="mb-3 text-xl font-extrabold leading-tight text-[#fff8e8]">
                      {goal.title}
                    </h3>

                    {goal.description && (
                      <p className="mb-5 text-sm leading-6 text-[#cbbba7]">
                        {goal.description}
                      </p>
                    )}

                    <div className="mb-4">
                      <div className="mb-2 flex justify-between text-sm font-bold text-[#cbbba7]">
                        <span>
                          {goal.currentProgress} из{" "}
                          {goal.requiredMaterialsCount}
                        </span>
                        <span>{percent}%</span>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#2f8f63] to-[#d8a342]"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    <p className="mb-5 text-sm text-[#cbbba7]">
                      Награда:{" "}
                      <span className="font-extrabold text-[#fff8e8]">
                        {goal.cardTitle}
                      </span>
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <Link
                        href="/profile/progress"
                        onClick={onClose}
                        className="rounded-2xl bg-[#d8a342] px-4 py-2 text-sm font-extrabold !text-[#06151a] shadow-md shadow-[#d8a342]/20 transition hover:bg-[#f0bd5b]"
                      >
                        Подробнее
                      </Link>

                      <Link
                        href="/profile/collection"
                        onClick={onClose}
                        className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-extrabold !text-[#fff8e8] transition hover:bg-white/16"
                      >
                        Коллекция
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-white/10 bg-[#0b1f22] p-6">
          <Link
            href="/goals"
            onClick={onClose}
            className="block w-full rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-center font-extrabold !text-[#fff8e8] transition hover:bg-white/16"
          >
            Открыть полную страницу целей
          </Link>
        </div>
      </aside>
    </div>
  );
}
