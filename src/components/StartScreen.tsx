import { motion } from "framer-motion";
import { Button } from "./ui/Button";
import { CharacterPortrait } from "./ui/CharacterPortrait";

export function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(14,165,233,0.14),transparent_55%)]" />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 font-mono text-xs uppercase tracking-[0.5em] text-sky-600"
      >
        AXIOMA · AI TRAINING PROGRAM
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="font-display text-7xl font-black tracking-tight text-slate-800 sm:text-8xl"
      >
        ЭХО
      </motion.h1>
      <p className="mt-4 max-w-xl text-center font-head text-lg text-slate-500">
        Интерактивный тренажёр создания искусственного интеллекта с нуля —
        от первого сигнала датчика до автономного бортового разума корабля «Аксиома».
      </p>

      <div className="mt-12 flex items-center gap-4 sm:gap-6">
        {(["zara", "echo", "bit", "ada", "shumma"] as const).map((c, i) => (
          <motion.div
            key={c}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
          >
            <CharacterPortrait id={c} size={c === "echo" ? "lg" : "md"} />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-12 w-full max-w-md rounded-2xl border border-slate-200 bg-white/70 px-6 py-5 text-left shadow-sm"
      >
        <div className="font-mono text-[11px] uppercase tracking-widest text-slate-400">
          ACT I · КАК МАШИНА ПОНИМАЕТ МИР
        </div>
        <div className="mt-1 font-head text-sm text-slate-600">
          Модуль 1 · Данные &nbsp;→&nbsp; Модуль 2 · Информация &nbsp;→&nbsp; Модуль 3 · Знания
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-10"
      >
        <Button size="lg" onClick={onStart}>
          Войти в систему «Аксиома»
        </Button>
      </motion.div>
    </div>
  );
}
