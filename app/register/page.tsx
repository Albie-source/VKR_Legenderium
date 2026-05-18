import Link from "next/link";
import { registerAction } from "./actions";

type RegisterPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const params = await searchParams;

  const errorMessage =
    params.error === "exists"
      ? "Пользователь с таким email уже существует."
      : params.error === "1"
        ? "Проверьте заполнение полей. Пароль должен быть не короче 6 символов."
        : null;

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-10 text-stone-900">
      <section className="mx-auto flex min-h-[calc(100vh-160px)] max-w-7xl items-center justify-center">
        <div className="w-full max-w-md rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
            Регистрация
          </p>

          <h1 className="mb-3 text-4xl font-bold">Создание аккаунта</h1>

          <p className="mb-6 leading-7 text-stone-600">
            Аккаунт нужен для персональных функций: избранного, прогресса целей
            и коллекционных карточек.
          </p>

          {errorMessage && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {errorMessage}
            </div>
          )}

          <form action={registerAction} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">
                Имя
              </label>

              <input
                name="name"
                required
                placeholder="Анна"
                className="w-full rounded-xl border border-stone-300 bg-stone-50 px-4 py-3 outline-none transition focus:border-amber-700 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">
                Email
              </label>

              <input
                name="email"
                type="email"
                required
                placeholder="user@mail.ru"
                className="w-full rounded-xl border border-stone-300 bg-stone-50 px-4 py-3 outline-none transition focus:border-amber-700 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">
                Пароль
              </label>

              <input
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="Минимум 6 символов"
                className="w-full rounded-xl border border-stone-300 bg-stone-50 px-4 py-3 outline-none transition focus:border-amber-700 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-amber-700 px-5 py-3 font-medium text-white transition hover:bg-amber-800"
            >
              Зарегистрироваться
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-600">
            Уже есть аккаунт?{" "}
            <Link
              href="/login"
              className="font-medium text-amber-800 underline-offset-4 hover:underline"
            >
              Войти
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
