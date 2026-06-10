import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  materialSchema,
  taskSchema,
  goalSchema,
  sourceSchema,
} from "@/lib/schemas";

describe("registerSchema", () => {
  it("принимает корректные данные", () => {
    const result = registerSchema.safeParse({
      name: "Анна",
      email: "anna@mail.ru",
      password: "secret123",
    });
    expect(result.success).toBe(true);
  });

  it("отклоняет некорректный email", () => {
    const result = registerSchema.safeParse({
      name: "Анна",
      email: "не-email",
      password: "secret123",
    });
    expect(result.success).toBe(false);
  });

  it("отклоняет пароль короче 6 символов", () => {
    const result = registerSchema.safeParse({
      name: "Анна",
      email: "anna@mail.ru",
      password: "12345",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("подставляет пустой next по умолчанию", () => {
    const result = loginSchema.parse({
      email: "user@legendarium.ru",
      password: "user123",
    });
    expect(result.next).toBe("");
  });

  it("отклоняет пустой пароль", () => {
    const result = loginSchema.safeParse({
      email: "user@legendarium.ru",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("materialSchema", () => {
  const base = {
    title: "Легенда о Байкале",
    regionId: "3",
    peopleId: "1",
    genreId: "2",
    sourceId: "4",
  };

  it("приводит строковые ID из формы к числам", () => {
    const result = materialSchema.parse(base);
    expect(result.regionId).toBe(3);
    expect(result.status).toBe("DRAFT");
  });

  it("превращает пустые координаты в null", () => {
    const result = materialSchema.parse({ ...base, latitude: "", longitude: "" });
    expect(result.latitude).toBe(null);
    expect(result.longitude).toBe(null);
  });

  it("отклоняет широту вне диапазона", () => {
    const result = materialSchema.safeParse({ ...base, latitude: "91" });
    expect(result.success).toBe(false);
  });

  it("отклоняет неизвестный статус", () => {
    const result = materialSchema.safeParse({ ...base, status: "HIDDEN" });
    expect(result.success).toBe(false);
  });

  it("обрезает пробелы в необязательных полях до null", () => {
    const result = materialSchema.parse({ ...base, shortDescription: "   " });
    expect(result.shortDescription).toBe(null);
  });
});

describe("taskSchema", () => {
  const base = {
    title: "Викторина",
    question: "Кто герой легенды?",
    option1: "Ворон",
    option2: "Медведь",
    correctAnswer: "Ворон",
  };

  it("принимает задание без материала", () => {
    const result = taskSchema.parse({ ...base, materialId: "" });
    expect(result.materialId).toBe(null);
  });

  it("приводит materialId к числу", () => {
    const result = taskSchema.parse({ ...base, materialId: "7" });
    expect(result.materialId).toBe(7);
  });

  it("отклоняет задание без вариантов ответа", () => {
    const result = taskSchema.safeParse({
      title: "Викторина",
      question: "?",
      correctAnswer: "Ворон",
    });
    expect(result.success).toBe(false);
  });
});

describe("goalSchema", () => {
  it("отклоняет нулевое количество материалов", () => {
    const result = goalSchema.safeParse({
      title: "Цель",
      cardTitle: "Карточка",
      requiredMaterialsCount: "0",
    });
    expect(result.success).toBe(false);
  });

  it("принимает цель без региона", () => {
    const result = goalSchema.parse({
      title: "Цель",
      cardTitle: "Карточка",
      requiredMaterialsCount: "5",
      regionId: "",
    });
    expect(result.regionId).toBe(null);
    expect(result.requiredMaterialsCount).toBe(5);
  });
});

describe("sourceSchema", () => {
  it("отклоняет год больше 2100", () => {
    const result = sourceSchema.safeParse({ title: "Сборник", year: "2200" });
    expect(result.success).toBe(false);
  });

  it("превращает пустой год в null", () => {
    const result = sourceSchema.parse({ title: "Сборник", year: "" });
    expect(result.year).toBe(null);
  });
});
