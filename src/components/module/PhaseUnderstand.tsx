import { useState } from "react";
import { Scene } from "../../types/scenario";
import { SceneEngine } from "../SceneEngine";

export function PhaseUnderstand({ scenes, onDone }: { scenes: Scene[]; onDone: () => void }) {
  const [idx, setIdx] = useState(0);
  const scene = scenes[idx];

  return (
    <div>
      <SceneEngine
        scene={scene}
        onAdvance={() => {
          if (idx + 1 < scenes.length) setIdx(idx + 1);
          else onDone();
        }}
      />
    </div>
  );
}
