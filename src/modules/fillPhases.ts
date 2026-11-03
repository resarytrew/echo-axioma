import { ModuleSpec, SeeSpec, CodeTask } from "./types";
import { MiniLabItem } from "../types/scenario";

/**
 * Дополняющие этапы, доводящие каждый играбельный модуль
 * до полной структуры: Понять → Увидеть → Посчитать → Код → Результат.
 */

const see: Record<string, SeeSpec> = {
  "a1-m1": {
    title: "Число как точка на оси",
    description: "Любое показание прибора — точка в пространстве значений. Калибровка сдвигает и растягивает ось.",
    sliders: [
      { id: "v", label: "сырое показание", min: -3, max: 3, step: 0.1, value: 1.4 },
      { id: "k", label: "коэффициент k", min: -2, max: 2, step: 0.1, value: 1 },
    ],
    build: (p) => ({
      points: [
        { p: [p.v, 0, 0], color: "#94a3b8", label: `v = ${p.v.toFixed(1)}` },
        { p: [p.v * p.k, 0, 0], color: "#0284c7", label: `k·v = ${(p.v * p.k).toFixed(2)}` },
      ],
      vectors: [{ to: [p.v * p.k, 0, 0], color: "#0284c7" }],
    }),
    note: (p) => `k·v = ${p.k.toFixed(1)} × ${p.v.toFixed(1)} = ${(p.v * p.k).toFixed(2)}`,
    goal: {
      task: "Датчик занижает показания вдвое. Подберите k так, чтобы сырое значение 1.4 превратилось в 2.8.",
      check: (p) => Math.abs(p.v - 1.4) < 0.06 && Math.abs(p.v * p.k - 2.8) < 0.08,
      progress: (p) => `сейчас k·v = ${(p.v * p.k).toFixed(2)}, цель 2.80 при v = 1.4`,
      done: "Калибровка — это умножение на коэффициент. Простейшее преобразование данных.",
    },
  },
  "a1-m4": {
    title: "График функции активации",
    description: "Сдвигая вход, наблюдайте, как функция сжимает значения в диапазон (0; 1).",
    sliders: [{ id: "x", label: "вход x", min: -6, max: 6, step: 0.1, value: 0 }],
    build: (p) => {
      const pts = [];
      for (let i = -6; i <= 6; i += 0.5) {
        pts.push({ p: [i * 0.4, 1 / (1 + Math.exp(-i)) * 3 - 1.5, 0] as [number, number, number], color: "#cbd5e1" });
      }
      const y = 1 / (1 + Math.exp(-p.x));
      pts.push({ p: [p.x * 0.4, y * 3 - 1.5, 0] as [number, number, number], color: "#0284c7", label: `σ(x)=${y.toFixed(2)}` });
      return { points: pts };
    },
    note: (p) => `σ(${p.x.toFixed(1)}) = ${(1 / (1 + Math.exp(-p.x))).toFixed(3)}`,
    goal: {
      task: "Найдите вход, при котором сигмоида уверенно «включена»: σ(x) > 0.95.",
      check: (p) => 1 / (1 + Math.exp(-p.x)) > 0.95,
      progress: (p) => `σ(x) = ${(1 / (1 + Math.exp(-p.x))).toFixed(3)} — нужно > 0.95`,
      done: "Сигмоида насыщается: за пределами ±3 она почти не меняется. Это и ограничивает обучение.",
    },
  },
  "a2-m1": {
    title: "Нейрон в пространстве входов",
    description: "Вектор весов задаёт направление чувствительности нейрона. Входы вдоль w дают большой отклик.",
    sliders: [
      { id: "wx", label: "w₁", min: -2, max: 2, step: 0.1, value: 1 },
      { id: "wy", label: "w₂", min: -2, max: 2, step: 0.1, value: 1 },
      { id: "xx", label: "x₁", min: -2, max: 2, step: 0.1, value: 1.5 },
      { id: "xy", label: "x₂", min: -2, max: 2, step: 0.1, value: -1.2 },
    ],
    build: (p) => ({
      vectors: [
        { to: [p.wx, p.wy, 0], color: "#7c3aed", label: "w" },
        { to: [p.xx, p.xy, 0], color: "#0284c7", label: "x" },
      ],
    }),
    note: (p) => `w·x = ${(p.wx * p.xx + p.wy * p.xy).toFixed(2)} → ReLU = ${Math.max(0, p.wx * p.xx + p.wy * p.xy).toFixed(2)}`,
    goal: {
      task: "Сделайте нейрон «молчащим»: подберите вход x, ортогональный весам (w·x = 0) при ненулевом x.",
      check: (p) => Math.abs(p.wx * p.xx + p.wy * p.xy) < 0.08 && Math.hypot(p.xx, p.xy) > 0.5,
      progress: (p) => `w·x = ${(p.wx * p.xx + p.wy * p.xy).toFixed(2)} — добейтесь ≈ 0`,
      done: "Нейрон полностью игнорирует входы, перпендикулярные его вектору весов.",
    },
  },
  "a2-m3": {
    title: "Поверхность ошибки MSE",
    description: "Предсказание против цели: квадрат разности растёт быстро.",
    sliders: [
      { id: "pred", label: "предсказание", min: -3, max: 3, step: 0.1, value: 2 },
      { id: "target", label: "цель", min: -3, max: 3, step: 0.1, value: 0.5 },
    ],
    build: (p) => ({
      points: [
        { p: [p.target, 0, 0], color: "#10b981", label: "цель" },
        { p: [p.pred, 0, 0], color: "#0284c7", label: "предсказание" },
        { p: [p.pred, (p.pred - p.target) ** 2 * 0.6, 0], color: "#f43f5e", label: `loss=${((p.pred - p.target) ** 2).toFixed(2)}` },
      ],
      vectors: [{ from: [p.target, 0, 0], to: [p.pred, 0, 0], color: "#f59e0b", label: "ошибка" }],
    }),
    note: (p) => `(pred − target)² = ${((p.pred - p.target) ** 2).toFixed(3)}`,
    goal: {
      task: "Доведите ошибку почти до нуля: loss < 0.01.",
      check: (p) => (p.pred - p.target) ** 2 < 0.01,
      progress: (p) => `loss = ${((p.pred - p.target) ** 2).toFixed(3)}`,
      done: "Нулевая ошибка достигается только совпадением предсказания и цели.",
    },
  },
  "a2-m5": {
    title: "Шаг обучения на деле",
    description: "Серая точка — текущий вес, синяя — положение после одного шага выбранного размера.",
    sliders: [
      { id: "w", label: "вес w", min: -2.5, max: 2.5, step: 0.1, value: 2 },
      { id: "lr", label: "learning rate", min: 0.05, max: 1.2, step: 0.05, value: 0.3 },
    ],
    build: (p) => {
      const next = p.w - p.lr * 2 * p.w;
      return {
        points: [
          { p: [0, 0, 0], color: "#10b981", label: "минимум" },
          { p: [p.w, p.w * p.w * 0.4, 0], color: "#94a3b8", label: "w" },
          { p: [next, next * next * 0.4, 0], color: "#0284c7", label: "w после шага" },
        ],
        vectors: [{ from: [p.w, p.w * p.w * 0.4, 0], to: [next, next * next * 0.4, 0], color: "#ef4444" }],
      };
    },
    note: (p) => `w' = w − lr·2w = ${(p.w - p.lr * 2 * p.w).toFixed(3)}`,
    goal: {
      task: "Подберите lr, при котором один шаг сразу попадает в минимум (|w'| < 0.05) при |w| > 1.",
      check: (p) => Math.abs(p.w - p.lr * 2 * p.w) < 0.05 && Math.abs(p.w) > 1,
      progress: (p) => `|w'| = ${Math.abs(p.w - p.lr * 2 * p.w).toFixed(3)} — попробуйте lr = 0.5`,
      done: "При lr = 0.5 шаг попадает точно в минимум. Больше — перелёт и колебания.",
    },
  },
  "a2-m6": {
    title: "Поток градиента назад",
    description: "Градиент распределяется по входам пропорционально другому множителю: это и есть цепное правило.",
    sliders: [
      { id: "x", label: "вход x", min: -2, max: 2, step: 0.1, value: 1.5 },
      { id: "w", label: "вес w", min: -2, max: 2, step: 0.1, value: 0.8 },
    ],
    build: (p) => ({
      vectors: [
        { to: [p.x, 0, 0], color: "#94a3b8", label: "x" },
        { to: [0, p.w, 0], color: "#7c3aed", label: "w" },
        { to: [p.x, p.w, 0], color: "#0284c7", label: `y = ${(p.x * p.w).toFixed(2)}` },
      ],
      points: [{ p: [p.x, p.w, 0], color: "#f59e0b", label: `∂y/∂w = ${p.x.toFixed(1)}` }],
    }),
    note: (p) => `y = w·x → ∂y/∂w = x = ${p.x.toFixed(1)}, ∂y/∂x = w = ${p.w.toFixed(1)}`,
    goal: {
      task: "Сделайте вес нечувствительным к обучению: подберите x, при котором градиент по w равен нулю.",
      check: (p) => Math.abs(p.x) < 0.06,
      progress: (p) => `∂y/∂w = ${p.x.toFixed(2)} — нужно ≈ 0`,
      done: "При нулевом входе вес не получает градиента и не обучается — «мёртвый» признак.",
    },
  },
  "a3-m2": {
    title: "Недообучение против переобучения",
    description: "Синие точки — обучающая выборка, зелёные — проверочная. Сложность модели меняет обе ошибки.",
    sliders: [{ id: "cap", label: "сложность модели", min: 1, max: 10, step: 1, value: 3 }],
    build: (p) => {
      const trainErr = Math.max(0.05, 2.4 / p.cap);
      const valErr = trainErr + Math.max(0, (p.cap - 5) * 0.42);
      return {
        points: [
          { p: [-1.6, trainErr * 1.2 - 1, 0], color: "#0284c7", label: `train ${trainErr.toFixed(2)}` },
          { p: [1.6, valErr * 1.2 - 1, 0], color: "#10b981", label: `val ${valErr.toFixed(2)}` },
        ],
        vectors: [{ from: [-1.6, trainErr * 1.2 - 1, 0], to: [1.6, valErr * 1.2 - 1, 0], color: "#f59e0b" }],
      };
    },
    note: (p) => {
      const tr = Math.max(0.05, 2.4 / p.cap);
      const va = tr + Math.max(0, (p.cap - 5) * 0.42);
      return `train = ${tr.toFixed(2)} · val = ${va.toFixed(2)} · разрыв = ${(va - tr).toFixed(2)}`;
    },
    goal: {
      task: "Исследуйте и недообучение, и переобучение, затем остановитесь на сложности с минимальной ошибкой на ПРОВЕРОЧНЫХ данных.",
      check: (p) => p.cap === 5,
      checkHistory: (h) => {
        const caps = h.map((x) => x.cap);
        const sawUnderfit = caps.some((c) => c <= 2);
        const sawOverfit = caps.some((c) => c >= 8);
        return sawUnderfit && sawOverfit && caps[caps.length - 1] === 5;
      },
      progress: (p, h) => {
        const caps = h.map((x) => x.cap);
        const u = caps.some((c) => c <= 2) ? "✓" : "—";
        const o = caps.some((c) => c >= 8) ? "✓" : "—";
        return `недообучение ${u} · переобучение ${o} · сейчас сложность ${p.cap} (оптимум найдите по val)`;
      },
      done: "Оптимум — там, где validation минимальна. Дальше растёт разрыв: модель учит шум.",
    },
  },
  "a4-m1": {
    title: "Форма тензора",
    description: "Одни и те же числа, разная размерность: скаляр, вектор, матрица, батч.",
    sliders: [
      { id: "rows", label: "строк", min: 1, max: 4, step: 1, value: 2 },
      { id: "cols", label: "столбцов", min: 1, max: 4, step: 1, value: 3 },
    ],
    build: (p) => {
      const pts = [];
      for (let r = 0; r < p.rows; r++)
        for (let c = 0; c < p.cols; c++)
          pts.push({ p: [c - (p.cols - 1) / 2, (p.rows - 1) / 2 - r, 0] as [number, number, number], color: "#0284c7" });
      return { points: pts };
    },
    note: (p) => `shape = [${p.rows}, ${p.cols}] → ${p.rows * p.cols} элементов`,
    goal: {
      task: "Соберите тензор формы [3, 4] — батч из трёх примеров по четыре признака.",
      check: (p) => p.rows === 3 && p.cols === 4,
      progress: (p) => `сейчас [${p.rows}, ${p.cols}]`,
      done: "Форма тензора определяет, какие операции с ним вообще допустимы.",
    },
  },
  "a6-m1": {
    title: "Веса внимания",
    description: "Насколько текущий запрос q похож на каждый ключ k — столько внимания и получит значение.",
    sliders: [
      { id: "qx", label: "q.x", min: -2, max: 2, step: 0.1, value: 1.4 },
      { id: "qy", label: "q.y", min: -2, max: 2, step: 0.1, value: 0.3 },
    ],
    build: (p) => {
      const keys: [number, number][] = [
        [1.5, 0.2],
        [-0.4, 1.4],
        [0.1, -1.5],
      ];
      const scores = keys.map(([x, y]) => p.qx * x + p.qy * y);
      const m = Math.max(...scores);
      const exps = scores.map((s) => Math.exp(s - m));
      const sum = exps.reduce((a, b) => a + b, 0);
      const w = exps.map((e) => e / sum);
      return {
        vectors: [
          { to: [p.qx, p.qy, 0], color: "#0284c7", label: "q" },
          ...keys.map((k, i) => ({
            to: [k[0], k[1], 0] as [number, number, number],
            color: "#f59e0b",
            label: `k${i + 1} · ${(w[i] * 100).toFixed(0)}%`,
          })),
        ],
      };
    },
    note: (p) => {
      const keys: [number, number][] = [[1.5, 0.2], [-0.4, 1.4], [0.1, -1.5]];
      const scores = keys.map(([x, y]) => p.qx * x + p.qy * y);
      const m = Math.max(...scores);
      const exps = scores.map((s) => Math.exp(s - m));
      const sum = exps.reduce((a, b) => a + b, 0);
      return `softmax = [${exps.map((e) => (e / sum).toFixed(2)).join(", ")}]`;
    },
    goal: {
      task: "Направьте запрос так, чтобы более 80 % внимания ушло ко второму ключу k₂.",
      check: (p) => {
        const keys: [number, number][] = [[1.5, 0.2], [-0.4, 1.4], [0.1, -1.5]];
        const scores = keys.map(([x, y]) => p.qx * x + p.qy * y);
        const m = Math.max(...scores);
        const exps = scores.map((s) => Math.exp(s - m));
        const sum = exps.reduce((a, b) => a + b, 0);
        return exps[1] / sum > 0.8;
      },
      progress: (p) => {
        const keys: [number, number][] = [[1.5, 0.2], [-0.4, 1.4], [0.1, -1.5]];
        const scores = keys.map(([x, y]) => p.qx * x + p.qy * y);
        const m = Math.max(...scores);
        const exps = scores.map((s) => Math.exp(s - m));
        const sum = exps.reduce((a, b) => a + b, 0);
        return `вес k₂ = ${((exps[1] / sum) * 100).toFixed(0)}% — нужно > 80%`;
      },
      done: "Запрос, сонаправленный ключу, забирает почти всё внимание. Так позиция выбирает, что читать.",
    },
  },
  "a6-m6": {
    title: "Контекст решает",
    description: "Один и тот же текущий токен ведёт к разным продолжениям в зависимости от режима в начале строки.",
    sliders: [{ id: "mode", label: "режим (первый токен)", min: 0, max: 2, step: 1, value: 0 }],
    build: (p) => {
      const modes = [
        { a: 3, b: 7 },
        { a: 7, b: 1 },
        { a: 11, b: 13 },
      ];
      const m = modes[p.mode];
      const pts = [];
      let v = 5;
      for (let i = 0; i < 6; i++) {
        pts.push({ p: [i * 0.7 - 1.8, v / 6 - 1.5, 0] as [number, number, number], color: "#0284c7", label: String(v) });
        v = (m.a * v + m.b) % 20;
      }
      return { points: pts };
    },
    note: (p) => {
      const modes = [
        { a: 3, b: 7 },
        { a: 7, b: 1 },
        { a: 11, b: 13 },
      ];
      return `режим ${p.mode}: t→(${modes[p.mode].a}·t + ${modes[p.mode].b}) mod 20 — от токена 5`;
    },
    goal: {
      task: "Переберите все три режима и убедитесь: одно и то же значение 5 ведёт к трём разным продолжениям.",
      check: (p) => p.mode === 2,
      checkHistory: (h) => new Set(h.map((x) => x.mode)).size >= 3,
      progress: (_p, h) => {
        const seen = [...new Set(h.map((x) => x.mode))].sort();
        return `просмотрено режимов: ${seen.length} из 3 (${seen.join(", ")})`;
      },
      done: "Предыдущего токена недостаточно — нужен контекст всей последовательности. Это задача для внимания.",
    },
  },
};

