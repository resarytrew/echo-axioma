import { motion } from "framer-motion";
import { MISSION_REQUIREMENTS, ToolRequirement } from "../../game/requirements";
import { CharacterPortrait } from "../ui/CharacterPortrait";
import { Button } from "../ui/Button";

/**
 * Экран инструментов миссии. Игрок всегда может осмотреть задачу,
 * но недостающие инструменты ЭХО предлагает изучить — и вернуться сюда,
 * не теряя схему и результаты экспериментов.
 */
export function ToolGate({
  missionId,
  has,
  onStudy,
  onProceed,
  onExit,
  draftNote,
}: {
  missionId: string;
  has: (capId: string) => boolean;
  onStudy: (moduleId: string) => void;
  onProceed: () => void;
  onExit: () => void;
  draftNote?: string;
}) {
  const req = MISSION_REQUIREMENTS[missionId];
  if (!req) {
    onProceed();
    return null;
  }
  const missing = req.required.filter((r) => !has(r.capability));
  const ready = missing.length === 0;

  return (
    <div className="mission-gate exo-interior"><div className="mission-gate-content mx-auto w-full max-w-3xl px-4 py-10">
      <div className="panel-glass rounded-2xl p-7">
        <div className="flex items-start gap-5">
          <CharacterPortrait id="echo" size="md" />
          <div className="flex-1">
            <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-sky-600">
              ЭХО · инвентарь инструментов миссии
            </div>
            <h3 className="mt-1 font-head text-xl font-bold text-slate-800">{req.title}</h3>
            <p className="mt-2 text-sm text-slate-500">
              {ready
                ? "Все необходимые инструменты доступны. Можно приступать к инженерной работе."
                : "Задачу можно осмотреть прямо сейчас, но для построения решения мне не хватает математических инструментов."}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-2.5">
          {req.required.map((r) => (
            <ToolRow key={r.capability} r={r} owned={has(r.capability)} onStudy={() => onStudy(r.moduleId)} />
          ))}
          {req.optional.map((r) => (
            <ToolRow key={r.capability} r={r} owned={has(r.capability)} optional onStudy={() => onStudy(r.moduleId)} />
          ))}
        </div>

        {draftNote && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 font-mono text-xs text-amber-800">
            {draftNote}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={onExit}>
            ← Вернуться на станцию
          </Button>
          {!ready && (
            <Button variant="outline" onClick={onProceed}>
              Осмотреть задачу без инструментов
            </Button>
          )}
          <Button onClick={onProceed} disabled={false}>
            {ready ? "Открыть инженерный терминал" : "Продолжить осмотр"}
          </Button>
        </div>
      </div>
    </div></div>
  );
}

function ToolRow({
  r,
  owned,
  optional,
  onStudy,
}: {
  r: ToolRequirement;
  owned: boolean;
  optional?: boolean;
  onStudy: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      className={`tool-row flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3 ${
        owned ? "border-emerald-200 bg-emerald-50/60" : optional ? "border-slate-200 bg-white" : "border-amber-200 bg-amber-50/60"
      }`}
    >
      <span className={`font-mono text-sm ${owned ? "text-emerald-600" : "text-amber-500"}`}>
        {owned ? "✓" : optional ? "○" : "!"}
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-head text-sm font-semibold text-slate-800">
          {r.moduleTitle}
          {optional && <span className="ml-2 font-mono text-[10px] text-slate-400">ДОПОЛНИТЕЛЬНО</span>}
        </div>
        <div className="text-xs text-slate-500">
          {r.grants} → <span className="text-slate-600">{r.usedFor}</span>
        </div>
      </div>
      {owned ? (
        <span className="rounded-full border border-emerald-300 bg-white px-3 py-1 font-mono text-[10px] tracking-widest text-emerald-700">
          {r.capability}
        </span>
      ) : (
        <button
          onClick={onStudy}
          className="rounded-lg bg-sky-500 px-3.5 py-1.5 font-mono text-[11px] font-bold text-white shadow-sm transition hover:bg-sky-400"
        >
          ИЗУЧИТЬ →
        </button>
      )}
    </motion.div>
  );
}
