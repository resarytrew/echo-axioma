import { motion, AnimatePresence } from "framer-motion";

export interface HUDState {
  knowledge: number;
  concepts: number;
  autonomy: string;
  capabilities: string[];
  moduleTitle: string;
  moduleIndex: number;
  totalModules: number;
  sceneIndex: number;
  totalScenes: number;
}

export function HUD({ state }: { state: HUDState }) {
  return (
    <div className="panel-glass sticky top-0 z-30 flex w-full items-center gap-4 border-b px-4 py-3 sm:px-8">
      <div className="flex items-center gap-3">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-sky-300 bg-sky-50">
          <span className="font-display text-xs font-bold text-sky-700">Э</span>
          <span className="absolute -right-1 -top-1 h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
        </div>
        <div className="hidden leading-tight sm:block">
          <div className="font-display text-xs tracking-[0.2em] text-slate-400">AXIOMA · AI CORE</div>
          <div className="font-head text-sm font-semibold text-slate-800">ЭХО</div>
        </div>
      </div>

      <div className="mx-2 hidden h-8 w-px bg-slate-200 md:block" />

      <div className="hidden flex-1 items-center gap-6 md:flex">
        <Metric label="KNOWLEDGE" value={`${Math.round(state.knowledge)}%`}>
          <div className="mt-1 h-1.5 w-28 overflow-hidden rounded-full bg-slate-200">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-500"
              animate={{ width: `${state.knowledge}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </Metric>
        <Metric label="CONCEPTS" value={String(state.concepts)} />
        <Metric label="AUTONOMY" value={state.autonomy} mono />
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] tracking-widest text-slate-400">CAPABILITIES</span>
          <div className="flex gap-1">
            <AnimatePresence>
              {state.capabilities.map((c) => (
                <motion.span
                  key={c}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  title={c}
                  className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow shadow-emerald-300"
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="text-right leading-tight">
          <div className="font-mono text-[10px] tracking-widest text-slate-400">
            МОДУЛЬ {state.moduleIndex}/{state.totalModules}
          </div>
          <div className="font-head text-xs font-medium text-slate-700">{state.moduleTitle}</div>
        </div>
        <div className="hidden h-8 items-center gap-1 sm:flex">
          {Array.from({ length: state.totalScenes }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i < state.sceneIndex
                  ? "w-3 bg-sky-500"
                  : i === state.sceneIndex
                    ? "w-5 bg-cyan-400"
                    : "w-1.5 bg-slate-200"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  mono,
  children,
}: {
  label: string;
  value: string;
  mono?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="leading-tight">
      <div className="font-mono text-[10px] tracking-widest text-slate-400">{label}</div>
      <div className={`text-sm font-semibold text-slate-800 ${mono ? "font-mono" : "font-head"}`}>
        {value}
      </div>
      {children}
    </div>
  );
}
