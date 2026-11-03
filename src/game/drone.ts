/**
 * Глава I · миссия «Маршрут дрона».
 * Пространственное конструирование: игрок собирает маршрут
 * из векторных шагов; движок симулирует траекторию, проверяет
 * столкновения (сечение отрезка и окружности) и бюджет энергии.
 */

export interface Vec2 {
  x: number;
  y: number;
}

export interface Obstacle {
  x: number;
  y: number;
  r: number;
  label: string;
}

export const DRONE_FIELD = {
  size: 10,
  start: { x: 1, y: 1 } as Vec2,
  target: { x: 9, y: 7 } as Vec2,
  tolerance: 0.95,
  energyBudget: 24, // максимальная суммарная длина маршрута
  maxSteps: 14,
  maxStepLen: 2.0,
  obstacles: [
    { x: 3.5, y: 4.5, r: 1.1, label: "ОБЛОМОК-К1" },
    { x: 6.5, y: 2.8, r: 0.9, label: "АНТЕННА-F2" },
    { x: 7.6, y: 5.6, r: 1.2, label: "ЗАВАЛ-СЕКТ.Д" },
  ] as Obstacle[],
};

export interface SimResult {
  path: Vec2[];
  reached: boolean;
  collisionAt: number | null; // индекс точки пути
  outOfBounds: number | null;
  length: number;
  energyOk: boolean;
  passed: boolean;
}

/** Ближайшая точка отрезка [a,b] к точке p */
function closestOnSegment(a: Vec2, b: Vec2, p: Vec2): Vec2 {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const len2 = abx * abx + aby * aby;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * abx + (p.y - a.y) * aby) / len2));
  return { x: a.x + abx * t, y: a.y + aby * t };
}

function dist(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function simulateRoute(steps: Vec2[]): SimResult {
  const path: Vec2[] = [{ ...DRONE_FIELD.start }];
  let pos = { ...DRONE_FIELD.start };
  let length = 0;
  let collisionAt: number | null = null;
  let outOfBounds: number | null = null;

  for (const s of steps) {
    const stepLen = Math.hypot(s.x, s.y);
    const clamped = stepLen > DRONE_FIELD.maxStepLen && stepLen > 0
      ? { x: (s.x / stepLen) * DRONE_FIELD.maxStepLen, y: (s.y / stepLen) * DRONE_FIELD.maxStepLen }
      : s;
    const next = { x: pos.x + clamped.x, y: pos.y + clamped.y };
    length += Math.hypot(clamped.x, clamped.y);

    if (
      next.x < 0 || next.x > DRONE_FIELD.size || next.y < 0 || next.y > DRONE_FIELD.size
    ) {
      outOfBounds = path.length;
      path.push(next);
      break;
    }

    for (const o of DRONE_FIELD.obstacles) {
      const close = closestOnSegment(pos, next, { x: o.x, y: o.y });
      if (dist(close, o) < o.r + 0.12) {
        collisionAt = path.length;
        path.push(close);
        pos = close;
        break;
      }
    }
    if (collisionAt !== null) break;

    pos = next;
    path.push(next);
    if (dist(pos, DRONE_FIELD.target) <= DRONE_FIELD.tolerance) break;
  }

  const reached = dist(pos, DRONE_FIELD.target) <= DRONE_FIELD.tolerance && collisionAt === null && outOfBounds === null;
  const energyOk = length <= DRONE_FIELD.energyBudget;
  return {
    path,
    reached,
    collisionAt,
    outOfBounds,
    length,
    energyOk,
    passed: reached && energyOk,
  };
}

/** Сглаженность маршрута: суммарный угол поворотов (меньше — элегантнее) */
export function routeSmoothness(path: Vec2[]): number {
  let turns = 0;
  for (let i = 2; i < path.length; i++) {
    const a1 = Math.atan2(path[i - 1].y - path[i - 2].y, path[i - 1].x - path[i - 2].x);
    const a2 = Math.atan2(path[i].y - path[i - 1].y, path[i].x - path[i - 1].x);
    let d = Math.abs(a2 - a1);
    if (d > Math.PI) d = 2 * Math.PI - d;
    turns += d;
  }
  return turns;
}
