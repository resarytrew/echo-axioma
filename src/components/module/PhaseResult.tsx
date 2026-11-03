import { motion } from "framer-motion";
import { ResultSpec } from "../../modules/types";
import { Button } from "../ui/Button";
import { CharacterPortrait } from "../ui/CharacterPortrait";

export function PhaseResult({ result, onDone }: { result: ResultSpec; onDone: () => void }) {
  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-2xl flex-col items-center justify-center gap-8 px-4 py-14 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="animate-float-slow"
      >
        <CharacterPortrait id="echo" size="lg" />
      </motion.div>
      <div>
        <div className="font-mono text-xs uppercase tracking-[0.4em] text-emerald-600">Результат</div>
        <h3 className="mt-2 font-display text-3xl font-black tracking-tight text-slate-800 sm:text-4xl">
          {result.title}
        </h3>
      </div>
      <div className="space-y-2 font-head text-lg text-slate-600">
        {result.body.map((line, i) => (
          <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + i * 0.15 }}>
            {line}
          </motion.p>
        ))}
      </div>
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-3 font-mono text-sm tracking-widest text-emerald-700">
        CAPABILITY: {result.capability} — ONLINE
      </div>
      <Button size="lg" onClick={onDone}>
        Вернуться к карте актов
      </Button>
    </div>
  );
}