const hands: Record<string, MiniLabItem[]> = {
  "a1-m7": [
    {
      id: "h1",
      prompt: "Дрон выполнил шаги ⟨1.5, 0.5⟩ и ⟨0.5, 1.5⟩. Итоговое смещение?",
      options: [
        { id: "a", label: "⟨2.0, 2.0⟩" },
        { id: "b", label: "⟨1.0, 1.0⟩" },
        { id: "c", label: "⟨0.75, 0.75⟩" },
      ],
      correctId: "a",
    },
    {
      id: "h2",
      prompt: "Длина вектора ⟨3, 4⟩ равна…",
      options: [
        { id: "a", label: "7" },
        { id: "b", label: "5" },
        { id: "c", label: "12" },
      ],
      correctId: "b",
    },
    {
      id: "h3",
      prompt: "Шаг ⟨2, 0⟩ умножили на 0.5. Как изменился расход энергии (длина)?",
      options: [
        { id: "a", label: "Уменьшился вдвое" },
        { id: "b", label: "Не изменился" },
        { id: "c", label: "Вырос вдвое" },
      ],
      correctId: "a",
    },
  ],
  "a4-m1": [
    {
      id: "h1",
      prompt: "Тензор формы [2, 3, 4] содержит сколько чисел?",
      options: [
        { id: "a", label: "9" },
        { id: "b", label: "24" },
        { id: "c", label: "12" },
      ],
      correctId: "b",
    },
    {
      id: "h2",
      prompt: "Можно ли перемножить матрицы форм [2, 3] и [3, 5]?",
      options: [
        { id: "a", label: "Да, результат [2, 5]" },
        { id: "b", label: "Нет, формы несовместимы" },
        { id: "c", label: "Да, результат [3, 3]" },
      ],
      correctId: "a",
    },
  ],
  "a6-m6": [
    {
      id: "h1",
      prompt: "Контекстная задача: первый токен задаёт режим. Хватит ли модели видеть только предыдущий токен?",
      options: [
        { id: "a", label: "Да, этого всегда достаточно" },
        { id: "b", label: "Нет, одно и то же значение ведёт к разным продолжениям" },
        { id: "c", label: "Зависит от скорости обучения" },
      ],
      correctId: "b",
    },
    {
      id: "h2",
      prompt: "Базовая модель биграмм даёт 100 % на задаче A и 36 % на задаче B. О чём это говорит?",
      options: [
        { id: "a", label: "Сложная модель нужна только там, где простая не справляется" },
        { id: "b", label: "Transformer всегда лучше" },
        { id: "c", label: "Задача B сформулирована неверно" },
      ],
      correctId: "a",
    },
    {
      id: "h3",
      prompt: "Чекпоинт выбирается по наименьшему validation loss. Зачем ещё нужен test?",
      options: [
        { id: "a", label: "Это одно и то же" },
        { id: "b", label: "Чтобы честно оценить модель на данных, не влиявших на выбор" },
        { id: "c", label: "Чтобы ускорить обучение" },
      ],
      correctId: "b",
    },
  ],
};

