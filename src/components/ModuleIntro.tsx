import { motion } from "framer-motion";
import { Module } from "../types/scenario";
import { Button } from "./ui/Button";

export function ModuleIntro({ module, onBegin }: { module: Module; onBegin: () => void }) {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 py-16 text-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-mono text-xs uppercase tracking-[0.5em] text-sky-600"
      >
        МОДУЛЬ {module.index} · ECHO TRAINING
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-4 font-display text-5xl font-black tracking-tight text-slate-800 sm:text-6xl"
      >
        {module.title}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mx-auto mt-6 max-w-xl font-head text-xl leading-relaxed text-slate-600"
      >
        {module.subtitle}
      </motion.p>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-10"
      >
        <Button size="lg" onClick={onBegin}>
          Начать модуль
        </Button>
      </motion.div>
    </div>
  );
}
