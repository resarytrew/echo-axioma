import { motion } from "framer-motion";
import { Button } from "./ui/Button";

export function FinalScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-950 px-8 py-10 text-left shadow-2xl shadow-sky-900/20"
      >
        <div className="mb-4 font-mono text-[11px] tracking-[0.3em] text-slate-500">ECHO STATUS</div>
        <div className="space-y-2 font-mono text-sm text-sky-300">
          <div className="flex justify-between">
            <span>INPUT PERCEPTION</span>
            <span className="text-emerald-400">ONLINE</span>
          </div>
          <div className="flex justify-between">
            <span>INFORMATION EXTRACTION</span>
            <span className="text-emerald-400">ONLINE</span>
          </div>
          <div className="flex justify-between">
            <span>KNOWLEDGE REPRESENTATION</span>
            <span className="text-emerald-400">ONLINE</span>
          </div>
          <motion.div
            animate={{ opacity: [1, 0.25, 1] }}
            transition={{ repeat: Infinity, duration: 1.4 }}
            className="flex justify-between border-t border-slate-800 pt-2"
          >
            <span>LEARNING ENGINE</span>
            <span className="text-amber-400">LOCKED</span>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12"
      >
        <div className="font-mono text-xs uppercase tracking-[0.5em] text-sky-600">Next act</div>
        <h2 className="mt-3 font-display text-4xl font-black tracking-tight text-slate-800 sm:text-5xl">
          МАТЕМАТИЧЕСКИЙ ЯЗЫК ЭХО
        </h2>
        <p className="mx-auto mt-5 max-w-lg font-head text-lg italic text-slate-600">
          «Как превратить мир в числа, с которыми модель сможет учиться?»
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-10 flex flex-col items-center gap-4"
      >
        <div className="rounded-full border border-sky-200 bg-sky-50 px-6 py-2 font-mono text-xs tracking-widest text-sky-600">
          ПРОЛОГ ЗАВЕРШЁН · ДАЛЕЕ: 6 АКТОВ · 50 МОДУЛЕЙ
        </div>
        <Button size="lg" onClick={onContinue}>
          ПЕРЕЙТИ К МАТЕМАТИЧЕСКОМУ ЯЗЫКУ ЭХО
        </Button>
      </motion.div>
    </div>
  );
}
