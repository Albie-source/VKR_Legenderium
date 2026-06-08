"use client";

import Link from "next/link";
import { useState, useTransition, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { claimGoalRewardAction } from "@/app/goals/claimRewardAction";

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

function isNavActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function HeaderClient({ user, goals }: HeaderClientProps) {
  const [isGoalsOpen, setIsGoalsOpen] = useState(false);
  const pathname = usePathname();
  const loginHref = `/login?next=${encodeURIComponent(pathname)}`;

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
            <HeaderNavItem href="/map" id="nav-map" active={isNavActive(pathname, "/map")}>Карта</HeaderNavItem>
            <HeaderNavItem href="/library" id="nav-library" active={isNavActive(pathname, "/library")}>Библиотека</HeaderNavItem>
            <HeaderNavItem href="/quests" id="nav-quests" active={isNavActive(pathname, "/quests")}>Задания</HeaderNavItem>

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
              href={loginHref}
              className="rounded-2xl bg-[#d8a342] px-5 py-3 text-sm font-extrabold !text-[#06151a] shadow-md transition hover:bg-[#f0bd5b]"
            >
              Войти
            </Link>
          )}
          </div>
        </div>

        {user && goals.length > 0 && (() => {
          const completedCount = goals.filter((g) => g.isCompleted).length;
          const pct = Math.round((completedCount / goals.length) * 100);
          return (
            <div className="border-t border-white/5 px-6 py-1.5">
              <div className="mx-auto flex max-w-7xl items-center gap-3">
                <span className="shrink-0 text-[11px] font-bold text-white/35">Архив восстановлен</span>
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#2f8f63] to-[#d8a342] transition-all duration-1000"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="shrink-0 text-[11px] font-black text-[#d8a342]">
                  {completedCount}/{goals.length}
                </span>
              </div>
            </div>
          );
        })()}

        <nav className="flex gap-3 overflow-x-auto border-t border-white/10 px-6 py-3 md:hidden">
          <MobileNavLink href="/map" active={isNavActive(pathname, "/map")}>Карта</MobileNavLink>
          <MobileNavLink href="/library" active={isNavActive(pathname, "/library")}>Библиотека</MobileNavLink>
          <MobileNavLink href="/quests" active={isNavActive(pathname, "/quests")}>Задания</MobileNavLink>

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
  active,
  children,
}: {
  href: string;
  id?: string;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      id={id}
      href={href}
      className={[
        "rounded-xl border-b-2 px-2 py-1 text-[16px] font-extrabold transition",
        active
          ? "border-[#d8a342] text-[#d8a342]"
          : "border-transparent text-[#fff8e8] hover:text-[#d8a342]",
      ].join(" ")}
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
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={[
        "shrink-0 rounded-2xl border px-4 py-2 text-sm font-extrabold",
        active
          ? "border-[#d8a342]/50 bg-[#d8a342]/15 !text-[#d8a342]"
          : "border-white/10 bg-white/10 !text-[#fff8e8]",
      ].join(" ")}
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
  const [claimedIds, setClaimedIds] = useState<Set<number>>(new Set());
  const [flyingOutIds, setFlyingOutIds] = useState<Set<number>>(new Set());
  const [, startTransition] = useTransition();

  const visibleGoals = goals.filter(
    (g) => !g.rewardReceived && !claimedIds.has(g.id)
  );
  const celebrationGoals = visibleGoals.filter((g) => g.isCompleted);
  const activeGoals = visibleGoals.filter((g) => !g.isCompleted);

  function handleClaimReward(goalId: number) {
    setFlyingOutIds((prev) => new Set(prev).add(goalId));
    setTimeout(() => {
      setClaimedIds((prev) => new Set(prev).add(goalId));
      setFlyingOutIds((prev) => {
        const next = new Set(prev);
        next.delete(goalId);
        return next;
      });
    }, 480);
    startTransition(() => {
      claimGoalRewardAction(goalId);
    });
  }

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
            Выполняйте задания, чтобы продвигаться по целям и получать
            коллекционные карточки.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {visibleGoals.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/8 p-5 text-[#cbbba7]">
              {goals.every((g) => g.rewardReceived || claimedIds.has(g.id))
                ? "Все цели выполнены! Проверьте коллекцию."
                : "Активные цели пока не добавлены."}
            </div>
          ) : (
            <div className="space-y-4">
              {celebrationGoals.map((goal) => (
                <article
                  key={goal.id}
                  className={[
                    "rounded-[1.8rem] border border-[#d8a342]/50 bg-gradient-to-b from-[#1a2f18] to-[#0f1e0d] p-5 shadow-lg shadow-[#d8a342]/10",
                    flyingOutIds.has(goal.id) ? "goal-fly-out" : "goal-celebrate",
                  ].join(" ")}
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-2xl">🎉</span>
                    <span className="text-sm font-extrabold uppercase tracking-wider text-[#d8a342]">
                      Цель выполнена!
                    </span>
                  </div>

                  <h3 className="mb-2 text-xl font-extrabold leading-tight text-[#fff8e8]">
                    {goal.title}
                  </h3>

                  <p className="mb-5 text-sm text-[#cbbba7]">
                    Ваша награда:{" "}
                    <span className="font-extrabold text-[#d8a342]">
                      {goal.cardTitle}
                    </span>
                  </p>

                  <button
                    type="button"
                    onClick={() => handleClaimReward(goal.id)}
                    className="w-full rounded-2xl bg-[#d8a342] px-4 py-3 text-sm font-extrabold text-[#06151a] shadow-lg shadow-[#d8a342]/30 transition hover:bg-[#f0bd5b] active:scale-95"
                  >
                    Забрать награду ✨
                  </button>
                </article>
              ))}

              {activeGoals.map((goal) => {
                const percent =
                  goal.requiredMaterialsCount > 0
                    ? Math.min(
                        Math.round(
                          (goal.currentProgress / goal.requiredMaterialsCount) * 100
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
                          {goal.currentProgress} из {goal.requiredMaterialsCount}
                        </span>
                        <span>{percent}%</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#2f8f63] to-[#d8a342] transition-all duration-700"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-sm text-[#cbbba7]">
                      Награда:{" "}
                      <span className="font-extrabold text-[#fff8e8]">
                        {goal.cardTitle}
                      </span>
                    </p>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-white/10 bg-[#0b1f22] p-6">
          <Link
            href="/profile/collection"
            onClick={onClose}
            className="block w-full rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-center font-extrabold !text-[#fff8e8] transition hover:bg-white/16"
          >
            Моя коллекция →
          </Link>
        </div>
      </aside>
    </div>
  );
}
