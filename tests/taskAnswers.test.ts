import { describe, it, expect } from "vitest";
import {
  isSingleChoiceConfig,
  isMatchingConfig,
  checkMatchingAnswer,
  checkTaskAnswer,
} from "@/lib/taskAnswers";

const singleChoice = {
  question: "Кто создал мир в чукотских мифах?",
  options: ["Ворон", "Медведь", "Кит"],
  correctAnswer: "Ворон",
};

const matching = {
  question: "Соотнесите народ и регион",
  pairs: [
    { left: "нанайцы", right: "Хабаровский край" },
    { left: "нивхи", right: "Сахалинская область" },
  ],
};

describe("isSingleChoiceConfig", () => {
  it("принимает корректную конфигурацию", () => {
    expect(isSingleChoiceConfig(singleChoice)).toBe(true);
  });

  it("отклоняет null, строку и пустой объект", () => {
    expect(isSingleChoiceConfig(null)).toBe(false);
    expect(isSingleChoiceConfig("строка")).toBe(false);
    expect(isSingleChoiceConfig({})).toBe(false);
  });

  it("отклоняет конфигурацию без correctAnswer", () => {
    expect(
      isSingleChoiceConfig({ question: "?", options: ["а", "б"] }),
    ).toBe(false);
  });
});

describe("isMatchingConfig", () => {
  it("принимает корректную конфигурацию", () => {
    expect(isMatchingConfig(matching)).toBe(true);
  });

  it("отклоняет пары с нестроковыми значениями", () => {
    expect(
      isMatchingConfig({
        question: "?",
        pairs: [{ left: "а", right: 42 }],
      }),
    ).toBe(false);
  });
});

describe("checkTaskAnswer: single_choice", () => {
  it("верный ответ засчитывается", () => {
    expect(checkTaskAnswer("single_choice", singleChoice, "Ворон")).toBe(true);
  });

  it("неверный ответ не засчитывается", () => {
    expect(checkTaskAnswer("single_choice", singleChoice, "Медведь")).toBe(false);
  });

  it("ответ чувствителен к регистру", () => {
    expect(checkTaskAnswer("single_choice", singleChoice, "ворон")).toBe(false);
  });
});

describe("checkTaskAnswer: matching", () => {
  it("полное совпадение пар засчитывается", () => {
    const answer = JSON.stringify({
      нанайцы: "Хабаровский край",
      нивхи: "Сахалинская область",
    });
    expect(checkTaskAnswer("matching", matching, answer)).toBe(true);
  });

  it("одна неверная пара — ответ не засчитывается", () => {
    const answer = JSON.stringify({
      нанайцы: "Сахалинская область",
      нивхи: "Хабаровский край",
    });
    expect(checkTaskAnswer("matching", matching, answer)).toBe(false);
  });

  it("неполный ответ не засчитывается", () => {
    const answer = JSON.stringify({ нанайцы: "Хабаровский край" });
    expect(checkTaskAnswer("matching", matching, answer)).toBe(false);
  });

  it("некорректный JSON не роняет проверку", () => {
    expect(checkMatchingAnswer(matching, "не json {")).toBe(false);
  });
});

describe("checkTaskAnswer: неподдерживаемые задания", () => {
  it("неизвестный тип возвращает null", () => {
    expect(checkTaskAnswer("memo", { cards: [] }, "x")).toBe(null);
  });

  it("повреждённая конфигурация возвращает null", () => {
    expect(checkTaskAnswer("single_choice", { broken: true }, "x")).toBe(null);
  });
});
