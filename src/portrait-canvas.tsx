import { getStroke } from "perfect-freehand";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useReducer, useRef } from "react";

type InputPoint = [x: number, y: number, pressure: number] | [x: number, y: number];

const average = (a: number, b: number) => (a + b) / 2;

function getSvgPathFromStroke(points: number[][], closed = true) {
  const len = points.length;
  if (len < 4) return "";

  let a = points[0];
  let b = points[1];
  const c = points[2];

  let result = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(2)},${b[1].toFixed(2)} ${average(b[0], c[0]).toFixed(2)},${average(b[1], c[1]).toFixed(2)} T`;

  for (let i = 2, max = len - 1; i < max; i++) {
    a = points[i];
    b = points[i + 1];
    result += `${average(a[0], b[0]).toFixed(2)},${average(a[1], b[1]).toFixed(2)} `;
  }

  if (closed) result += "Z";
  return result;
}

const STROKE_OPTIONS = {
  end: { cap: true },
  last: true,
  simulatePressure: true,
  size: 6,
  smoothing: 0.5,
  start: { cap: true },
  streamline: 0.5,
  thinning: 0.5,
} as const;

export interface PortraitCanvasHandle {
  clear: () => void;
  hasStrokes: boolean;
}

type State = { strokes: InputPoint[][]; current: InputPoint[] | null };
type Action =
  | { type: "start"; point: InputPoint }
  | { type: "move"; point: InputPoint }
  | { type: "end" }
  | { type: "clear" }
  | { type: "load"; strokes: InputPoint[][] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "start":
      return {
        strokes: state.current ? [...state.strokes, state.current] : state.strokes,
        current: [action.point],
      };
    case "move":
      return state.current
        ? { ...state, current: [...state.current, action.point] }
        : state;
    case "end":
      return { strokes: [...state.strokes, state.current || []], current: null };
    case "clear":
      return { strokes: [], current: null };
    case "load":
      return { strokes: action.strokes, current: null };
  }
}

export const PortraitCanvas = forwardRef<PortraitCanvasHandle, { onStrokesChange?: (has: boolean) => void }>(function PortraitCanvas({ onStrokesChange }, ref) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [{ strokes, current }, dispatch] = useReducer(reducer, {
    strokes: [],
    current: null,
  });

  const handleClear = useCallback(() => {
    dispatch({ type: "clear" });
    localStorage.removeItem("dungeon-motion-portrait");
  }, []);

  useImperativeHandle(ref, () => ({
    clear: handleClear,
    hasStrokes: strokes.length > 0,
  }), [handleClear, strokes.length]);

  const getPoint = useCallback(
    (e: React.PointerEvent): InputPoint => {
      const svg = svgRef.current!;
      const rect = svg.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // Only pass pressure for pen/stylus — let simulatePressure handle mouse
      if (e.pointerType === "pen" && e.pressure > 0) {
        return [x, y, e.pressure];
      }
      return [x, y];
    },
    []
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as Element).setPointerCapture(e.pointerId);
      dispatch({ type: "start", point: getPoint(e) });
    },
    [getPoint]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!current) return;
      e.preventDefault();
      dispatch({ type: "move", point: getPoint(e) });
    },
    [current, getPoint]
  );

  const handlePointerUp = useCallback(() => {
    if (current) dispatch({ type: "end" });
  }, [current]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("dungeon-motion-portrait");
    if (saved) {
      try {
        dispatch({ type: "load", strokes: JSON.parse(saved) });
      } catch {
        // ignore
      }
    }
  }, []);

  // Save to localStorage + notify parent
  useEffect(() => {
    onStrokesChange?.(strokes.length > 0);
    if (strokes.length > 0) {
      localStorage.setItem(
        "dungeon-motion-portrait",
        JSON.stringify(strokes)
      );
    }
  }, [strokes]);

  const allStrokes = current ? [...strokes, current] : strokes;

  return (
    <svg
        className="w-full h-full touch-none cursor-crosshair"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        ref={svgRef}
      >
        {allStrokes.map((pts, i) => {
          const outline = getStroke(pts, STROKE_OPTIONS);
          const d = getSvgPathFromStroke(outline);
          if (!d) return null;
          return (
            <path
              className="fill-stone-800 dark:fill-stone-200 print:fill-stone-800"
              d={d}
              key={i}
            />
          );
        })}
      </svg>
  );
});