const code: Record<string, CodeTask> = {
  "a2-m4": {
    title: "Численный градиент",
    brief: "Реализуй grad(f, x, h) — приближение производной центральной разностью: (f(x+h) − f(x−h)) / (2h).",
    starter: "function grad(f, x, h) {\n  // центральная разность\n}\n",
    tests: [
      { name: "d(x²)/dx при x=3 ≈ 6", code: "Math.abs(grad(v => v*v, 3, 1e-4) - 6) < 1e-3" },
      { name: "d(x³)/dx при x=2 ≈ 12", code: "Math.abs(grad(v => v*v*v, 2, 1e-4) - 12) < 1e-2" },
    ],
    hint: "return (f(x + h) - f(x - h)) / (2 * h)",
  },
  "a2-m6": {
    title: "Цепное правило",
    brief: "y = w·x, z = y². Реализуй chain(w, x), возвращающую dz/dw = 2·(w·x)·x.",
    starter: "function chain(w, x) {\n  // dz/dy * dy/dw\n}\n",
    tests: [
      { name: "chain(2,3) === 36", code: "Math.abs(chain(2,3) - 36) < 1e-9" },
      { name: "chain(1,-4) === 32", code: "Math.abs(chain(1,-4) - 32) < 1e-9" },
    ],
    hint: "dz/dy = 2y, dy/dw = x.",
  },
  "a3-m2": {
    title: "Выбор чекпоинта",
    brief: "Реализуй bestEpoch(valLosses) — индекс эпохи с минимальной ошибкой на проверочных данных.",
    starter: "function bestEpoch(valLosses) {\n  // индекс минимума\n}\n",
    tests: [
      { name: "[3,2,1,2,5] → 2", code: "bestEpoch([3,2,1,2,5]) === 2" },
      { name: "[0.9,0.4,0.41] → 1", code: "bestEpoch([0.9,0.4,0.41]) === 1" },
      { name: "последняя эпоха не всегда лучшая", code: "bestEpoch([1,0.2,0.8,1.5]) === 1" },
    ],
    hint: "Идите циклом, храните минимум и его индекс.",
  },
  "a6-m1": {
    title: "Softmax внимания",
    brief: "Реализуй softmax(scores) — устойчивая нормировка: вычти максимум, возведи в экспоненту, подели на сумму.",
    starter: "function softmax(s) {\n  // верни массив весов, сумма = 1\n}\n",
    tests: [
      { name: "сумма весов = 1", code: "Math.abs(softmax([2,0,-1]).reduce((a,b)=>a+b,0) - 1) < 1e-9" },
      { name: "наибольший скор → наибольший вес", code: "softmax([2,0,-1])[0] > softmax([2,0,-1])[1]" },
      { name: "равные скоры → равные веса", code: "Math.abs(softmax([1,1])[0] - 0.5) < 1e-9" },
    ],
    hint: "Math.max(...s), затем Math.exp.",
  },
  "a6-m6": {
    title: "Предсказание базовой модели",
    brief: "Перед обучением Transformer реализуй baseline(seq, a, b): предскажи следующий токен по правилу (a·t + b) mod 20.",
    starter: "function baseline(seq, a, b) {\n  const last = seq[seq.length - 1];\n  // верни предсказание следующего токена\n}\n",
    tests: [
      { name: "baseline([5], 3, 7) === 2", code: "baseline([5],3,7) === 2" },
      { name: "baseline([1,4], 7, 1) === 9", code: "baseline([1,4],7,1) === 9" },
    ],
    hint: "(a * last + b) % 20",
  },
};

export function fillPhases(spec: ModuleSpec): ModuleSpec {
  if (!spec.playable) return spec;
  return {
    ...spec,
    see: spec.see ?? see[spec.id],
    hands: spec.hands ?? hands[spec.id],
    code: spec.code ?? code[spec.id],
  };
}
