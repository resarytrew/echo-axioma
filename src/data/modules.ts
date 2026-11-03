import { Module } from "../types/scenario";
import { module1Scenes } from "./module1";
import { module2Scenes } from "./module2";
import { module3Scenes } from "./module3";

export const MODULES: Module[] = [
  {
    id: "module-1",
    index: 1,
    title: "ДАННЫЕ",
    subtitle: "Что именно получает искусственный интеллект из реального мира?",
    question: "Что именно получает искусственный интеллект из реального мира?",
    capability: "INPUT PERCEPTION",
    scenes: module1Scenes,
  },
  {
    id: "module-2",
    index: 2,
    title: "ИНФОРМАЦИЯ",
    subtitle: "Когда данные начинают что-то означать — и можно ли измерить количество информации?",
    question: "Когда данные начинают что-то означать?",
    capability: "INFORMATION EXTRACTION",
    scenes: module2Scenes,
  },
  {
    id: "module-3",
    index: 3,
    title: "ЗНАНИЯ",
    subtitle: "Как ИИ хранит смысл, связи и правила — и как использует их для вывода?",
    question: "Как ИИ хранит смысл, связи и правила?",
    capability: "KNOWLEDGE REPRESENTATION",
    scenes: module3Scenes,
  },
];

export const TOTAL_CONCEPTS = MODULES.reduce(
  (sum, m) => sum + m.scenes.filter((s) => s.type === "conceptCard").length,
  0,
);
