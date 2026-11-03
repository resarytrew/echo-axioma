import { useEffect, useRef, useState } from "react";
import { AnimationLesson } from "../../modules/types";

/**
 * Проигрыватель анимированных объяснений (Arhimed Studio / ManimGX).
 * Файлы лежат в public/lessons/manimgx/, исходники .py — в authoring/manimgx/
 * и в браузерную сборку не попадают.
 *
 * Если видео отсутствует (не отрендерено или нет сети), компонент
 * показывает текстовое альтернативное объяснение — урок не ломается.
 */
export function LessonAnimation({
  lesson,
  onWatched,
}: {
  lesson: AnimationLesson;
  onWatched?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [failed, setFailed] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    setFailed(false);
    setProgress(0);
  }, [lesson.id]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = speed;
  }, [speed]);

  const transcript = lesson.transcript ?? [];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-950">
      <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-2">
        <span className="h-2 w-2 rounded-full bg-rose-400/70" />
        <span className="h-2 w-2 rounded-full bg-amber-300/70" />
        <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
        <span className="ml-2 truncate font-mono text-[10px] tracking-widest text-slate-500">
          ARHIMED STUDIO · {lesson.title}
        </span>
        {lesson.durationSeconds && (
          <span className="ml-auto font-mono text-[10px] text-slate-600">
            {Math.floor(lesson.durationSeconds / 60)}:
            {String(lesson.durationSeconds % 60).padStart(2, "0")}
          </span>
        )}
      </div>

      {!failed ? (
        <video
          ref={videoRef}
          src={lesson.mp4}
          poster={lesson.poster}
          controls
          playsInline
          preload="metadata"
          className="block max-h-[420px] w-full bg-black"
          onError={() => setFailed(true)}
          onTimeUpdate={(e) => {
            const v = e.currentTarget;
            if (v.duration) setProgress(v.currentTime / v.duration);
          }}
          onEnded={onWatched}
        >
          {lesson.captions && (
            <track kind="subtitles" src={lesson.captions} srcLang="ru" label="Русские субтитры" default />
          )}
        </video>
      ) : (
        <div className="px-5 py-6">
          <div className="font-mono text-xs uppercase tracking-widest text-amber-400">
            Анимация недоступна — показано текстовое объяснение
          </div>
          <div className="mt-3 space-y-2 font-head text-[15px] leading-relaxed text-sky-100">
            {transcript.length > 0 ? (
              transcript.map((t, i) => (
                <p key={i}>
                  <span className="mr-2 font-mono text-xs text-slate-500">{String(i + 1).padStart(2, "0")}</span>
                  {t}
                </p>
              ))
            ) : (
              <p className="text-slate-400">Текстовая версия ещё не подготовлена.</p>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-slate-800 px-4 py-2.5">
        {!failed && (
          <>
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: `${progress * 100}%` }} />
            </div>
            <div className="flex gap-1">
              {[0.75, 1, 1.5].map((r) => (
                <button
                  key={r}
                  onClick={() => setSpeed(r)}
                  className={`rounded px-2 py-0.5 font-mono text-[10px] ${
                    speed === r ? "bg-sky-500 text-white" : "bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {r}×
                </button>
              ))}
            </div>
          </>
        )}
        {transcript.length > 0 && !failed && (
          <button
            onClick={() => setShowTranscript((v) => !v)}
            className="font-mono text-[10px] text-slate-400 underline transition hover:text-sky-300"
          >
            {showTranscript ? "скрыть расшифровку" : "текстовая расшифровка"}
          </button>
        )}
      </div>

      {showTranscript && !failed && transcript.length > 0 && (
        <div className="max-h-44 space-y-1.5 overflow-y-auto border-t border-slate-800 px-5 py-3">
          {transcript.map((t, i) => (
            <p key={i} className="font-head text-sm leading-snug text-slate-300">
              <span className="mr-2 font-mono text-[10px] text-slate-600">{String(i + 1).padStart(2, "0")}</span>
              {t}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
