"use client";

import { useRef, useState } from "react";
import { createHiddenObjectsTaskAction } from "./actions";

type Material = {
  id: number;
  title: string;
  regionName: string;
  genreName: string;
};

type ObjectDraft = {
  id: string;
  label: string;
  x: number;
  y: number;
  radius: number;
};

export default function HiddenObjectsEditor({ materials }: { materials: Material[] }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [imageError, setImageError] = useState(false);
  const [objects, setObjects] = useState<ObjectDraft[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError(false);
    setObjects([]);
    setSelectedId(null);
    setFileName(file.name);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function handleImageClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!previewUrl) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = parseFloat(((e.clientX - rect.left) / rect.width * 100).toFixed(2));
    const y = parseFloat(((e.clientY - rect.top) / rect.height * 100).toFixed(2));
    const id = `obj_${Date.now()}`;
    const draft: ObjectDraft = { id, label: `Объект ${objects.length + 1}`, x, y, radius: 5 };
    setObjects((prev) => [...prev, draft]);
    setSelectedId(id);
  }

  function updateLabel(id: string, label: string) {
    setObjects((prev) => prev.map((o) => (o.id === id ? { ...o, label } : o)));
  }

  function updateRadius(id: string, radius: number) {
    setObjects((prev) => prev.map((o) => (o.id === id ? { ...o, radius } : o)));
  }

  function removeObject(id: string) {
    setObjects((prev) => prev.filter((o) => o.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  const configObjects = objects.map(({ id, label, x, y, radius }) => ({ id, label, x, y, radius }));

  return (
    <form action={createHiddenObjectsTaskAction} className="space-y-6">
      <input type="hidden" name="objectsJson" value={JSON.stringify(configObjects)} />

      {/* Hidden real file input */}
      <input
        ref={fileInputRef}
        type="file"
        name="imageFile"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Material */}
      <div>
        <label className="mb-2 block text-sm font-medium text-stone-700">Материал *</label>
        <select
          name="materialId"
          required
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
            placeholder="Найди предметы на иллюстрации"
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
          placeholder="Найди на картинке все предметы из русской избы"
          className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-700"
        />
      </div>

      {/* Image upload */}
      <div>
        <label className="mb-2 block text-sm font-medium text-stone-700">Изображение *</label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl border border-stone-300 bg-white px-5 py-3 text-sm font-medium text-stone-700 transition hover:border-amber-700 hover:bg-amber-50"
          >
            Загрузить с компьютера
          </button>
          {fileName && (
            <span className="text-sm text-stone-600">
              ✓ <span className="font-medium">{fileName}</span>
            </span>
          )}
        </div>
        {imageError && (
          <p className="mt-1 text-sm text-red-600">Не удалось отобразить изображение.</p>
        )}
      </div>

      {/* Coordinate picker */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-stone-700">Расставь объекты на картинке *</label>
          {previewUrl && (
            <span className="text-xs text-stone-500">Кликни на картинку — появится маркер</span>
          )}
        </div>

        {!previewUrl ? (
          <div
            className="flex h-48 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 text-sm text-stone-400 transition hover:border-amber-400 hover:bg-amber-50"
            onClick={() => fileInputRef.current?.click()}
          >
            Нажмите, чтобы загрузить изображение
          </div>
        ) : (
          <div
            className="relative cursor-crosshair select-none overflow-hidden rounded-2xl border border-stone-300 bg-stone-100"
            onClick={handleImageClick}
          >
            <img
              src={previewUrl}
              alt="Картинка задания"
              className="w-full"
              draggable={false}
              onError={() => setImageError(true)}
            />

            {objects.map((obj, index) => (
              <div
                key={obj.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${obj.x}%`, top: `${obj.y}%` }}
                onClick={(e) => { e.stopPropagation(); setSelectedId(obj.id); }}
              >
                {/* Radius circle */}
                <div
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber-400/50 bg-amber-400/15 pointer-events-none"
                  style={{ width: `${obj.radius * 2}%`, aspectRatio: "1", left: "50%", top: "50%" }}
                />
                {/* Dot */}
                <div
                  className={[
                    "relative z-10 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 text-xs font-extrabold shadow-lg transition",
                    selectedId === obj.id
                      ? "border-amber-500 bg-amber-500 text-white scale-110"
                      : "border-amber-700 bg-amber-700/90 text-white hover:scale-105",
                  ].join(" ")}
                >
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Objects list */}
      {objects.length > 0 && (
        <div>
          <p className="mb-3 text-sm font-medium text-stone-700">Объекты ({objects.length})</p>
          <div className="space-y-3">
            {objects.map((obj, index) => (
              <div
                key={obj.id}
                className={[
                  "rounded-2xl border p-4 transition cursor-pointer",
                  selectedId === obj.id ? "border-amber-400 bg-amber-50" : "border-stone-200 bg-stone-50",
                ].join(" ")}
                onClick={() => setSelectedId(obj.id)}
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-amber-700 text-sm font-extrabold text-white">
                    {index + 1}
                  </span>
                  <div className="flex-1 space-y-2">
                    <input
                      value={obj.label}
                      onChange={(e) => updateLabel(obj.id, e.target.value)}
                      placeholder="Название объекта (видит игрок)"
                      className="w-full rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-amber-700"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-stone-500">X: {obj.x}% Y: {obj.y}%</span>
                      <label className="flex items-center gap-2 text-xs text-stone-500">
                        Радиус:
                        <input
                          type="range"
                          min={2}
                          max={18}
                          value={obj.radius}
                          onChange={(e) => updateRadius(obj.id, parseFloat(e.target.value))}
                          className="w-24"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="w-6 font-bold text-stone-700">{obj.radius}</span>
                      </label>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeObject(obj.id); }}
                    className="text-stone-400 hover:text-red-600 transition text-lg leading-none"
                    title="Удалить"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Explanation */}
      <div>
        <label className="mb-2 block text-sm font-medium text-stone-700">Пояснение после прохождения</label>
        <textarea
          name="explanation"
          rows={2}
          placeholder="Необязательно. Появится после нахождения всех объектов."
          className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-700"
        />
      </div>

      {objects.length === 0 && previewUrl && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Кликни на изображение, чтобы добавить объекты.
        </p>
      )}

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={objects.length === 0 || !previewUrl}
          className="rounded-xl bg-amber-700 px-6 py-3 font-medium text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500"
        >
          Сохранить задание
        </button>
      </div>
    </form>
  );
}
