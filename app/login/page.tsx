import Link from "next/link";
import { loginAction } from "./actions";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    registered?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const hasError = params.error === "1";
  const isRegistered = params.registered === "1";

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-10 text-stone-900">
      <section className="mx-auto flex min-h-[calc(100vh-160px)] max-w-7xl items-center justify-center">
        <div className="w-full max-w-md rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
            Авторизация
          </p>

          <h1 className="mb-3 text-4xl font-bold">Вход в систему</h1>

          <p className="mb-6 leading-7 text-stone-600">
            Войдите в аккаунт, чтобы получить доступ к персональным функциям.
            Администратор после входа попадёт в панель управления.
          </p>

          {hasError && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              Неверный email или пароль.
            </div>
          )}

          {isRegistered && (
            <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              Аккаунт создан. Теперь можно войти.
            </div>
          )}

          <form action={loginAction} className="space-y-4">
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
                placeholder="Введите пароль"
                className="w-full rounded-xl border border-stone-300 bg-stone-50 px-4 py-3 outline-none transition focus:border-amber-700 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-amber-700 px-5 py-3 font-medium text-white transition hover:bg-amber-800"
            >
              Войти
            </button>
          </form>

          <div className="mt-6 rounded-2xl bg-stone-50 p-4 text-sm leading-6 text-stone-600">
            <p className="mb-2 font-medium text-stone-900">
              Тестовый администратор:
            </p>
            <p>admin@legendarium.ru</p>
            <p>admin123</p>
          </div>

          <p className="mt-6 text-center text-sm text-stone-600">
            Нет аккаунта?{" "}
            <Link
              href="/register"
              className="font-medium text-amber-800 underline-offset-4 hover:underline"
            >
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
