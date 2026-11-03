/**
 * Единое сохранение «ЭХО · Протокол Аксиома».
 * Версионировано, с миграцией. Объединяет учебный прогресс Академии,
 * реестр способностей и состояние игрового мира кампании.
 */
import { Circuit } from "./circuit";
import { Colony, INITIAL_RESOURCES, INITIAL_SECTORS, Sector } from "./station";

export const SAVE_VERSION = 3;
const SAVE_KEY = "echo-save-v3";
const LEGACY_MODULES = "echo-progress-v2";
const LEGACY_WORLD = "echo-world-v1";

/** Три состояния способности: изучено → проверено → внедрено */
export type CapabilityState = "learned" | "verified" | "deployed";

export interface CapabilityRecord {
  id: string;
  title: string;
  state: CapabilityState;
  /** Откуда получена: учебный модуль или миссия */
  source: string;
  at: string;
}

export interface LessonProgress {
  moduleId: string;
  phasesDone: string[];
  /** текущая фаза для возобновления */
  phaseIndex?: number;
  handsFirstTry?: number; // доля верных с первой попытки
  codePassed?: boolean;
  seeGoalMet?: boolean;
  completed: boolean;
}

export interface DroneRoute {
  steps: { x: number; y: number }[];
}

export interface InstalledAlgorithm {
  id: string;
  missionId: string;
  version: number;
  kind: "circuit" | "route";
  configuration: Circuit | DroneRoute;
  tested: boolean;
  installedAt: string;
  metrics?: Record<string, number>;
}

export interface MissionDraft {
  missionId: string;
  circuit?: Circuit;
  route?: DroneRoute;
  /** этап миссии: intro / journal / lab / deploy */
  stage?: string;
  /** завершена ли миссия (для режима модернизации) */
  done?: boolean;
}

export interface UiLocation {
  screen: string;
  moduleId?: string;
  phaseIndex?: number;
  missionId?: string;
}

export interface GameProgress {
  version: number;
  location: UiLocation;
  /** пролог Академии */
  prologue: { moduleIdx: number; sceneIdx: number; concepts: string[]; finished: boolean };
  educationalProgress: Record<string, LessonProgress>;
  capabilities: CapabilityRecord[];
  installedAlgorithms: InstalledAlgorithm[];
  /** однократно применённые последствия: ключ → true */
  appliedEffects: Record<string, boolean>;
  drafts: Record<string, MissionDraft>;
  sectors: Sector[];
  resources: Colony;
}

export function emptyProgress(): GameProgress {
  return {
    version: SAVE_VERSION,
    location: { screen: "menu" },
    prologue: { moduleIdx: 0, sceneIdx: 0, concepts: [], finished: false },
    educationalProgress: {},
    capabilities: [],
    installedAlgorithms: [],
    appliedEffects: {},
    drafts: {},
    sectors: INITIAL_SECTORS,
    resources: INITIAL_RESOURCES,
  };
}

/** Миграция старых ключей v1/v2 → v3 */
function migrateLegacy(base: GameProgress): GameProgress {
  let touched = false;
  try {
    const rawModules = localStorage.getItem(LEGACY_MODULES);
    if (rawModules) {
      const ids = JSON.parse(rawModules) as string[];
      for (const id of ids) {
        base.educationalProgress[id] = {
          moduleId: id,
          phasesDone: [],
          completed: true,
        };
      }
      touched = true;
    }
    const rawWorld = localStorage.getItem(LEGACY_WORLD);
    if (rawWorld) {
      const w = JSON.parse(rawWorld) as {
        sectors?: Sector[];
        resources?: Colony;
        stationCapabilities?: string[];
        wastedOxygen?: boolean;
      };
      if (w.sectors) base.sectors = w.sectors;
      if (w.resources) base.resources = w.resources;
      for (const c of w.stationCapabilities ?? []) {
        base.capabilities.push({
          id: c,
          title: c,
          state: "deployed",
          source: "legacy",
          at: new Date().toISOString(),
        });
      }
      if (w.wastedOxygen) base.appliedEffects["mission:false-alarm:oxygen-spent"] = true;
      touched = true;
    }
  } catch {
    /* ignore */
  }
  if (touched) saveProgress(base);
  return base;
}

