import Link from "next/link";
import { registerAction } from "./actions";
import PasswordInput from "@/components/PasswordInput";

type RegisterPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const params = await searchParams;
  const next = params.next ?? "";

  const errorMessage =
    params.error === "exists"
      ? "Пользователь с таким email уже существует."
      : params.error === "consent"
        ? "Необходимо принять политику конфиденциальности."
        : params.error === "1"
          ? "Проверьте заполнение полей. Пароль должен быть не короче 6 символов."
          : null;

  return (
    <main className="min-h-screen overflow-hidden bg-[#07181c] text-[#fff8e8]">
      <section className="relative flex min-h-screen items-center justify-center px-6 py-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(58,166,160,0.18),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(216,163,66,0.16),transparent_24%),linear-gradient(180deg,#07181c_0%,#0b2428_100%)]" />

        <div className="relative w-full max-w-md rounded-[2.2rem] border border-[#e4d4bf] bg-[#fbf7f1] p-8 text-stone-950 shadow-2xl shadow-black/30 md:p-9">
          <h1 className="mb-3 text-4xl font-extrabold tracking-tight">
            Регистрация
          </h1>

          <p className="mb-7 leading-7 text-stone-600">
            Создайте аккаунт, чтобы сохранять материалы, проходить задания и
            отслеживать личный прогресс.
          </p>

          {errorMessage && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
              {errorMessage}
            </div>
          )}

          <form
            action={registerAction}
            autoComplete="off"
            className="space-y-4"
          >
            {next && <input type="hidden" name="next" value={next} />}
            <div>
              <label className="mb-2 block text-sm font-bold text-stone-800">
                Имя
              </label>

              <input
                name="name"
                required
                autoComplete="off"
                placeholder="Анна"
                className="w-full rounded-2xl border border-[#dccab3] bg-white px-4 py-3 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#d8a342] focus:ring-2 focus:ring-[#f3dfb1]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-stone-800">
                Email
              </label>

              <input
                name="email"
                type="email"
                required
                autoComplete="new-password"
                placeholder="user@mail.ru"
                className="w-full rounded-2xl border border-[#dccab3] bg-white px-4 py-3 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#d8a342] focus:ring-2 focus:ring-[#f3dfb1]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-stone-800">
                Пароль
              </label>

              <PasswordInput
                name="password"
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="Минимум 6 символов"
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                name="consent"
                type="checkbox"
                required
                className="mt-0.5 h-4 w-4 shrink-0 accent-[#d8a342]"
              />
              <span className="text-sm leading-6 text-stone-600">
                Я принимаю{" "}
                <Link
                  href="/privacy"
                  target="_blank"
                  className="font-extrabold !text-[#8a5418] underline-offset-4 hover:underline"
                >
                  Политику конфиденциальности
                </Link>{" "}
                и даю согласие на обработку персональных данных
              </span>
            </label>

            <button
              type="submit"
              className="w-full rounded-2xl bg-[#d8a342] px-5 py-3 font-extrabold !text-[#06151a] shadow-md transition hover:-translate-y-0.5 hover:bg-[#f0bd5b]"
            >
              Зарегистрироваться
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-600">
            Уже есть аккаунт?{" "}
            <Link
              href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
              className="font-extrabold !text-[#8a5418] underline-offset-4 hover:underline"
            >
              Войти
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
