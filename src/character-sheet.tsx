import type React from "react";

import { useRef, useState } from "react";

import { cn } from "./cn";
import { GrainOverlay } from "./grain-overlay";
import { PortraitCanvas, type PortraitCanvasHandle } from "./portrait-canvas";
import { generateVillager, type Villager } from "./villager-generator";

const SHEETS_KEY = "dungeon-motion-sheets";
type SheetData = Record<string, boolean | string>;

function getSheets(): Record<string, SheetData> {
  try {
    return JSON.parse(localStorage.getItem(SHEETS_KEY) || "{}");
  } catch {
    return {};
  }
}

function serializeForm(): SheetData {
  const form = document.querySelector("form");
  if (!form) return {};
  const data: SheetData = {};
  for (const el of form.elements) {
    const field = el as
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement;
    if (!field.name) continue;
    data[field.name] =
      field instanceof HTMLInputElement && field.type === "checkbox"
        ? field.checked
        : field.value;
  }
  const portrait = localStorage.getItem("dungeon-motion-portrait");
  if (portrait) data["__portrait__"] = portrait;
  return data;
}

function applySheet(data: SheetData) {
  const form = document.querySelector("form");
  if (!form) return;
  for (const el of form.elements) {
    const field = el as
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement;
    if (!field.name || !(field.name in data)) continue;
    if (field instanceof HTMLInputElement && field.type === "checkbox") {
      field.checked = data[field.name] as boolean;
    } else {
      field.value = data[field.name] as string;
    }
  }
  if (typeof data["__portrait__"] === "string") {
    localStorage.setItem("dungeon-motion-portrait", data["__portrait__"]);
  }
  form.dispatchEvent(new Event("input", { bubbles: true }));
  form
    .querySelector('input[type="checkbox"]')
    ?.dispatchEvent(new Event("change", { bubbles: true }));
}