export function loadProgress(): GameProgress {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as GameProgress;
      if (parsed.version === SAVE_VERSION) return { ...emptyProgress(), ...parsed };
      // будущие миграции между версиями v3+
      return { ...emptyProgress(), ...parsed, version: SAVE_VERSION };
    }
  } catch {
    /* ignore */
  }
  return migrateLegacy(emptyProgress());
}

export function saveProgress(p: GameProgress) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export function resetProgress() {
  try {
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(LEGACY_MODULES);
    localStorage.removeItem(LEGACY_WORLD);
  } catch {
    /* ignore */
  }
}

/* ── операции над прогрессом (чистые) ───────────────────────────── */

const STATE_RANK: Record<CapabilityState, number> = { learned: 1, verified: 2, deployed: 3 };

export function grantCapability(
  p: GameProgress,
  id: string,
  title: string,
  state: CapabilityState,
  source: string,
): GameProgress {
  const existing = p.capabilities.find((c) => c.id === id);
  if (existing) {
    if (STATE_RANK[state] <= STATE_RANK[existing.state]) return p;
    return {
      ...p,
      capabilities: p.capabilities.map((c) =>
        c.id === id ? { ...c, state, source, at: new Date().toISOString() } : c,
      ),
    };
  }
  return {
    ...p,
    capabilities: [
      ...p.capabilities,
      { id, title, state, source, at: new Date().toISOString() },
    ],
  };
}

export function hasCapability(p: GameProgress, id: string, min: CapabilityState = "learned"): boolean {
  const c = p.capabilities.find((x) => x.id === id);
  return !!c && STATE_RANK[c.state] >= STATE_RANK[min];
}

/** Однократное применение последствия (ресурсы, награды, установка) */
export function applyOnce(p: GameProgress, key: string, fn: (p: GameProgress) => GameProgress): GameProgress {
  if (p.appliedEffects[key]) return p;
  const next = fn(p);
  return { ...next, appliedEffects: { ...next.appliedEffects, [key]: true } };
}

export function installAlgorithm(p: GameProgress, algo: Omit<InstalledAlgorithm, "version" | "installedAt">): GameProgress {
  const prev = p.installedAlgorithms.filter((a) => a.id === algo.id);
  const version = prev.length ? Math.max(...prev.map((a) => a.version)) + 1 : 1;
  const rest = p.installedAlgorithms.filter((a) => a.id !== algo.id);
  return {
    ...p,
    installedAlgorithms: [
      ...rest,
      { ...algo, version, installedAt: new Date().toISOString() },
    ],
  };
}

export function setDraft(p: GameProgress, draft: MissionDraft): GameProgress {
  return { ...p, drafts: { ...p.drafts, [draft.missionId]: { ...p.drafts[draft.missionId], ...draft } } };
}

export function markLesson(p: GameProgress, moduleId: string, patch: Partial<LessonProgress>): GameProgress {
  const prev = p.educationalProgress[moduleId] ?? { moduleId, phasesDone: [], completed: false };
  return {
    ...p,
    educationalProgress: { ...p.educationalProgress, [moduleId]: { ...prev, ...patch } },
  };
}

/** Зафиксировать успешно пройденный этап немедленно после его выполнения */
export function markPhaseDone(
  p: GameProgress,
  moduleId: string,
  phase: string,
  extra?: Partial<LessonProgress>,
): GameProgress {
  const prev = p.educationalProgress[moduleId] ?? { moduleId, phasesDone: [], completed: false };
  const phasesDone = prev.phasesDone.includes(phase) ? prev.phasesDone : [...prev.phasesDone, phase];
  return {
    ...p,
    educationalProgress: {
      ...p.educationalProgress,
      [moduleId]: { ...prev, ...extra, phasesDone },
    },
  };
}

export function lessonOf(p: GameProgress, moduleId: string): LessonProgress {
  return p.educationalProgress[moduleId] ?? { moduleId, phasesDone: [], completed: false };
}

export function completedModuleIds(p: GameProgress): Set<string> {
  return new Set(Object.values(p.educationalProgress).filter((l) => l.completed).map((l) => l.moduleId));
}
