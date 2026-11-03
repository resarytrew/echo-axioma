/**
 * Связь образовательных модулей и инженерных миссий.
 * Миссию можно открыть и осмотреть всегда, но инструменты
 * включаются только после освоения соответствующих тем.
 */

export interface ToolRequirement {
  /** id способности из учебного модуля */
  capability: string;
  /** какой модуль его выдаёт */
  moduleId: string;
  moduleTitle: string;
  /** что именно даёт игроку */
  grants: string;
  /** зачем нужно в миссии */
  usedFor: string;
}

export interface MissionRequirements {
  missionId: string;
  title: string;
  required: ToolRequirement[];
  optional: ToolRequirement[];
}

export const MISSION_REQUIREMENTS: Record<string, MissionRequirements> = {
  "drone-route": {
    missionId: "drone-route",
    title: "Маршрут дрона",
    required: [
      {
        capability: "VECTOR STATE",
        moduleId: "a1-m6",
        moduleTitle: "I.6 · Векторы",
        grants: "Представление перемещения в координатах",
        usedFor: "Определение направления",
      },
      {
        capability: "VECTOR OPS",
        moduleId: "a1-m7",
        moduleTitle: "I.7 · Операции с векторами",
        grants: "Сложение векторов, масштабирование",
        usedFor: "Построение маршрута",
      },
    ],
    optional: [
      {
        capability: "LINEAR TRANSFORM",
        moduleId: "a1-m9",
        moduleTitle: "I.9 · Матрицы",
        grants: "Преобразование координат",
        usedFor: "Сложные манёвры и модернизация",
      },
    ],
  },
  "false-alarm": {
    missionId: "false-alarm",
    title: "Ложная тревога",
    required: [],
    optional: [
      {
        capability: "FUNCTION ENGINE",
        moduleId: "a1-m4",
        moduleTitle: "I.4 · Функции",
        grants: "Пороговые и логические функции",
        usedFor: "Настройка правила тревоги",
      },
    ],
  },
};

export function missingRequirements(
  missionId: string,
  has: (capId: string) => boolean,
): ToolRequirement[] {
  const req = MISSION_REQUIREMENTS[missionId];
  if (!req) return [];
  return req.required.filter((r) => !has(r.capability));
}
