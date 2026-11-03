import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import { MODULES, TOTAL_CONCEPTS } from "./data/modules";
import { SceneEngine } from "./components/SceneEngine";
import { HUD } from "./components/ui/HUD";
import { ModuleIntro } from "./components/ModuleIntro";
import { FinalScreen } from "./components/FinalScreen";
import { ModuleMap } from "./components/map/ModuleMap";
import { ModulePlayer } from "./components/module/ModulePlayer";
import { TrainLab } from "./components/train/TrainLab";
import { MODULES_50 } from "./modules/registry";
import { ModuleSpec } from "./modules/types";
import { StationMap } from "./components/station/StationMap";
import { FalseAlarmMission } from "./components/mission/FalseAlarmMission";
import { DroneMission } from "./components/mission/DroneMission";
import { ToolGate } from "./components/mission/ToolGate";
import { MainMenu } from "./components/MainMenu";
import { Sector } from "./game/station";


import {
  GameProgress,
  applyOnce,
  completedModuleIds,
  emptyProgress,
  grantCapability,
  hasCapability,
  installAlgorithm,
  loadProgress,
  lessonOf,
  markLesson,
  markPhaseDone,
  resetProgress,
  saveProgress,
  setDraft,
} from "./game/progress";
import { missingRequirements } from "./game/requirements";

type Screen =
  | "menu"
  | "prologueIntro"
  | "prologue"
  | "prologueEnd"
  | "academy"
  | "module"
  | "station"
  | "missionGate"
  | "mission"
  | "droneMission"
  | "lab";

const AUTONOMY_LABELS = ["OFFLINE", "CALIBRATING", "ANALYZING", "STRUCTURING"];

