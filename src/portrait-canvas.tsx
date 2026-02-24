import { getStroke } from "perfect-freehand";
import { useCallback, useEffect, useRef, useState } from "react";

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

export function PortraitCanvas() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [strokes, setStrokes] = useState<InputPoint[][]>([]);
  const [currentStroke, setCurrentStroke] = useState<InputPoint[] | null>(null);

  const handleClear = useCallback(() => {
    setStrokes([]);
    localStorage.removeItem("dungeon-motion-portrait");
  }, []);

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
      setCurrentStroke([getPoint(e)]);
    },
    [getPoint]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!currentStroke) return;
      e.preventDefault();
      setCurrentStroke((prev) => (prev ? [...prev, getPoint(e)] : null));
    },
    [currentStroke, getPoint]
  );

  const handlePointerUp = useCallback(() => {
    if (currentStroke) {
      setStrokes((prev) => [...prev, currentStroke]);
      setCurrentStroke(null);
    }
  }, [currentStroke]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("dungeon-motion-portrait");
    if (saved) {
      try {
        setStrokes(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (strokes.length > 0) {
      localStorage.setItem(
        "dungeon-motion-portrait",
        JSON.stringify(strokes)
      );
    }
  }, [strokes]);

  const allStrokes = currentStroke
    ? [...strokes, currentStroke]
    : strokes;

  return (
    <>
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
      {strokes.length > 0 && (
        <button
          className="absolute top-0 right-0 p-0.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 print:hidden"
          onClick={handleClear}
          title="Clear portrait"
          type="button"
        >
          <svg className="size-3.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </>
  );
}
