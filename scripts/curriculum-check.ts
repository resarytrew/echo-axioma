import { MODULES_50 } from "../src/modules/registry";
const rows = MODULES_50.filter(m => m.playable).map(m => ({
  id: m.id, title: m.title,
  understand: !!m.understand?.length, see: !!m.see,
  hands: !!m.hands?.length, code: !!m.code, result: !!(m.result || m.trainLab),
}));
let incomplete = 0;
for (const r of rows) {
  const miss = Object.entries(r).filter(([k,v]) => typeof v === "boolean" && !v).map(([k]) => k);
  if (miss.length) { incomplete++; console.log(r.id.padEnd(8), r.title.padEnd(32), "НЕТ:", miss.join(", ")); }
}
console.log(`\nвсего играбельных: ${rows.length}, неполных: ${incomplete}`);
