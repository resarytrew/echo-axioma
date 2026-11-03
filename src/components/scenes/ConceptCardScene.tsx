import { motion } from "framer-motion";
import { ConceptCardScene as ConceptCardType } from "../../types/scenario";
import { Button } from "../ui/Button";

export function ConceptCardScene({
  scene,
  onDone,
}: {
  scene: ConceptCardType;
  onDone: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-8 px-4 py-14">
      <motion.div
        initial={{ opacity: 0, y: 20, rotateX: -12 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full overflow-hidden rounded-3xl border border-sky-200 bg-gradient-to-b from-white to-sky-50/60 px-8 py-10 text-center shadow-xl shadow-sky-900/10"
      >
        <div className="pointer-events-none absolute -top-16 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="relative font-mono text-xs uppercase tracking-[0.4em] text-sky-500">
          Новый узел знаний
        </div>
        <div className="relative mt-3 font-display text-4xl font-black tracking-tight text-slate-800 sm:text-5xl">
          {scene.term}
        </div>
        <div className="relative mt-1 font-head text-lg text-slate-400">· {scene.termRu} ·</div>

        <div className="relative mx-auto mt-6 max-w-lg font-head text-lg leading-relaxed text-slate-700">
          {scene.definition}
        </div>

        {scene.simple && (
          <div className="relative mx-auto mt-4 max-w-lg rounded-xl bg-white/70 px-4 py-3 font-mono text-sm text-slate-500">
            Проще: {scene.simple}
          </div>
        )}

        {scene.extra && scene.extra.length > 0 && (
          <div className="relative mx-auto mt-5 max-w-lg space-y-1.5 text-left">
            {scene.extra.map((e, i) => (
              <div key={i} className="font-mono text-sm text-slate-500">
                › {e}
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <Button size="lg" onClick={onDone}>
        Зафиксировать в базе знаний ЭХО
      </Button>
    </div>
  );
}