export default function App() {
  const [progress, setProgress] = useState<GameProgress>(loadProgress);
  const [screen, setScreen] = useState<Screen>("menu");
  const [activeSpec, setActiveSpec] = useState<ModuleSpec | null>(null);
  const [pendingMission, setPendingMission] = useState<string | null>(null);
  /** куда вернуться после учебного модуля, открытого из миссии */
  const [returnTo, setReturnTo] = useState<{ screen: Screen; missionId?: string } | null>(null);

  /** Чистое обновление состояния: без побочных эффектов внутри редьюсера */
  const update = useCallback((fn: (p: GameProgress) => GameProgress) => {
    setProgress((prev) => fn(prev));
  }, []);

  /** Единственное место записи на диск — эффект после коммита */
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    saveProgress(progress);
  }, [progress]);

  const go = useCallback(
    (s: Screen, extra?: Partial<GameProgress["location"]>) => {
      setScreen(s);
      update((p) => ({ ...p, location: { screen: s, ...extra } }));
    },
    [update],
  );

  const has = useCallback((capId: string) => hasCapability(progress, capId), [progress]);
  const completed = useMemo(() => completedModuleIds(progress), [progress]);
  const hasSave =
    progress.capabilities.length > 0 ||
    completed.size > 0 ||
    progress.prologue.sceneIdx > 0 ||
    progress.prologue.finished;

  /* ── пролог Академии ───────────────────────────────────────── */
  const prologueModule = MODULES[progress.prologue.moduleIdx];
  const prologueScene = prologueModule?.scenes[progress.prologue.sceneIdx];
  const knowledge = Math.min(100, (progress.prologue.concepts.length / TOTAL_CONCEPTS) * 100);

  function advancePrologue(payload?: { conceptId?: string; capability?: string }) {
    // Переход вычисляем заранее — редьюсер остаётся чистым
    const cur = progress.prologue;
    const mod = MODULES[cur.moduleIdx];
    const nextScene = cur.sceneIdx + 1;
    const moreScenes = nextScene < mod.scenes.length;
    const nextMod = cur.moduleIdx + 1;
    const moreModules = nextMod < MODULES.length;

    update((p) => {
      let next = p;
      if (payload?.conceptId && !p.prologue.concepts.includes(payload.conceptId)) {
        next = { ...next, prologue: { ...next.prologue, concepts: [...next.prologue.concepts, payload.conceptId] } };
      }
      if (payload?.capability) {
        next = grantCapability(next, payload.capability, payload.capability, "verified", "Пролог Академии");
      }
      if (moreScenes) {
        return { ...next, prologue: { ...next.prologue, sceneIdx: nextScene }, location: { screen: "prologue" } };
      }
      if (moreModules) {
        return {
          ...next,
          prologue: { ...next.prologue, moduleIdx: nextMod, sceneIdx: 0 },
          location: { screen: "prologueIntro" },
        };
      }
      return { ...next, prologue: { ...next.prologue, finished: true }, location: { screen: "prologueEnd" } };
    });

    if (!moreScenes) setScreen(moreModules ? "prologueIntro" : "prologueEnd");
  }

  /* ── завершение учебного модуля Академии ───────────────────── */
  function completeModule(spec: ModuleSpec) {
    update((p) => {
      const lesson = lessonOf(p, spec.id);
      let next = markLesson(p, spec.id, { completed: true, phaseIndex: 0 });
      if (spec.result?.capability) {
        // «Проверено» только при фактически пройденных автотестах кода
        const state = lesson.codePassed ? "verified" : "learned";
        next = grantCapability(next, spec.result.capability, spec.result.capability, state, `Модуль ${spec.title}`);
      }
      return next;
    });
    if (returnTo) {
      const dest = returnTo;
      setReturnTo(null);
      if (dest.missionId) {
        setPendingMission(dest.missionId);
        go("missionGate", { missionId: dest.missionId });
      } else go(dest.screen);
    } else {
      go("academy");
    }
  }

  /** открыть учебный модуль из миссии и вернуться обратно */
  function studyFromMission(moduleId: string, missionId: string) {
    const spec = MODULES_50.find((m) => m.id === moduleId);
    if (!spec || !spec.playable) return;
    setReturnTo({ screen: "missionGate", missionId });
    setActiveSpec(spec);
    go("module", { moduleId });
  }

  function openSector(s: Sector) {
    const missionBySector: Record<string, string> = { sensor: "false-alarm", nav: "drone-route" };
    const missionId = missionBySector[s.id];
    if (!missionId || s.state === "isolated") return;
    setPendingMission(missionId);
    go("missionGate", { missionId });
  }

  const hudState = {
    knowledge,
    concepts: progress.prologue.concepts.length,
    autonomy: AUTONOMY_LABELS[Math.min(3, progress.capabilities.length)] ?? "STRUCTURING",
    capabilities: progress.capabilities.map((c) => c.id),
    moduleTitle: prologueModule?.title ?? "",
    moduleIndex: prologueModule?.index ?? 1,
    totalModules: MODULES.length,
    sceneIndex: progress.prologue.sceneIdx,
    totalScenes: prologueModule?.scenes.length ?? 1,
  };

  const droneDraft = progress.drafts["drone-route"]?.route?.steps;
  const circuitDraft = progress.drafts["false-alarm"]?.circuit;

  return (
    <MotionConfig reducedMotion="user"><Shell>
      <AnimatePresence mode="wait">
        {screen === "menu" && (
          <Fade key="menu">
            <MainMenu
              progress={progress}
              hasSave={hasSave}
              onContinue={() => {
                const loc = progress.location.screen as Screen;
                if (loc === "module" && progress.location.moduleId) {
                  const spec = MODULES_50.find((m) => m.id === progress.location.moduleId);
                  if (spec) setActiveSpec(spec);
                }
                if (loc === "missionGate" || loc === "mission" || loc === "droneMission") {
                  setPendingMission(progress.location.missionId ?? null);
                }
                setScreen(loc && loc !== "menu" ? loc : "station");
              }}
              onCampaign={() => go("station")}
              onAcademy={() => go(progress.prologue.finished ? "academy" : "prologueIntro")}
              onLab={() => go("lab")}
              onReset={() => {
                resetProgress();
                setProgress(emptyProgress());
                setScreen("menu");
              }}
            />
          </Fade>
        )}

        {(screen === "prologueIntro" || screen === "prologue") && prologueModule && (
          <Fade key="prologue" className="exo-interior game-screen prologue-screen">
            <HUD state={hudState} />
            {screen === "prologueIntro" ? (
              <ModuleIntro module={prologueModule} onBegin={() => go("prologue")} />
            ) : (
              <motion.div
                key={prologueScene.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <SceneEngine scene={prologueScene} onAdvance={advancePrologue} />
              </motion.div>
            )}
          </Fade>
        )}

        {screen === "prologueEnd" && (
          <Fade key="prologueEnd" className="exo-interior game-screen prologueEnd-screen">
            <FinalScreen onContinue={() => go("academy")} />
          </Fade>
        )}

        {screen === "academy" && (
          <Fade key="academy" className="exo-interior game-screen academy-screen">
            <ModuleMap
              completed={completed}
              onStation={() => go("station")}
              onMenu={() => go("menu")}
              onOpen={(m) => {
                setActiveSpec(m);
                go("module", { moduleId: m.id });
              }}
            />
          </Fade>
        )}

        {screen === "module" && activeSpec && (
          <Fade key={"mod-" + activeSpec.id}>
            <ModulePlayer
              module={activeSpec}
              initialPhase={lessonOf(progress, activeSpec.id).phaseIndex ?? 0}
              onPhaseChange={(i) => update((p) => markLesson(p, activeSpec.id, { phaseIndex: i }))}
              onPhaseDone={(phase, extra) =>
                update((p) => markPhaseDone(p, activeSpec.id, phase, extra))
              }
              result={activeSpec.trainLab ? (finish) => <TrainLab onDone={finish} /> : undefined}
              onComplete={() => completeModule(activeSpec)}
              onExit={() => (returnTo ? (setReturnTo(null), go("station")) : go("academy"))}
            />
          </Fade>
        )}

        {screen === "station" && (
          <Fade key="station">
            <StationMap
              sectors={progress.sectors}
              resources={progress.resources}
              capabilities={progress.capabilities}
              installed={progress.installedAlgorithms}
              onSector={openSector}
              onBack={() => go("menu")}
              onAcademy={() => go("academy")}
            />
          </Fade>
        )}

        {screen === "missionGate" && pendingMission && (
          <Fade key={"gate-" + pendingMission}>
            <ToolGate
              missionId={pendingMission}
              has={has}
              draftNote={
                pendingMission === "drone-route" && droneDraft?.length
                  ? `Черновик маршрута сохранён: ${droneDraft.length} шаг(ов). Он будет восстановлен.`
                  : pendingMission === "false-alarm" && circuitDraft
                    ? `Схема сохранена: agg=${circuitDraft.agg}, rule=${circuitDraft.rule}. Она будет восстановлена.`
                    : undefined
              }
              onStudy={(moduleId) => studyFromMission(moduleId, pendingMission)}
              onExit={() => go("station")}
              onProceed={() => go(pendingMission === "drone-route" ? "droneMission" : "mission", { missionId: pendingMission })}
            />
          </Fade>
        )}

        {screen === "mission" && (
          <Fade key="mission" className="exo-interior game-screen mission-screen">
            <FalseAlarmMission
              has={has}
              initialCircuit={circuitDraft}
              initialStage={progress.drafts["false-alarm"]?.stage}
              revisit={!!progress.drafts["false-alarm"]?.done}
              onStage={(stage) => update((p) => setDraft(p, { missionId: "false-alarm", stage }))}
              onDraft={(c) => update((p) => setDraft(p, { missionId: "false-alarm", circuit: c }))}
              wastedOxygen={!!progress.appliedEffects["mission:false-alarm:oxygen-spent"]}
              onWasteOxygen={() =>
                update((p) =>
                  applyOnce(p, "mission:false-alarm:oxygen-spent", (q) => ({
                    ...q,
                    resources: { ...q.resources, energy: Math.max(0, q.resources.energy - 20) },
                  })),
                )
              }
              onExit={() => go("station")}
              onComplete={(circuit) => {
                update((p) => {
                  let next = applyOnce(p, "mission:false-alarm:complete", (q) => ({
                    ...q,
                    sectors: q.sectors.map((s) =>
                      s.id === "sensor" ? { ...s, state: "restored" as const, alert: undefined } : s,
                    ),
                    resources: {
                      ...q.resources,
                      tech: Math.min(100, q.resources.tech + 9),
                      compute: Math.max(0, q.resources.compute - 3),
                    },
                  }));
                  next = installAlgorithm(next, {
                    id: "o2-guard",
                    missionId: "false-alarm",
                    kind: "circuit",
                    configuration: circuit,
                    tested: true,
                  });
                  next = grantCapability(
                    next,
                    "AUTONOMOUS OXYGEN WATCH",
                    "Автономный контроль O₂",
                    "deployed",
                    "Миссия «Ложная тревога»",
                  );
                  next = setDraft(next, { missionId: "false-alarm", circuit, stage: "deploy", done: true });
                  return next;
                });
                go("station");
              }}
            />
          </Fade>
        )}

        {screen === "droneMission" && (
          <Fade key="droneMission" className="exo-interior game-screen droneMission-screen">
            <DroneMission
              initialRoute={droneDraft}
              initialStage={progress.drafts["drone-route"]?.stage}
              revisit={!!progress.drafts["drone-route"]?.done}
              onStage={(stage) => update((p) => setDraft(p, { missionId: "drone-route", stage }))}
              toolsReady={missingRequirements("drone-route", has).length === 0}
              onDraft={(steps) => update((p) => setDraft(p, { missionId: "drone-route", route: { steps } }))}
              onExit={() => go("station")}
              onComplete={(steps, length) => {
                update((p) => {
                  let next = applyOnce(p, "mission:drone-route:complete", (q) => ({
                    ...q,
                    sectors: q.sectors.map((s) => (s.id === "nav" ? { ...s, state: "restored" as const } : s)),
                    resources: {
                      ...q.resources,
                      tech: Math.min(100, q.resources.tech + 8),
                      energy: Math.max(0, q.resources.energy - Math.round(length / 4)),
                    },
                  }));
                  next = installAlgorithm(next, {
                    id: "drone-route-d",
                    missionId: "drone-route",
                    kind: "route",
                    configuration: { steps },
                    tested: true,
                    metrics: { length: Number(length.toFixed(2)), steps: steps.length },
                  });
                  next = grantCapability(
                    next,
                    "TRAJECTORY PLANNING",
                    "Планирование траекторий",
                    "deployed",
                    "Миссия «Маршрут дрона»",
                  );
                  next = setDraft(next, { missionId: "drone-route", route: { steps }, stage: "deploy", done: true });
                  return next;
                });
                go("station");
              }}
            />
          </Fade>
        )}

        {screen === "lab" && (
          <Fade key="lab" className="exo-interior game-screen lab-screen">
            <div className="mx-auto max-w-6xl px-4 pt-6">
              <button
                onClick={() => go("menu")}
                className="font-mono text-xs text-slate-400 transition hover:text-sky-600"
              >
                ← главное меню
              </button>
            </div>
            <TrainLab onDone={() => go("menu")} />
          </Fade>
        )}
      </AnimatePresence>
    </Shell></MotionConfig>
  );
}

function Fade({ children, className }: { children: React.ReactNode; key?: string; className?: string }) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div className={className} initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
      {children}
    </motion.div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <div className="axioma-grid" />
      <div className="noise-veil" />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-20 h-[2px] bg-gradient-to-r from-transparent via-sky-400/70 to-transparent" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
