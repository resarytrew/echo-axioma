import { useEffect, useRef, useState } from "react";

export function Typewriter({
  text,
  speed = 16,
  instant = false,
  onDone,
}: {
  text: string;
  speed?: number;
  instant?: boolean;
  onDone?: () => void;
}) {
  const [shown, setShown] = useState("");
  const doneRef = useRef(false);

  useEffect(() => {
    setShown("");
    doneRef.current = false;
    if (instant || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(text);
      doneRef.current = true;
      onDone?.();
      return;
    }
    let i = 0;
    const interval = window.setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        if (!doneRef.current) {
          doneRef.current = true;
          onDone?.();
        }
      }
    }, speed);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, instant]);

  const finished = shown.length === text.length;

  return (
    <span role="text" aria-label={text}>
      <span aria-hidden="true">
        {shown}
        {!finished && <span className="caret" />}
      </span>
    </span>
  );
}
