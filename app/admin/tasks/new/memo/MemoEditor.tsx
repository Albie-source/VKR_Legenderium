"use client";

import { useRef, useState } from "react";
import { createMemoTaskAction } from "./actions";

type Material = {
  id: number;
  title: string;
  regionName: string;
  genreName: string;
};

type PairDraft = {
  id: string;
  label: string;
  previewUrl: string;
  fileName: string;
};

function makeId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export default function MemoEditor({ materials }: { materials: Material[] }) {
  const cardBackInputRef = useRef<HTMLInputElement>(null);
  const [cardBackPreview, setCardBackPreview] = useState("");
  const [cardBackName, setCardBackName] = useState("");

  const pairFileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [pairs, setPairs] = useState<PairDraft[]>(() => [
    { id: makeId("pair"), label: "Карточка 1", previewUrl: "", fileName: "" },
    { id: makeId("pair"), label: "Карточка 2", previewUrl: "", fileName: "" },
  ]);

  function handleCardBackSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCardBackName(file.name);
    setCardBackPreview(URL.createObjectURL(file));
  }

  function addPair() {
    setPairs((prev) => [...prev, { id: makeId("pair"), label: `Карточка ${prev.length + 1}`, previewUrl: "", fileName: "" }]);
  }

  function removePair(id: string) {
    setPairs((prev) => prev.filter((p) => p.id !== id));
    delete pairFileInputRefs.current[id];
  }

  function updateLabel(id: string, label: string) {
    setPairs((prev) => prev.map((p) => (p.id === id ? { ...p, label } : p)));
  }

  function handlePairFileSelect(id: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPairs((prev) =>
      prev.map((p) => (p.id === id ? { ...p, previewUrl: URL.createObjectURL(file), fileName: file.name } : p))
    );
  }

  const pairsMeta = pairs.map(({ id, label }) => ({ id, label }));
  const allPairsHaveImages = pairs.length > 0 && pairs.every((p) => p.previewUrl);

  return (
    <form action={createMemoTaskAction} className="space-y-6">
      <input type="hidden" name="pairsJson" value={JSON.stringify(pairsMeta)} />

      {/* Material */}
      <div>
        <label className="mb-2 block text-sm font-medium text-stone-700">Материал</label>
        <select
          name="materialId"
          className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-700"
        >
          <option value="">Выберите материал</option>
          {materials.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title} — {m.genreName}, {m.regionName}
            </option>
          ))}
        </select>
      </div>

      {/* Title + difficulty */}
      <div className="grid gap-4 md:grid-cols-[1fr_180px]">
        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700">Название задания *</label>
          <input
            name="title"
            required
            placeholder="Мемо: найди одинаковые карточки"
            className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-700"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700">Сложность</label>
          <select
            name="difficulty"
            defaultValue="medium"
            className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-700"
          >
            <option value="easy">Лёгкое</option>
            <option value="medium">Среднее</option>
            <option value="hard">Сложное</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="mb-2 block text-sm font-medium text-stone-700">Описание</label>
        <textarea
          name="description"
          rows={2}
          placeholder="Краткая инструкция для пользователя"
          className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-700"
        />
      </div>

      {/* Question */}
      <div>
        <label className="mb-2 block text-sm font-medium text-stone-700">Задание / вопрос *</label>
        <textarea
          name="question"
          rows={2}
          required
          placeholder="Найдите все пары одинаковых карточек"
          className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-700"
        />
      </div>

      {/* Card back */}
      <div>
        <label className="mb-2 block text-sm font-medium text-stone-700">Рубашка карточек (оборот)</label>
        <input
          ref={cardBackInputRef}
          type="file"
          name="cardBackFile"
          accept="image/*"
          className="hidden"
          onChange={handleCardBackSelect}
        />
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => cardBackInputRef.current?.click()}
            className="rounded-xl border border-stone-300 bg-white px-5 py-3 text-sm font-medium text-stone-700 transition hover:border-amber-700 hover:bg-amber-50"
          >
            Загрузить с компьютера
          </button>
          {cardBackPreview ? (
            <div className="flex items-center gap-2">
              <img
                src={cardBackPreview}
                alt="Рубашка карточек"
                className="h-14 w-14 rounded-lg border border-stone-300 object-cover"
              />
              <span className="text-sm text-stone-600">
                ✓ <span className="font-medium">{cardBackName}</span>
              </span>
            </div>
          ) : (
            <span className="text-sm text-stone-400">Необязательно — иначе будет показан плейсхолдер «?»</span>
          )}
        </div>
      </div>

      {/* Pairs */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <label className="text-sm font-medium text-stone-700">
            Карточки ({pairs.length}) — каждая будет показана дважды, чтобы игрок искал пары
          </label>
          <button
            type="button"
            onClick={addPair}
            className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-amber-700 hover:bg-amber-50"
          >
            + Добавить карточку
          </button>
        </div>

        <div className="space-y-3">
          {pairs.map((pair, index) => (
            <div key={pair.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-amber-700 text-sm font-extrabold text-white">
                  {index + 1}
                </span>

                <div className="flex-1 space-y-2">
                  <input
                    value={pair.label}
                    onChange={(e) => updateLabel(pair.id, e.target.value)}
                    placeholder="Подпись карточки (для подсказки и отчётов)"
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-amber-700"
                  />

                  <input
                    ref={(el) => { pairFileInputRefs.current[pair.id] = el; }}
                    type="file"
                    name={`image_${pair.id}`}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handlePairFileSelect(pair.id, e)}
                  />

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => pairFileInputRefs.current[pair.id]?.click()}
                      className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-amber-700 hover:bg-amber-50"
                    >
                      Загрузить картинку
                    </button>
                    {pair.fileName && (
                      <span className="text-sm text-stone-600">
                        ✓ <span className="font-medium">{pair.fileName}</span>
                      </span>
                    )}
                  </div>
                </div>

                {pair.previewUrl && (
                  <img
                    src={pair.previewUrl}
                    alt={pair.label}
                    className="h-16 w-16 shrink-0 rounded-xl border border-stone-300 object-cover"
                  />
                )}

                <button
                  type="button"
                  onClick={() => removePair(pair.id)}
                  className="text-stone-400 hover:text-red-600 transition text-lg leading-none"
                  title="Удалить карточку"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>

        {!allPairsHaveImages && pairs.length > 0 && (
          <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Загрузите картинку для каждой карточки — без неё пара не сможет участвовать в игре.
          </p>
        )}
      </div>

      {/* Explanation */}
      <div>
        <label className="mb-2 block text-sm font-medium text-stone-700">Пояснение после прохождения</label>
        <textarea
          name="explanation"
          rows={2}
          placeholder="Необязательно. Появится после того, как все пары найдены."
          className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-700"
        />
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={!allPairsHaveImages}
          className="rounded-xl bg-amber-700 px-6 py-3 font-medium text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500"
        >
          Сохранить задание
        </button>
      </div>
    </form>
  );
}
