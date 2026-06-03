import Link from "next/link";

export const metadata = {
  title: "Политика конфиденциальности — Легендариум",
};

export default function PrivacyPage() {
  const today = new Date().toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="min-h-screen bg-[#07181c] px-6 py-16 text-[#fff8e8]">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/register"
          className="mb-10 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/8 px-4 py-2 text-sm font-medium text-[#cbbba7] transition hover:bg-white/12"
        >
          ← Вернуться к регистрации
        </Link>

        <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.25em] text-[#d8a342]">
          Документ
        </p>
        <h1 className="mb-2 text-4xl font-extrabold tracking-tight">
          Политика конфиденциальности
        </h1>
        <p className="mb-12 text-sm text-[#cbbba7]">Дата публикации: {today}</p>

        <div className="space-y-10 text-[#cbbba7]">

          <section>
            <h2 className="mb-3 text-xl font-extrabold text-[#fff8e8]">1. Общие положения</h2>
            <p className="leading-7">
              Настоящая политика конфиденциальности регулирует порядок обработки персональных
              данных пользователей образовательной платформы «Легендариум» (далее — Платформа).
              Используя Платформу, вы подтверждаете своё согласие с данной политикой.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-extrabold text-[#fff8e8]">2. Какие данные мы собираем</h2>
            <ul className="list-disc space-y-2 pl-5 leading-7">
              <li><span className="font-semibold text-[#fff8e8]">Имя</span> — для персонализации интерфейса.</li>
              <li><span className="font-semibold text-[#fff8e8]">Адрес электронной почты</span> — для идентификации аккаунта.</li>
              <li><span className="font-semibold text-[#fff8e8]">Пароль</span> — хранится в зашифрованном виде (bcrypt), оригинал нам недоступен.</li>
              <li><span className="font-semibold text-[#fff8e8]">Данные активности</span> — история заданий, прогресс по целям, избранные материалы.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-extrabold text-[#fff8e8]">3. Цели обработки данных</h2>
            <ul className="list-disc space-y-2 pl-5 leading-7">
              <li>Обеспечение работы аккаунта и авторизации.</li>
              <li>Отображение персонального прогресса и истории.</li>
              <li>Улучшение образовательного опыта на Платформе.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-extrabold text-[#fff8e8]">4. Передача данных третьим лицам</h2>
            <p className="leading-7">
              Мы не продаём и не передаём ваши персональные данные третьим лицам.
              Данные используются исключительно для функционирования Платформы.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-extrabold text-[#fff8e8]">5. Хранение и защита данных</h2>
            <p className="leading-7">
              Данные хранятся в защищённой базе данных. Сессии авторизации подписываются
              алгоритмом HMAC-SHA256. Соединение с сервером защищено протоколом HTTPS.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-extrabold text-[#fff8e8]">6. Права пользователя</h2>
            <p className="leading-7">
              В соответствии с Федеральным законом № 152-ФЗ «О персональных данных» вы вправе:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 leading-7">
              <li>Запросить доступ к своим данным.</li>
              <li>Потребовать исправления неточных данных.</li>
              <li>Потребовать удаления своего аккаунта и всех связанных данных.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-extrabold text-[#fff8e8]">7. Удаление аккаунта</h2>
            <p className="leading-7">
              Для удаления аккаунта и всех ваших персональных данных обратитесь
              к администратору Платформы.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-extrabold text-[#fff8e8]">8. Изменения политики</h2>
            <p className="leading-7">
              Мы оставляем за собой право обновлять данную политику. Актуальная версия
              всегда доступна по адресу <span className="text-[#d8a342]">/privacy</span>.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
