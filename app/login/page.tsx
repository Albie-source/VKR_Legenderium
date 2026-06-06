import Link from "next/link";
import { loginAction } from "./actions";
import PasswordInput from "@/components/PasswordInput";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    registered?: string;
    reset?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  const hasError = params.error === "1";
  const isRegistered = params.registered === "1";
  const isReset = params.reset === "1";
  const next = params.next ?? "";

  return (
    <main className="min-h-screen overflow-hidden bg-[#07181c] text-[#fff8e8]">
      <section className="relative flex min-h-screen items-center justify-center px-6 py-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(58,166,160,0.18),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(216,163,66,0.16),transparent_24%),linear-gradient(180deg,#07181c_0%,#0b2428_100%)]" />

        <div className="relative w-full max-w-md rounded-[2.2rem] border border-[#e4d4bf] bg-[#fbf7f1] p-8 text-stone-950 shadow-2xl shadow-black/30 md:p-9">
          <h1 className="mb-3 text-4xl font-extrabold tracking-tight">
            Вход
          </h1>

          <p className="mb-7 leading-7 text-stone-600">
            Войдите в аккаунт, чтобы сохранять материалы, проходить задания и
            отслеживать личный прогресс.
          </p>

          {hasError && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
              Неверный email или пароль.
            </div>
          )}

          {isRegistered && (
            <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
              Аккаунт создан. Теперь можно войти.
            </div>
          )}

          {isReset && (
            <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
              Пароль успешно изменён. Войдите с новым паролем.
            </div>
          )}

          <form
            action={loginAction}
            autoComplete="off"
            className="space-y-4"
          >
            <input type="hidden" name="next" value={next} />

            {/* Скрытые поля помогают сбить автозаполнение браузера */}
            <input
              type="text"
              name="fake-email"
              autoComplete="username"
              className="hidden"
              tabIndex={-1}
            />
            <input
              type="password"
              name="fake-password"
              autoComplete="current-password"
              className="hidden"
              tabIndex={-1}
            />

            <div>
              <label className="mb-2 block text-sm font-bold text-stone-800">
                Email
              </label>

              <input
                name="email"
                type="email"
                required
                autoComplete="off"
                placeholder="user@mail.ru"
                defaultValue=""
                className="w-full rounded-2xl border border-[#dccab3] bg-white px-4 py-3 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#d8a342] focus:ring-2 focus:ring-[#f3dfb1]"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-bold text-stone-800">
                  Пароль
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold !text-[#8a5418] underline-offset-4 hover:underline"
                >
                  Забыли пароль?
                </Link>
              </div>

              <PasswordInput
                name="password"
                required
                autoComplete="new-password"
                placeholder="Введите пароль"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-[#d8a342] px-5 py-3 font-extrabold !text-[#06151a] shadow-md transition hover:-translate-y-0.5 hover:bg-[#f0bd5b]"
            >
              Войти
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-600">
            Нет аккаунта?{" "}
            <Link
              href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"}
              className="font-extrabold !text-[#8a5418] underline-offset-4 hover:underline"
            >
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
