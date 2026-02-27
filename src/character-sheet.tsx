import { useRef, useState } from "react";

import { cn } from "./cn";
import { GrainOverlay } from "./grain-overlay";
import { PortraitCanvas, type PortraitCanvasHandle } from "./portrait-canvas";

export function CharacterSheet() {
  return (
    <form className="min-h-screen">
      <GrainOverlay />

      <div className="relative max-w-6xl mx-auto px-6 print:max-w-none print:mx-0 print:px-0">
        <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-8 md:gap-0 print:gap-0">
          <LeftPage />
          <RightPage />
        </div>
      </div>
    </form>
  );
}

// -- Left Page: Identity, Stats, Combat --

function LeftPage() {
  return (
    <div className="md:pr-8 print:pr-8 md:border-r print:border-r border-dashed border-stone-300 dark:border-stone-600 print:border-stone-400 space-y-6">
      <IdentityBlock />
      <StatBlockWithDebilities />
      <CombatShapes />
      <InlineField label="Instinct" name="instinct" />
    </div>
  );
}

function IdentityBlock() {
  return (
    <div className="flex gap-6">
      <div className="flex-1 space-y-2">
        <InlineField label="Name" large name="char-name" />
        <InlineField label="Look" name="look" />
        <InlineField label="Background" name="background" />
      </div>
      <PortraitFrame />
    </div>
  );
}

