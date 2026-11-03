import { useEffect, useRef, useState } from "react";

export function Typewriter({
  text,
  speed = 16,
  onDone,
}: {
  text: string;
  speed?: number;
  onDone?: () => void;
}) {
  const [shown, setShown] = useState("");
  const doneRef = useRef(false);

  useEffect(() => {
    setShown("");
    doneRef.current = false;
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
  }, [text]);

  const finished = shown.length === text.length;

  return (
    <span onClick={() => {
      if (!finished) {
        setShown(text);
        if (!doneRef.current) {
          doneRef.current = true;
          onDone?.();
        }
      }
    }}>
      {shown}
      {!finished && <span className="caret" />}
    </span>
  );
}