function SheetControls() {
  const [names, setNames] = useState<string[]>(() => Object.keys(getSheets()));
  const [saved, setSaved] = useState(false);

  return (
    <div className="fixed top-3 right-3 print:hidden flex items-center gap-1 z-50">
      <button
        className="text-[10px] tracking-widest uppercase text-stone-400/70 dark:text-stone-500/70 hover:text-stone-600 dark:hover:text-stone-300 focus-visible:text-stone-600 dark:focus-visible:text-stone-300 focus-visible:underline underline-offset-2 outline-none transition-colors cursor-pointer"
        onClick={(e) => {
          e.preventDefault();
          const v = generateVillager();
          const formatMod = (n: number) => (n >= 0 ? `+${n}` : `${n}`);
          const data: SheetData = {
            "char-name": v.name,
            "look": v.look,
            "background": `${v.species} ${v.occupation}`,
            "level": "0",
            "xp": "0",
            "stat-str": formatMod(v.modifiers.STR),
            "stat-dex": formatMod(v.modifiers.DEX),
            "stat-con": formatMod(v.modifiers.CON),
            "stat-int": formatMod(v.modifiers.INT),
            "stat-wis": formatMod(v.modifiers.WIS),
            "stat-cha": formatMod(v.modifiers.CHA),
            "hp": String(v.hp),
            "armor": "0",
            "damage": v.damage,
            "instinct": v.bond,
          };
          applySheet(data);
          // Fill gear into the first inventory slot area
          const form = document.querySelector("form");
          if (form) {
            const gearField = form.querySelector<HTMLTextAreaElement | HTMLInputElement>('[name="gear"]');
            if (gearField) gearField.value = v.gear.join(", ");
          }
        }}
        type="button"
      >
        [ Roll ]
      </button>
      <button
        className="text-[10px] tracking-widest uppercase text-stone-400/70 dark:text-stone-500/70 hover:text-stone-600 dark:hover:text-stone-300 focus-visible:text-stone-600 dark:focus-visible:text-stone-300 focus-visible:underline underline-offset-2 outline-none transition-colors cursor-pointer"
        onClick={(e) => {
          e.preventDefault();
          const data = serializeForm();
          const name = (data["char-name"] as string | undefined)?.trim();
          if (!name) return;
          const sheets = getSheets();
          sheets[name] = data;
          localStorage.setItem(SHEETS_KEY, JSON.stringify(sheets));
          setNames(Object.keys(sheets));
          setSaved(true);
          setTimeout(() => setSaved(false), 1500);
        }}
        type="button"
      >
        [ {saved ? "Saved" : "Save"} ]
      </button>
      <span className="text-stone-300/40 dark:text-stone-600/40 text-[10px]"></span>
      <select
        className="text-[10px] tracking-widest uppercase text-stone-400/70 dark:text-stone-500/70 hover:text-stone-600 dark:hover:text-stone-300 focus-visible:text-stone-600 dark:focus-visible:text-stone-300 focus-visible:underline underline-offset-2 outline-none transition-colors cursor-pointer bg-transparent appearance-none"
        onChange={(e) => {
          const name = e.currentTarget.value;
          if (!name) return;
          e.currentTarget.value = "";
          const sheets = getSheets();
          if (sheets[name]) applySheet(sheets[name]);
        }}
        onFocus={() => setNames(Object.keys(getSheets()))}
        value=""
      >
        <option value="">[ Load ]</option>
        {names.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </div>
  );
}

export function CharacterSheet() {
  return (
    <form autoComplete="off" className="min-h-screen">
      <GrainOverlay />
      <SheetControls />

      <div className="relative max-w-6xl mx-auto px-6 print:max-w-none print:mx-0 print:px-0">
        <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-8 md:gap-0 print:gap-0">
          <LeftPage />
          <RightPage />
        </div>
      </div>
    </form>
  );
}

function LeftPage() {
  return (
    <div className="md:pr-8 print:pr-8 md:border-r print:border-r border-dashed border-stone-300 dark:border-stone-600 print:border-stone-400 space-y-6">
      <div className="flex gap-6">
        <div className="flex-1 min-w-0 space-y-2">
          <InlineField label="Name" name="char-name" />
          <InlineField label="Look" name="look" />
          <InlineField label="Background" name="background" />
          <div className="flex gap-4">
            <InlineField label="Level" name="level" />
            <InlineField label="XP" name="xp" />
          </div>
          <CombatShapes className="mt-4" />
        </div>
        <div className="hidden md:block print:block">
          <PortraitFrame />
        </div>
      </div>
      <StatBlockWithDebilities />
      <InlineField label="Instinct" name="instinct" />
      <BondLines />
    </div>
  );
}

function PortraitFrame() {
  const canvasRef = useRef<PortraitCanvasHandle>(null);
  const [hasStrokes, setHasStrokes] = useState(false);

  return (
    <div className="shrink-0 w-36 self-stretch relative">
      <div className="absolute inset-0 border-[3px] border-double border-stone-700 dark:border-stone-300 print:border-stone-800 rounded-xl [corner-shape:superellipse(-1.1)] overflow-hidden">
        <PortraitCanvas onStrokesChange={setHasStrokes} ref={canvasRef} />
      </div>
      {hasStrokes && (
        <button
          className="absolute -top-2 -right-2 p-0.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 print:hidden"
          onClick={() => canvasRef.current?.clear()}
          title="Clear portrait"
          type="button"
        >
          <svg
            className="size-3.5"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

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
      <p className="font-hand text-stone-500 dark:text-stone-400 mb-3">
        <span className="font-serif font-bold tracking-wider text-stone-700 dark:text-stone-300 text-sm">
          Attributes
        </span>{" "}
        Assign +2, +1, +1, +0, +0, −1. Debility marked → roll with disadvantage.
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
        <span className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
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

function CombatShapes({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex justify-center items-end justify-self-start gap-1",
        className,
      )}
    >
      <ShapedStat
        className="-translate-y-1.5 -translate-x-px"
        label="HP"
        name="hp"
        viewBox="0 -20 250 270"
      >
        <path
          d="m239.61 70.33c-1.91 10.33-3.26 19.63-9.43 30.62-6.77 12.06-16.44 22.58-26.07 36.01-6.17 5.51-11.21 13.35-19.84 19.85-5.65 4.95-11.3 10.26-16.34 12.96-11.03 8.74-21.43 18.43-37.13 36.18-4.49-4.49-7.82-10.71-12.81-15.25-12.48-11.03-21.41-22.94-35.18-32.34l0.48 0.48 0.58 0.92-2.29-1.4c-7.91-4.99-17.08-14.48-23.75-20.09-8.17-7.16-14.05-16.5-22.01-26.78 8.35 7.94 14.92 16.78 23.41 22.99l-0.82-1.72c-10.4-11.6-21.33-20.7-30.81-36.3-5.65-8.89-7.09-17.49-8.28-29.55-0.38-8.89 2.01-17.83 5.29-27.81 1.86-9.98 9.07-18.07 18.94-23.53 12.48-7.6 21.41-13.11 31.38-13.2 3.67-0.04 7.29 0.57 10.91 0.9 12.96 3.43 25.24 10.1 32.91 18.99 3.42 3.97 6.99 7.74 8.76 10.69-1.71 2.02-2.53 4.32-2.67 7.22l1.19-0.19c1.39-1.58 1.68-3.11 2.69-4.51 2.2 1.01 3.86-0.47 5.72-5.31 1.4-3.17 4.54-6.07 8.06-9.5 10.98-10.48 20.41-15.58 30.33-16.5 10.67-1.93 21.53-2.17 31.57 0.33 8.58 1.3 14.23 6.61 20.7 13.28 4.9 4.49 8.32 10 11.75 15.56 3.67 6.77 3.62 27.38 2.76 37z"
          strokeWidth="7"
        />
      </ShapedStat>
      <ShapedStat
        className="-translate-y-1"
        label="Armor"
        name="armor"
        viewBox="28 20 160 178"
      >
        <path
          d="m164.9 49.28-1.15 0.21 0.11-4.2-1.05-0.92c-7.93-0.92-15.09-1.12-20.79-3.86l-3.94-3.16 0.63-2.26-0.73-0.92-0.94 0.31-0.42 1.64 1.05 3.79-0.42 0.41-4.25-2.06c-11.05-4.35-21.8-10.13-29.28-15.1l-1.45 1.12 0.21-1.53c-12.58 8.65-25.82 16.79-42.33 18.95l-7.48 1.95-7.93 0.21c-3.61 10.15-2.46 28.15 0.08 43.92 1.45 9.01 2.39 13.67 3.23 18.23l-3.23 6.18-0.52 2.74 1.65-0.31 1.75-0.61 3.5 2.55 7.93 22.14-0.32 10.46c6.32 0.62 9.93 3.88 15.73 11.78l-1.26 0.2 1.46 1.53c8.03 6.18 16.5 15.43 28.87 23.78 12.47-7.84 23.22-19.23 31.25-29.9 3.83-4.25 8.59-7.7 13.83-8.32-1.25-8.04-0.72-12.04 3.42-20.44 6.85-14.12 9.6-28.45 12.78-54.78 0.84-6.23 0.84-15.98-0.01-23.73z"
          strokeWidth="5"
        />
      </ShapedStat>
      <ShapedStat label="Damage" name="damage" viewBox="30 0 196 256">
        <path
          d="M 127.27,18.19 L 117.72,33.06 L 108.69,46.7 L 102.81,54.19 L 101.06,56.91 L 100.04,57.96 L 98.82,60.06 L 94.72,65.38 L 94.42,65.55 L 94.62,66.03 L 89.07,73.82 L 83.52,82.62 L 81.78,85.01 L 78.35,88.91 L 77.86,90.33 L 73.22,97.51 L 72.92,97.78 L 72.69,98.62 L 65.11,109.45 L 64.62,110.39 L 56.34,122.23 L 51.61,128.23 L 53.12,129.01 C 54.93,130.81 56.71,133.84 58.66,136.46 C 61.97,140.72 64.71,146.26 67.95,151.22 C 70.08,155.19 73.64,159.48 76.57,164.05 C 79.13,167.21 81.68,171.47 84.45,175.3 C 87.01,177.92 89.16,182.18 91.94,185.04 L 92.83,186.02 L 96.11,190.62 L 97.78,192.55 L 103.92,201.11 L 105.01,202.33 L 116.11,218.26 L 119.01,222.73 L 120.72,225.86 L 125.69,235.06 L 127.81,237.12 L 138.91,218.26 L 143.88,211.01 L 145.07,209.42 L 149.61,202.63 L 153.74,197.77 L 161.02,187.69 L 162.41,186.2 L 169.01,176.46 L 173.81,169.21 L 176.81,165.7 L 177.51,164.18 L 183.65,153.72 L 186.03,150.56 L 195.16,137.51 L 198.92,132.91 L 199.78,132.23 L 203.44,127.86 L 191.72,111.42 L 190.92,109.62 L 189.9,108.71 L 189.76,107.73 L 188.9,107.09 L 184.53,100.33 L 178.19,91.13 L 176.31,88.71 L 175.22,87.56 L 172.15,82.6 L 167.18,76.7 L 164.11,72.23 L 161.14,68.72 L 155.42,61.23 L 152.87,57.22 L 145.42,47.55 L 144.56,45.86 L 136.21,33.82 L 135.09,32.4 L 132.47,27.44 L 127.27,18.19 Z"
          strokeWidth="6"
        />
      </ShapedStat>
    </div>
  );
}

function ShapedStat({
  children,
  className,
  label,
  name,
  viewBox = "0 0 48 48",
}: {
  children: React.ReactNode;
  className?: string;
  label: string;
  name: string;
  viewBox?: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xs font-bold tracking-wider text-stone-500 dark:text-stone-400 mb-0.5">
        {label}
      </span>
      <div className="relative size-28">
        <svg
          className="absolute inset-0 w-full h-full text-stone-400 dark:text-stone-500 print:text-stone-500"
          fill="none"
          stroke="currentColor"
          strokeLinejoin="round"
          viewBox={viewBox}
        >
          {children}
        </svg>
        <input
          className={cn(
            "absolute inset-0 w-full h-full text-center font-hand text-5xl bg-transparent text-stone-800 dark:text-stone-200 focus:outline-none -translate-x-1.5",
            className,
          )}
          name={name}
          type="text"
        />
      </div>
    </div>
  );
}

function RightPage() {
  return (
    <div className="md:pl-8 print:pl-8 space-y-5">
      <SuppliesTrack />

      <div>
        <SectionLabel>Gear</SectionLabel>
        <div className="space-y-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
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
        {Array.from({ length: 8 }).map((_, i) => (
          <div className="flex items-start gap-2" key={i}>
            <input
              className="size-4 shrink-0 mt-px"
              name={`move-check-${i}`}
              type="checkbox"
            />
            <textarea
              className="flex-1 bg-transparent border-b border-stone-300 dark:border-stone-600 print:border-stone-400 font-hand text-base text-stone-800 dark:text-stone-200 focus:outline-none focus:border-stone-500 resize-none overflow-visible py-1 print:min-h-10 first-line:font-serif leading-none field-sizing-content"
              name={`move-name-${i}`}
              onChange={(event) => {
                const textarea = event.currentTarget;
                textarea.scrollTop = 0;
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// -- Shared Utilities --

function InlineField({
  className,
  label,
  name,
}: {
  className?: string;
  label: string;
  name: string;
}) {
  return (
    <label className={cn("flex items-baseline gap-2 flex-1", className)}>
      <span className="font-bold tracking-wide text-stone-700 dark:text-stone-300 shrink-0 whitespace-nowrapt text-sm">
        {label}
      </span>
      <input
        className={cn(
          "flex-1 w-0 bg-transparent border-b border-stone-300 dark:border-stone-600 print:border-stone-400 leading-none",
          "font-hand text-stone-800 dark:text-stone-200",
          "focus:outline-none focus:border-stone-500",
          "text-2xl leading-none",
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
    <h3 className="text-sm font-serif font-bold tracking-wide text-stone-700 dark:text-stone-300 mb-2">
      {children}
    </h3>
  );
}
