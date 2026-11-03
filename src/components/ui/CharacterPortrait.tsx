import { motion } from "framer-motion";
import { CharacterId } from "../../types/scenario";
import { CHARACTERS } from "../../data/characters";
import { cn } from "../../utils/cn";

export function CharacterPortrait({
  id,
  size = "md",
  glitch = false,
}: {
  id: CharacterId;
  size?: "sm" | "md" | "lg";
  glitch?: boolean;
}) {
  const c = CHARACTERS[id];
  const dims = size === "sm" ? "h-10 w-10" : size === "lg" ? "h-24 w-24" : "h-14 w-14";

  if (id === "system") {
    return (
      <div
        className={cn(
          dims,
          "flex shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-slate-100 font-mono text-slate-500",
        )}
      >
        ◆
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(
        dims,
        "relative shrink-0 overflow-hidden rounded-2xl ring-2",
        glitch && "animate-glitch",
      )}
      style={{ boxShadow: `0 8px 24px -10px ${c.color}55`, borderColor: c.color }}
    >
      <div
        className="absolute inset-0 rounded-2xl ring-2"
        style={{ boxShadow: `inset 0 0 0 2px ${c.color}aa` }}
      />
      {c.avatar ? (
        <img src={c.avatar} alt={c.name} className="h-full w-full object-cover" />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center font-display text-xl"
          style={{ background: c.accent, color: c.color }}
        >
          {c.name[0]}
        </div>
      )}
    </motion.div>
  );
}
