import { readFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = (p) => readFileSync(path.resolve(root, p), "utf8");

const cache = new Map();
function loadTs(file) {
  const full = path.resolve(root, file);
  if (cache.has(full)) return cache.get(full).exports;
  const compiled = ts.transpileModule(readFileSync(full, "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const module = { exports: {} };
  cache.set(full, module);
  const localRequire = (id) => {
    if (!id.startsWith(".")) throw new Error("Unexpected import in curriculum: " + id);
    return loadTs(path.resolve(path.dirname(full), id + ".ts"));
  };
  new Function("module", "exports", "require", compiled)(module, module.exports, localRequire);
  return module.exports;
}

const { MODULES_50 } = loadTs("src/modules/registry.ts");
const playable = MODULES_50.filter((mod) => mod.playable);

test("Все 15 учебных модулей имеют содержательную проверку понимания", () => {
  assert.equal(playable.length, 15);
  for (const mod of playable) {
    const checks = (mod.understand ?? []).filter((s) => s.type === "choice" && s.requireCorrect);
    assert.ok(checks.length >= 1 && checks.length <= 2, mod.id);
    for (const q of checks) {
      assert.ok(q.options.some((o) => o.id === q.correctId), q.id);
      assert.ok(q.correctFeedback.length > 10 && q.incorrectFeedback.length > 10, q.id);
    }
  }
});

test("Автотесты включают граничные случаи, оценка не сводится к двум примерам", () => {
  for (const mod of playable) {
    assert.ok(mod.code, "No code practice: " + mod.id);
    assert.ok(mod.code.tests.length >= 4 && mod.code.tests.length <= 6, mod.id);
    assert.match(mod.code.entrypoint ?? "", /^[A-Za-z_$][\w$]*$/, mod.id);
    assert.ok(new Set(mod.code.tests.map((t) => t.name)).size === mod.code.tests.length, mod.id);
  }
});

test("Исследовательские задания требуют сопоставления режимов и объяснения", () => {
  for (const mod of playable) {
    assert.ok(mod.see, "Missing visual lab: " + mod.id);
    assert.ok(mod.see.reflection, "No concept check: " + mod.id);
    const r = mod.see.reflection;
    assert.ok(r.options.some((o) => o.id === r.correctId), mod.id);
    if (mod.see.goal && (mod.see.sliders ?? []).length) {
      assert.equal(typeof mod.see.goal.checkHistory, "function", mod.id);
      const initial = Object.fromEntries(mod.see.sliders.map((s) => [s.id, s.value]));
      assert.equal(mod.see.goal.checkHistory([initial]), false, mod.id);
    }
  }
});

test("К каждому практическому вопросу есть предметное пояснение ошибки", () => {
  for (const mod of playable)
    for (const q of mod.hands ?? [])
      assert.ok((q.incorrectFeedback ?? "").length >= 20, mod.id + " / " + q.id);
});

test("Счёт освоения и сроки повторения опираются на реальные этапы", () => {
  const { emptyProgress, markPhaseDone, markLesson, lessonMastery } = loadTs("src/game/progress.ts");
  let p = emptyProgress();
  p = markPhaseDone(p, "a1-m1", "understand");
  p = markPhaseDone(p, "a1-m1", "see", { seeGoalMet: true });
  p = markPhaseDone(p, "a1-m1", "hands", { handsFirstTry: 0.5 });
  p = markPhaseDone(p, "a1-m1", "code", { codePassed: true });
  assert.equal(lessonMastery(p.educationalProgress["a1-m1"]), 85);
  p = markLesson(p, "a1-m1", { completed: true });
  assert.equal(p.educationalProgress["a1-m1"].practiceCount, 1);
  assert.ok(Date.parse(p.educationalProgress["a1-m1"].reviewDueAt) > Date.now());
});

/** WorkerRuntime исполняется в отдельном JS realm, чтобы заморозка прототипов не затронула тест-раннер. */
function grade(code, tests, entrypoint = "scale", token = "trusted") {
  const transpiled = ts.transpileModule(source("src/runner/vectorRunner.ts"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const messages = [];
  const self = { postMessage: (msg) => messages.push(msg), onmessage: null };
  const context = vm.createContext({ self, exports: {} });
  vm.runInContext(transpiled + "\nworkerRuntime();", context, { timeout: 1500 });
  self.onmessage({ data: { code, tests, entrypoint, token } });
  return messages;
}
const scales = playable.find((m) => m.id === "a1-m1").code.tests;

test("Корректная функция проходит все проверки", () => {
  const msgs = grade("function scale(value,k){return value*k;}", scales);
  assert.equal(msgs.length, 1);
  assert.equal(msgs[0].result.ok, true);
  assert.ok(msgs[0].result.tests.every((t) => t.passed));
});
test("Подмена Math.abs не позволяет обойти проверку", () => {
  const msgs = grade("Math.abs=()=>0; function scale(){return 0;}", scales);
  assert.ok(!msgs[0].result.ok || msgs[0].result.tests.some((t) => !t.passed));
});
test("Поддельный postMessage не считается результатом теста", () => {
  const msgs = grade(
    "function scale(){ Function('return self')().postMessage({token:'forged',result:{ok:true,tests:[{passed:true}]}}); return 0; }",
    scales,
  );
  const verified = msgs.filter((m) => m.token === "trusted");
  assert.equal(verified.length, 1);
  assert.ok(verified[0].result.tests.some((t) => !t.passed));
  assert.ok(msgs.some((m) => m.token === "forged"));
});
