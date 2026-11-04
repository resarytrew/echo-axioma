import { Scene, MiniLabItem } from "../types/scenario";
import { AxiomSceneSpec } from "../axiom/AxiomView";
import { RunnerTest } from "../runner/vectorRunner";

export interface SeeSlider {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
}

export interface SeeGoal {
  /** что требуется получить, человеческим языком */
  task: string;
  /** проверка выполнения по текущим параметрам */
  check: (p: Record<string, number>) => boolean;
  /**
   * Проверка по истории исследования: получает все состояния параметров,
   * которые игрок успел посетить. Нужна для заданий вида
   * «переберите все режимы», которые нельзя засчитать по одному кадру.
   */
  checkHistory?: (history: Record<string, number>[]) => boolean;
  /** подсказка о «расстоянии» до цели */
  progress?: (p: Record<string, number>, history: Record<string, number>[]) => string;
  done: string;
}

/** Анимированное объяснение, отрендеренное в Arhimed Studio (ManimGX) */
export interface AnimationLesson {
  id: string;
  title: string;
  mp4: string;
  poster?: string;
  captions?: string;
  durationSeconds?: number;
  sourceFile?: string;
  /** Текстовая альтернатива: доступность и работа без видео */
  transcript?: string[];
}

export interface SeeReflection {
  question: string;
  options: { id: string; label: string }[];
  correctId: string;
  incorrectFeedback: string;
  correctFeedback: string;
}

export interface SeeSpec {
  title: string;
  description: string;
  animation?: AnimationLesson;
  sliders?: SeeSlider[];
  build: (p: Record<string, number>) => AxiomSceneSpec;
  note?: (p: Record<string, number>) => string;
  goal?: SeeGoal;
  /** Проверка осмысленного вывода после эксперимента; простого движения ползунка недостаточно. */
  reflection?: SeeReflection;
}

export interface CodeTask {
  title: string;
  brief: string;
  starter: string;
  tests: RunnerTest[];
  /** Имя функции, экспортируемой из ученического решения для изолированной проверки. */
  entrypoint?: string;
  hint?: string;
}

export interface ResultSpec {
  title: string;
  body: string[];
  capability: string;
}

export interface ModuleSpec {
  id: string;
  act: number;
  index: number;
  title: string;
  summary: string;
  playable: boolean;
  trainLab?: boolean;
  understand?: Scene[];
  see?: SeeSpec;
  hands?: MiniLabItem[];
  code?: CodeTask;
  result?: ResultSpec;
}

export interface ActInfo {
  id: number;
  roman: string;
  title: string;
  subtitle: string;
  modules: number;
  color: string;
}