function PortraitFrame() {
  const canvasRef = useRef<PortraitCanvasHandle>(null);
  const [hasStrokes, setHasStrokes] = useState(false);

  return (
    <div className="shrink-0 w-36 h-44 relative">
      <div className="absolute inset-0 border-[3px] border-double border-stone-700 dark:border-stone-300 print:border-stone-800 rounded-xl [corner-shape:superellipse(-1.1)] overflow-hidden">
        <PortraitCanvas
          onStrokesChange={setHasStrokes}
          ref={canvasRef}
        />
      </div>
      {hasStrokes && (
        <button
          className="absolute -top-2 -right-2 p-0.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 print:hidden"
          onClick={() => canvasRef.current?.clear()}
          title="Clear portrait"
          type="button"
        >
          <svg className="size-3.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

// -- Stats with Debility Forks --

const STAT_PAIRS: [StatDef, StatDef, string][] = [
  [
    { abbr: "STR", name: "Strength" },
    { abbr: "DEX", name: "Dexterity" },
    "weakened",
  ],
  [
    { abbr: "INT", name: "Intelligence" },
    { abbr: "WIS", name: "Wisdom" },
    "dazed",
  ],
  [
    { abbr: "CON", name: "Constitution" },
    { abbr: "CHA", name: "Charisma" },
    "miserable",
  ],
];

interface StatDef {
  abbr: string;
  name: string;
}

function StatBlockWithDebilities() {
  return (
    <div>
      <p className="font-hand text-base text-stone-500 dark:text-stone-400 mb-3">
        <span className="font-serif font-bold tracking-wider text-stone-700 dark:text-stone-300">Stats</span>{" "}
        Assign +2, +1, +1, +0, +0, −1. Debility marked → roll with
        disadvantage.
      </p>
      <div className="flex gap-3 print:gap-2">
        {STAT_PAIRS.map(([left, right, debility]) => (
          <StatPairWithFork
            debility={debility}
            key={debility}
            left={left}
            right={right}
          />
        ))}
      </div>
    </div>
  );
}

function StatPairWithFork({
  debility,
  left,
  right,
}: {
  debility: string;
  left: StatDef;
  right: StatDef;
}) {
  return (
    <div className="flex-1">
      <div className="flex gap-1.5 print:gap-1">
        <StatBox stat={left} />
        <StatBox stat={right} />
      </div>
      {/* Bracket fork with debility circle */}
      <div className="relative flex items-start justify-center mt-0">
        {/* Left arm of bracket */}
        <div className="absolute left-1/4 top-0 w-[calc(25%)] h-3 border-l border-b border-stone-400 dark:border-stone-600 print:border-stone-500" />
        {/* Right arm of bracket */}
        <div className="absolute right-1/4 top-0 w-[calc(25%)] h-3 border-r border-b border-stone-400 dark:border-stone-600 print:border-stone-500" />
        {/* Center stem */}
        <div className="w-px h-4 bg-stone-400 dark:bg-stone-600 print:bg-stone-500 mt-3" />
      </div>
      {/* Debility circle checkbox */}
      <div className="flex flex-col items-center -mt-0.5">
        <input
          className="size-4 rounded-full"
          name={`debility-${debility}`}
          type="checkbox"
        />
        <span className="text-[10px] italic text-stone-500 dark:text-stone-400 mt-0.5">
          {debility}
        </span>
      </div>
    </div>
  );
}

function StatBox({ stat }: { stat: StatDef }) {
  return (
    <div className="flex-1 relative border-2 border-stone-400 dark:border-stone-500 print:border-stone-500 rounded-lg [corner-shape:superellipse(-1.1)] pt-4 pb-4 px-1.5 print:px-1 text-center">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-stone-50 dark:bg-stone-900 print:bg-white px-1 text-[10px] tracking-wider text-stone-700 dark:text-stone-300 leading-none whitespace-nowrap">
        {stat.name}
      </div>
      <input
        className="w-full text-center font-hand text-3xl print:text-2xl bg-transparent text-stone-800 dark:text-stone-200 focus:outline-none border-none"
        name={`stat-${stat.abbr.toLowerCase()}`}
        placeholder="+0"
        type="text"
      />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[calc(50%+2px)] bg-stone-50 dark:bg-stone-900 print:bg-white px-1 text-[9px] text-stone-500 dark:text-stone-400 leading-none whitespace-nowrap">
        ({stat.abbr})
      </div>
    </div>
  );
}

// -- Combat Shapes (Hogtown-style shaped stat containers) --

function CombatShapes() {
  return (
    <div className="flex justify-center items-end gap-8">
      <ShapedStat className="-translate-y-1.5 -translate-x-0.5" filled label="HP" name="hp" viewBox="0 0 250 250">
        {/* Heart — QuiverAI Arrow */}
        <path d="m244.2 72.21c-0.48-9.09-3.35-18.59-7.92-25.5-6.17-9.39-8.87-19.32-19.48-24.9-4.03-2.21-8.28-4.46-12.62-5.6-7.1-3.13-12.95-3.83-20.12-3.71-5.39 0.09-10.85 0.68-14.46 0.64-11.73 0.52-19.35 6.13-29.22 14.22-3.62 3.12-6.46 6.87-9.71 10.3-2.74 2.95-4.27 5.69-5.57 8.24-2.2-4.49-7.28-9.48-10.02-13.3-5.93-5.61-9.7-10.72-17.27-13.51 3.62 2.4 7.39 4.7 9.5 8.27-5.4-5.65-14.38-9.67-23.21-11.55-5.93-1.2-6.99-2.58-13.99-2.49-4.95 0.07-9.7 0.96-14.13 2.49-9.87 2.3-18.7 6.98-28.38 15.07-5.65 4.23-10.3 8.78-13.92 17.67-2.98 6.21-4.5 11.41-5.27 18.18-1.19 4.68-1.57 9.62-1.95 14.35-1.66 5.84 0.43 12.8 3.22 19.62 3.33 8.28 3.62 14.12 9.12 22.91 7.1 12.06 10.62 18.78 27.83 35.58 6.27 6.12 11.35 10.04 17.28 17.15 6.77 7.4 12.27 12.56 20.9 18.59 7.91 5.65 10.55 8 17.32 14.77 5.83 5.84 10.97 10.95 15.97 17.81 2.11 3.42 3.82 5.68 6.42 5.68-0.2 1.19-0.24 1.91-0.05 3.06h1.06c0.82-1.97 1.25-3.99 3.45-6.15 1.62-3.87 9.24-11.37 12.67-15.19 7.37-7.4 10.36-10.4 19.39-18.15 6.03-5.51 11.06-9.95 16.9-16.45 6.26-6.5 15.84-15.15 22.96-20.61 7.91-6.07 12.9-14.3 17.94-20.28 4.08-5.46 8.62-13.4 10.05-17.17 7.76-13.27 16.06-36.77 15.31-50.04zm-234.8 10.49 0.24 0.24v6.22l-0.24-0.43v-6.03zm149.7-65.68 10.53-1.3 0.23 0.24-10.76 1.58v-0.52zm79.53 48.9 1.01 4.23-0.33 2.86-0.68-7.09zm-0.2 23.24 0.39-7.74 0.53-7.99 0.53 1.29-1.45 14.44zm-4.59-1.88c-1.91 10.33-3.26 19.63-9.43 30.62-6.77 12.06-16.44 22.58-26.07 36.01-6.17 5.51-11.21 13.35-19.84 19.85-5.65 4.95-11.3 10.26-16.34 12.96-11.03 8.74-21.43 18.43-37.13 36.18-4.49-4.49-7.82-10.71-12.81-15.25-12.48-11.03-21.41-22.94-35.18-32.34l0.48 0.48 0.58 0.92-2.29-1.4c-7.91-4.99-17.08-14.48-23.75-20.09-8.17-7.16-14.05-16.5-22.01-26.78 8.35 7.94 14.92 16.78 23.41 22.99l-0.82-1.72c-10.4-11.6-21.33-20.7-30.81-36.3-5.65-8.89-7.09-17.49-8.28-29.55-0.38-8.89 2.01-17.83 5.29-27.81 1.86-9.98 9.07-18.07 18.94-23.53 12.48-7.6 21.41-13.11 31.38-13.2 3.67-0.04 7.29 0.57 10.91 0.9 12.96 3.43 25.24 10.1 32.91 18.99 3.42 3.97 6.99 7.74 8.76 10.69-1.71 2.02-2.53 4.32-2.67 7.22l1.19-0.19c1.39-1.58 1.68-3.11 2.69-4.51 2.2 1.01 3.86-0.47 5.72-5.31 1.4-3.17 4.54-6.07 8.06-9.5 10.98-10.48 20.41-15.58 30.33-16.5 10.67-1.93 21.53-2.17 31.57 0.33 8.58 1.3 14.23 6.61 20.7 13.28 4.9 4.49 8.32 10 11.75 15.56 3.67 6.77 3.62 27.38 2.76 37zm-6.57-20.65c-0.64-7.75-5.18-14.71-11.06-22.99-4.24-5.56-8.58-7.63-14.08-9.02l0.48 0.82c5.55 2.64 10.04 6.71 14.48 15.17 3.67 5.15 6.65 11.13 7.47 18.34 1.34 11.86-0.48 27.21-4.57 38.24-2.2 5.26-4.16 9.59-6.45 12.82 9.43-9.78 14.98-26.8 13.73-53.38zm-89.73-16.44-0.28 0.42c6.57-7.89 13.34-14.15 21.84-16.4 7.66-2.16 16.11-2.93 24.7-5.18l-0.44-0.29c-5.73-1.06-8.92-1.15-15.49 0.19-11.03 2.25-19.77 8-30.33 21.26zm74.19-27.78c5.25 2.51 10.05 6.33 11.44 11.32-3.82-4.5-8.16-8.47-11.44-11.32zm-21.8-5.39 3.77 0.38-0.43 0.24-3.34-0.62zm8.17 1.78 1.57 0.33-0.34 0.24-1.23-0.57zm-14.06-1.4 0.82 0.14-0.29 0.19-0.53-0.33zm27.5 126.6-1.3 1.62 0.96-1.72 0.34 0.1zm-2.55 2.3c-3.03 5.1-5.77 8.87-11.84 12.64 4.49-4.01 8.78-8.2 11.84-12.64zm-143-119c-10 0.82-17.62 3.9-24.89 10.2-6.22 4.78-10.04 9.51-11.34 14.62l0.68-0.24c2.39-5.75 8.23-10.75 17.35-16.4 6.17-3.87 12.34-6.27 18.17-7.08 1.3-0.43 2.31-0.86 2.84-1.39-0.73-0.19-1.74-0.1-2.81 0.29zm-3.13 9.91c-6.87 0.91-11.72 3.5-15.39 7.58l-0.14 0.96 1.39-0.14c4.65-3.77 8.69-6.36 15.05-7.71l-0.09-0.59-0.82-0.1zm21.63-6.74c-3.43-2.25-6.75-2.49-9.4-1.06l-0.09 0.62c2.11 1.39 4.85 1.77 7.83 2.15l2.65-0.38-0.99-1.33zm-63.45 89.53 0.39 0.62-0.24-0.14-0.15-0.48zm3.62-58.92c-5.5 12.62-6.69 32.84 0.43 47.62 2.74 6.12 11 15.42 15.64 22.09 1.96 2.3 4.16 4.12 6.26 5.27-10.41-14.15-23.81-35.61-24.99-52.01-0.53-7.21 0.57-14.95 3.07-23.94l-0.41-1.19v2.16zm10.13 37.72c-3.03-5.89-4.79-12.1-4.79-16.59l-0.87 1.2c-0.86 6.21 2.02 14.25 5.54 20.18l1.01 0.24-0.89-5.03zm8.68 17.33c1.3 5.75 4.92 9.93 8.79 13.7l-0.39-2.12c-1.96-5.3-3.25-7.13-8.4-11.58zm10.7 26.78c1.96 4.64 4.7 7.59 8.13 10.09l-0.24-0.92c-1.96-3.87-4.46-6.51-7.89-9.17zm65.64 66.07c-4.24-8.37-10.75-16.11-17.75-20.84-9.12-6.72-14.62-13.03-29.92-24.73l0.82 2.07c10.92 11.5 22.4 20.7 33.98 31.83 4.49 4.49 8.36 9.17 11.79 12.19l1.08-0.52zm38.79-40.78c-8.74 7.4-19.55 15.86-23.94 22.97-2.98 4.44-4.99 7.87-6 8.83l0.24 0.05c4.24-4.94 7.17-11.11 14.29-16.52 5.3-4.83 10.54-9.73 15.58-15.33h-0.17zm40.3-30.1c-9.82 12.5-19.74 25.17-33.3 35.41-12.53 8.6-25.64 20.66-35.61 34.09l-0.33 1.01 1.1-0.19c8.63-12.06 19.2-23.39 31.38-32.53 12.76-9.19 21.69-17.18 36.04-35.92l1.01-2.79-0.29 0.92zm-20.13 10-11.54 11.86 0.24 0.72 1.3-0.57c4.49-3.48 8.46-7.87 10.8-12.01h-0.8zm33.09-94.92c4.9 7.11 5.81 16.26 4.24 26.73-0.14 6.31-0.96 13.03-2.48 20.29 3.42-9.19 6.31-19.17 5.45-26.38-0.82-8.65-3.51-16.68-7.21-20.64zm-2.89 61.63c-1.96 2.8-3.4 6.02-5.64 10.21 3.67-1.72 6.06-6.21 7.26-10.4l-0.63-1.01-0.99 1.2zm-138.9 59.87 9.82 11.03 11.53 10.33-12.76-11.34-8.59-10.02z" />
      </ShapedStat>
      <ShapedStat className="-translate-y-1" filled label="Armor" name="armor" viewBox="0 0 208 208">
        {/* Shield — QuiverAI Arrow (evenodd hollows interior between outer+inner paths) */}
        <g fillRule="evenodd">
          <path d="m179.5 52.4c-0.42-6.51-0.55-19.59-1.85-21.33-0.89-1.24-1.27-0.51-4.5-0.21-4.4 0.41-9.99 0-14.6-0.41l-5.59 4.2-2.75-5.63c-17.05-5.22-28.91-8.01-45.96-24.1-1.1-1.06-0.89-0.92-0.89-0.92s-10.21 10.78-22.69 15.93c-2.64 1.13-3.22 7.36-3.43 7.88l-4.98-3c-3.03-0.46-11.28 4.32-23.97 5.75-8.36 0.96-11.91 0.35-17.82 0-2.48 4.15-2.75 19.35-2.75 24.71-0.16 1.79-0.47 13.64 1.38 24.42l4.87 4.46-3.82 4.09c0 5.78 3.61 21.71 7.54 31.51 4.66 11.85 9.8 19.16 7 36.91l0.1 0.68c7.06 1.43 16.04 7.61 21.84 15.8 1.85 1.64 4.33 1.79 8.26 1.17-0.63 2.74-0.89 4.27-0.32 6.43 11.91 12.21 20.38 18.72 29.52 22.87 7.06-3.79 14.88-8.71 20.68-14.13l-1.14-5.79 6.22 1.13c10.42-9.01 17.53-23.73 32.97-27.74 0.73-0.47 0.11-1.65-0.31-3.76-1.3-8.4 1.24-16.1 5.49-26.1 5.15-12.21 8.7-29.13 9.75-40.6l-3.93-3.79 4.61-5.68c0.73-1.23 0.83-16.69 1.1-24.75z" />
          <path d="m164.9 49.28-1.15 0.21 0.11-4.2-1.05-0.92c-7.93-0.92-15.09-1.12-20.79-3.86l-3.94-3.16 0.63-2.26-0.73-0.92-0.94 0.31-0.42 1.64 1.05 3.79-0.42 0.41-4.25-2.06c-11.05-4.35-21.8-10.13-29.28-15.1l-1.45 1.12 0.21-1.53c-12.58 8.65-25.82 16.79-42.33 18.95l-7.48 1.95-7.93 0.21c-3.61 10.15-2.46 28.15 0.08 43.92 1.45 9.01 2.39 13.67 3.23 18.23l-3.23 6.18-0.52 2.74 1.65-0.31 1.75-0.61 3.5 2.55 7.93 22.14-0.32 10.46c6.32 0.62 9.93 3.88 15.73 11.78l-1.26 0.2 1.46 1.53c8.03 6.18 16.5 15.43 28.87 23.78 12.47-7.84 23.22-19.23 31.25-29.9 3.83-4.25 8.59-7.7 13.83-8.32-1.25-8.04-0.72-12.04 3.42-20.44 6.85-14.12 9.6-28.45 12.78-54.78 0.84-6.23 0.84-15.98-0.01-23.73z" />
        </g>
      </ShapedStat>
      <ShapedStat filled label="Damage" name="damage" viewBox="0 0 256 256">
        {/* Die (d4) — QuiverAI Arrow */}
        <path d="M 128.2,7.26 L 128.41,8.17 L 131.91,10.96 C 132.94,12.97 135.94,16.64 137.79,18.83 C 140.72,22.38 144.36,28.21 147.21,32.25 C 150.29,36.74 152.81,41.21 156.57,45.81 C 160.63,50.81 164.77,57.06 168.42,62.27 C 169.84,65.71 172.16,67.91 173.73,70.62 C 176.98,74.92 179.99,79.75 183.41,84.22 C 188.08,90.74 193.28,97.78 199.27,105.03 L 200.84,106.96 L 213.68,125.26 L 213.91,126.32 L 213.42,126.81 L 213.78,127.72 C 213.29,131.08 209.98,136.08 206.71,140.61 C 202.92,144.71 199.98,149.67 196.08,154.37 C 194.76,155.79 192.74,158.51 191.45,160.97 L 190.07,162.76 L 188.79,165.04 L 183.72,171.77 L 180.41,177.67 L 179.32,178.82 L 174.42,186.94 L 171.45,191.23 L 170.26,192.61 L 162.68,203.82 L 159.12,208.29 L 157.87,210.22 L 148.29,222.16 L 143.82,228.72 L 143.33,229.08 L 136.89,239.91 L 130.42,248.71 L 129.21,249.86 L 128.41,249.62 L 127.95,250 L 126.92,249.76 L 126.53,249.93 L 126.39,248.41 L 124.82,247.7 C 122.37,245.76 120.25,243.34 118.19,240.62 C 115.94,238.33 113.92,234.78 111.54,231.92 L 110.22,229.63 L 109.73,229.21 L 109.21,227.79 L 108.28,226.81 L 107.89,225.83 L 90.86,200.81 L 87.62,195.95 L 85.91,193.36 L 83.01,188.82 L 77.22,181.12 L 73.32,175.36 L 67.05,166.73 L 53.02,148.36 L 41.75,131.42 L 41.36,129.42 L 42.75,126.22 C 44.84,120.78 49.81,114.64 54.11,109.1 L 57.73,103.79 L 58.82,102.51 L 68.47,89.01 L 70.18,86.15 L 71.46,84.73 L 74.08,80.26 L 76.37,77.13 L 77.49,75.85 L 82.43,68.81 L 82.73,67.76 L 87.13,61.55 L 88.06,60.23 L 93.16,52.88 L 98.33,45.91 L 107.49,33.9 L 110.73,28.72 L 111.22,28.08 L 111.46,27.1 L 116.29,19.61 L 122.63,10.41 L 125.6,6.61 L 127.11,7.06 L 128.2,7.26 Z M 127.27,18.19 L 117.72,33.06 L 108.69,46.7 L 102.81,54.19 L 101.06,56.91 L 100.04,57.96 L 98.82,60.06 L 94.72,65.38 L 94.42,65.55 L 94.62,66.03 L 89.07,73.82 L 83.52,82.62 L 81.78,85.01 L 78.35,88.91 L 77.86,90.33 L 73.22,97.51 L 72.92,97.78 L 72.69,98.62 L 65.11,109.45 L 64.62,110.39 L 56.34,122.23 L 51.61,128.23 L 53.12,129.01 C 54.93,130.81 56.71,133.84 58.66,136.46 C 61.97,140.72 64.71,146.26 67.95,151.22 C 70.08,155.19 73.64,159.48 76.57,164.05 C 79.13,167.21 81.68,171.47 84.45,175.3 C 87.01,177.92 89.16,182.18 91.94,185.04 L 92.83,186.02 L 96.11,190.62 L 97.78,192.55 L 103.92,201.11 L 105.01,202.33 L 116.11,218.26 L 119.01,222.73 L 120.72,225.86 L 125.69,235.06 L 127.81,237.12 L 138.91,218.26 L 143.88,211.01 L 145.07,209.42 L 149.61,202.63 L 153.74,197.77 L 161.02,187.69 L 162.41,186.2 L 169.01,176.46 L 173.81,169.21 L 176.81,165.7 L 177.51,164.18 L 183.65,153.72 L 186.03,150.56 L 195.16,137.51 L 198.92,132.91 L 199.78,132.23 L 203.44,127.86 L 191.72,111.42 L 190.92,109.62 L 189.9,108.71 L 189.76,107.73 L 188.9,107.09 L 184.53,100.33 L 178.19,91.13 L 176.31,88.71 L 175.22,87.56 L 172.15,82.6 L 167.18,76.7 L 164.11,72.23 L 161.14,68.72 L 155.42,61.23 L 152.87,57.22 L 145.42,47.55 L 144.56,45.86 L 136.21,33.82 L 135.09,32.4 L 132.47,27.44 L 127.27,18.19 Z" />
      </ShapedStat>
    </div>
  );
}

function ShapedStat({
  children,
  className,
  filled,
  label,
  name,
  viewBox = "0 0 48 48",
}: {
  children: React.ReactNode;
  className?: string;
  filled?: boolean;
  label: string;
  name: string;
  viewBox?: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[9px] font-bold tracking-wider text-stone-500 dark:text-stone-400 mb-0.5">
        {label}
      </span>
      <div className="relative w-20 h-20">
        <svg
          className="absolute inset-0 w-full h-full text-stone-400 dark:text-stone-500 print:text-stone-500"
          fill={filled ? "currentColor" : "none"}
          stroke={filled ? "none" : "currentColor"}
          strokeLinejoin="round"
          strokeWidth={filled ? undefined : 1.5}
          viewBox={viewBox}
        >
          {children}
        </svg>
        <input
          className={cn(
            "absolute inset-0 w-full h-full text-center font-hand text-3xl bg-transparent text-stone-800 dark:text-stone-200 focus:outline-none",
            className,
          )}
          name={name}
          type="text"
        />
      </div>
    </div>
  );
}

// -- Right Page: Advancement, Bonds, Inventory, Moves --

function RightPage() {
  return (
    <div className="md:pl-8 print:pl-8 space-y-5">
      <div className="flex gap-4">
        <InlineField label="Level" name="level" />
        <InlineField label="XP" name="xp" />
      </div>

      <BondLines />

      <SuppliesTrack />

      <div>
        <SectionLabel>Notable Possessions</SectionLabel>
        <div className="space-y-1.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <BlankLine key={i} name={`possession-${i}`} />
          ))}
        </div>
      </div>

      <AcquiredMoves />
    </div>
  );
}

function BondLines() {
  return (
    <div>
      <SectionLabel>Bonds</SectionLabel>
      <div className="space-y-1.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <BlankLine key={i} name={`bond-${i}`} />
        ))}
      </div>
    </div>
  );
}

