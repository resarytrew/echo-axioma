import { useEffect, useId, useRef } from "react";

export interface AxiomPoint {
  p: [number, number, number];
  color: string;
  label?: string;
}

export interface AxiomVector {
  to: [number, number, number];
  from?: [number, number, number];
  color: string;
  label?: string;
}

export interface AxiomSceneSpec {
  points?: AxiomPoint[];
  vectors?: AxiomVector[];
  grid?: boolean;
  gridSize?: number;
}

/**
 * Компактная предметная 3D-визуализация «Аксиомы».
 * Сцены описываются декларативно; параметры эксперимента
 * влияют на геометрию и подписи. Canvas 2D + перспективная проекция,
 * вращение — перетаскиванием.
 */
export function AxiomView({ scene, height = 300 }: { scene: AxiomSceneSpec; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const descriptionId = useId();
  const sceneDescription = [
    ...(scene.vectors ?? []).map((v) => (v.label ?? "Вектор") + ": от [" + (v.from ?? [0,0,0]).join(", ") + "] до [" + v.to.join(", ") + "]"),
    ...(scene.points ?? []).map((p) => (p.label ?? "Точка") + ": [" + p.p.join(", ") + "]"),
  ].join(". ") || "Трёхмерная координатная сетка.";
  const sceneRef = useRef(scene);
  sceneRef.current = scene;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rot = { x: -0.35, y: 0.65 };
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let raf = 0;
    let auto = true;

    const dpr = Math.min(2, window.devicePixelRatio || 1);

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = height * dpr;
    }
    resize();

    function project(p: [number, number, number]) {
      const [x, y, z] = p;
      const cy = Math.cos(rot.y);
      const sy = Math.sin(rot.y);
      const x1 = x * cy - z * sy;
      const z1 = x * sy + z * cy;
      const cx = Math.cos(rot.x);
      const sx = Math.sin(rot.x);
      const y1 = y * cx - z1 * sx;
      const z2 = y * sx + z1 * cx;
      const f = 4.2;
      const s = Math.min(canvas!.width, canvas!.height) * 0.13;
      const persp = f / (f + z2);
      return {
        X: canvas!.width / 2 + x1 * s * persp,
        Y: canvas!.height / 2 - y1 * s * persp,
        z: z2,
        persp,
      };
    }

    function line(a: [number, number, number], b: [number, number, number], color: string, w = 1.5) {
      const A = project(a);
      const B = project(b);
      ctx!.strokeStyle = color;
      ctx!.lineWidth = w * dpr;
      ctx!.beginPath();
      ctx!.moveTo(A.X, A.Y);
      ctx!.lineTo(B.X, B.Y);
      ctx!.stroke();
    }

    function draw() {
      if (!canvas) return;
      if (auto) rot.y += 0.004;
      ctx!.clearRect(0, 0, canvas.width, canvas.height);

      const s = sceneRef.current;
      const gs = s.gridSize ?? 3;
      if (s.grid !== false) {
        for (let g = -gs; g <= gs; g++) {
          const c = g === 0 ? "rgba(148,163,184,0.5)" : "rgba(148,163,184,0.18)";
          line([g, 0, -gs], [g, 0, gs], c, g === 0 ? 1.2 : 0.8);
          line([-gs, 0, g], [gs, 0, g], c, g === 0 ? 1.2 : 0.8);
        }
      }
      // оси
      line([-gs, 0, 0], [gs, 0, 0], "rgba(244,63,94,0.45)", 1.6);
      line([0, -gs, 0], [0, gs, 0], "rgba(16,185,129,0.45)", 1.6);
      line([0, 0, -gs], [0, 0, gs], "rgba(59,130,246,0.45)", 1.6);

      s.vectors?.forEach((vec) => {
        const from = vec.from ?? [0, 0, 0];
        const A = project(from as [number, number, number]);
        const B = project(vec.to);
        ctx!.strokeStyle = vec.color;
        ctx!.lineWidth = 2.2 * dpr;
        ctx!.beginPath();
        ctx!.moveTo(A.X, A.Y);
        ctx!.lineTo(B.X, B.Y);
        ctx!.stroke();
        // стрелка
        const ang = Math.atan2(B.Y - A.Y, B.X - A.X);
        const ah = 8 * dpr;
        ctx!.beginPath();
        ctx!.moveTo(B.X, B.Y);
        ctx!.lineTo(B.X - ah * Math.cos(ang - 0.4), B.Y - ah * Math.sin(ang - 0.4));
        ctx!.lineTo(B.X - ah * Math.cos(ang + 0.4), B.Y - ah * Math.sin(ang + 0.4));
        ctx!.closePath();
        ctx!.fillStyle = vec.color;
        ctx!.fill();
        if (vec.label) {
          ctx!.fillStyle = vec.color;
          ctx!.font = `${11 * dpr}px "JetBrains Mono", monospace`;
          ctx!.fillText(vec.label, B.X + 6 * dpr, B.Y - 6 * dpr);
        }
      });

      s.points?.forEach((pt) => {
        const P = project(pt.p);
        ctx!.beginPath();
        ctx!.arc(P.X, P.Y, 4.5 * dpr * P.persp, 0, Math.PI * 2);
        ctx!.fillStyle = pt.color;
        ctx!.shadowColor = pt.color;
        ctx!.shadowBlur = 10 * dpr;
        ctx!.fill();
        ctx!.shadowBlur = 0;
        if (pt.label) {
          ctx!.fillStyle = "#334155";
          ctx!.font = `${10 * dpr}px "JetBrains Mono", monospace`;
          ctx!.fillText(pt.label, P.X + 8 * dpr, P.Y + 4 * dpr);
        }
      });

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    const down = (e: PointerEvent) => {
      dragging = true;
      auto = false;
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      rot.y += (e.clientX - lastX) * 0.008;
      rot.x += (e.clientY - lastY) * 0.008;
      rot.x = Math.max(-1.4, Math.min(1.4, rot.x));
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const up = () => (dragging = false);
    const keydown = (e: KeyboardEvent) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
      e.preventDefault();
      auto = false;
      if (e.key === "ArrowLeft") rot.y -= 0.18;
      if (e.key === "ArrowRight") rot.y += 0.18;
      if (e.key === "ArrowUp") rot.x = Math.max(-1.4, rot.x - 0.18);
      if (e.key === "ArrowDown") rot.x = Math.min(1.4, rot.x + 0.18);
    };
    canvas.addEventListener("keydown", keydown);
    canvas.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("keydown", keydown);
      canvas.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("resize", resize);
    };
  }, [height]);

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-sky-50/50">
      <canvas ref={canvasRef} tabIndex={0} role="img" aria-label="Интерактивная трёхмерная модель" aria-describedby={descriptionId}
        className="block w-full cursor-grab active:cursor-grabbing focus:outline-2 focus:outline-sky-500" style={{ height }} />
      <p id={descriptionId} className="sr-only">{sceneDescription} Для вращения используйте стрелки клавиатуры или мышь.</p>
      <div className="pointer-events-none absolute bottom-2 right-3 font-mono text-[10px] tracking-widest text-slate-400">
        AXIOM 3D LAB · вращайте сцену мышью
      </div>
    </div>
  );
}
