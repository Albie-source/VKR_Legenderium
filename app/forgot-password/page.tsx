import Link from "next/link";
import { forgotPasswordAction } from "./actions";

type ForgotPasswordPageProps = {
  searchParams: Promise<{ sent?: string }>;
};

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const params = await searchParams;
  const isSent = params.sent === "1";

  return (
    <main className="min-h-screen overflow-hidden bg-[#07181c] text-[#fff8e8]">
      <section className="relative flex min-h-screen items-center justify-center px-6 py-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(58,166,160,0.18),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(216,163,66,0.16),transparent_24%),linear-gradient(180deg,#07181c_0%,#0b2428_100%)]" />

        <div className="relative w-full max-w-md rounded-[2.2rem] border border-[#e4d4bf] bg-[#fbf7f1] p-8 text-stone-950 shadow-2xl shadow-black/30 md:p-9">
          <h1 className="mb-3 text-4xl font-extrabold tracking-tight">
            Восстановление пароля
          </h1>

          {isSent ? (
            <>
              <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
                Если аккаунт с таким email существует, мы отправили письмо со
                ссылкой для сброса пароля. Проверьте входящие и папку «Спам».
              </div>

              <p className="mb-6 leading-7 text-stone-600">
                Ссылка действительна в течение 1 часа.
              </p>

              <Link
                href="/login"
                className="block w-full rounded-2xl bg-[#d8a342] px-5 py-3 text-center font-extrabold !text-[#06151a] shadow-md transition hover:-translate-y-0.5 hover:bg-[#f0bd5b]"
              >
                Вернуться ко входу
              </Link>
            </>
          ) : (
            <>
              <p className="mb-7 leading-7 text-stone-600">
                Укажите email, привязанный к вашему аккаунту. Мы отправим
                ссылку для создания нового пароля.
              </p>

              <form action={forgotPasswordAction} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-stone-800">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="user@mail.ru"
                    className="w-full rounded-2xl border border-[#dccab3] bg-white px-4 py-3 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#d8a342] focus:ring-2 focus:ring-[#f3dfb1]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-[#d8a342] px-5 py-3 font-extrabold !text-[#06151a] shadow-md transition hover:-translate-y-0.5 hover:bg-[#f0bd5b]"
                >
                  Отправить ссылку
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-stone-600">
                Вспомнили пароль?{" "}
                <Link
                  href="/login"
                  className="font-extrabold !text-[#8a5418] underline-offset-4 hover:underline"
                >
                  Войти
                </Link>
              </p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