function SuppliesTrack() {
  const supplies = [
    { count: 3, name: "Rations" },
    { count: 3, name: "Bandages" },
    { count: 3, name: "Ammo" },
    { count: 5, name: "Adventuring Gear" },
  ];

  return (
    <div>
      <SectionLabel>Supplies</SectionLabel>
      <div className="space-y-1.5">
        {supplies.map((s) => (
          <div className="flex items-center gap-2" key={s.name}>
            <span className="text-sm text-stone-700 dark:text-stone-300 shrink-0 whitespace-nowrap">
              {s.name}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: s.count }).map((_, i) => (
                <input
                  className="size-3.5"
                  key={i}
                  name={`supply-${s.name.toLowerCase().replaceAll(" ", "-")}-${i}`}
                  type="checkbox"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AcquiredMoves() {
  return (
    <div>
      <SectionLabel>Moves</SectionLabel>
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div className="flex items-start gap-2" key={i}>
            <input
              className="size-3 shrink-0 mt-1.5"
              name={`move-check-${i}`}
              type="checkbox"
            />
            <textarea
              className="flex-1 bg-transparent border-b border-stone-300 dark:border-stone-600 print:border-stone-400 font-hand text-base text-stone-800 dark:text-stone-200 focus:outline-none focus:border-stone-500 resize-none [field-sizing:content] print:min-h-10"
              name={`move-name-${i}`}
              rows={1}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// -- Shared Utilities --

function InlineField({
  label,
  large,
  name,
}: {
  label: string;
  large?: boolean;
  name: string;
}) {
  return (
    <label className="flex items-baseline gap-2 flex-1">
      <span
        className={cn(
          "font-bold tracking-wide text-stone-700 dark:text-stone-300 shrink-0 whitespace-nowrap translate-y-0.5",
          large ? "text-base" : "text-sm"
        )}
      >
        {label}
      </span>
      <input
        className={cn(
          "flex-1 min-w-0 bg-transparent border-b border-stone-300 dark:border-stone-600 print:border-stone-400",
          "font-hand text-stone-800 dark:text-stone-200",
          "focus:outline-none focus:border-stone-500",
          large ? "text-2xl" : "text-xl"
        )}
        name={name}
        type="text"
      />
    </label>
  );
}

function BlankLine({ name }: { name: string }) {
  return (
    <input
      className="w-full bg-transparent border-b border-stone-300 dark:border-stone-600 print:border-stone-400 font-hand text-xl text-stone-800 dark:text-stone-200 focus:outline-none focus:border-stone-500"
      name={name}
      type="text"
    />
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-bold tracking-wider text-stone-500 dark:text-stone-400 mb-2">
      {children}
    </h3>
  );
}
