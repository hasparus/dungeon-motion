import { useRef, useState } from "react";

import { cn } from "./cn";
import { GrainOverlay } from "./grain-overlay";
import { PortraitCanvas, type PortraitCanvasHandle } from "./portrait-canvas";

export function CharacterSheet() {
  return (
    <form className="min-h-screen">
      <GrainOverlay />

      <header className="print:hidden text-center mb-8 px-6">
        <h1 className="text-xl font-bold tracking-wide text-stone-800 dark:text-stone-200">
          character sheet
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          <a href="/">moves compendium</a>
          {" · "}
          <a href="/hogtown-truths">world truths</a>
        </p>
      </header>

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
      <InlineField label="Drive" name="drive" />
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
      <ShapedStat label="HP" name="hp">
        {/* Heart */}
        <path d="M24 43C24 43 5 31 5 18C5 10 10 4 16 4C20.5 4 23 7 24 10C25 7 27.5 4 32 4C38 4 43 10 43 18C43 31 24 43 24 43Z" />
      </ShapedStat>
      <ShapedStat label="Armor" name="armor">
        {/* Shield / escutcheon */}
        <path d="M6 5L42 5L42 28Q42 43 24 47Q6 43 6 28Z" />
      </ShapedStat>
      <ShapedStat label="Damage" name="damage">
        {/* Die (d6 face with corner pips) */}
        <rect height="38" rx="5" width="38" x="5" y="5" />
        <circle cx="15" cy="15" fill="currentColor" opacity="0.15" r="2.5" stroke="none" />
        <circle cx="33" cy="15" fill="currentColor" opacity="0.15" r="2.5" stroke="none" />
        <circle cx="15" cy="33" fill="currentColor" opacity="0.15" r="2.5" stroke="none" />
        <circle cx="33" cy="33" fill="currentColor" opacity="0.15" r="2.5" stroke="none" />
      </ShapedStat>
    </div>
  );
}

function ShapedStat({
  children,
  label,
  name,
}: {
  children: React.ReactNode;
  label: string;
  name: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[9px] font-bold tracking-wider text-stone-500 dark:text-stone-400 mb-0.5">
        {label}
      </span>
      <div className="relative w-16 h-16">
        <svg
          className="absolute inset-0 w-full h-full text-stone-400 dark:text-stone-500 print:text-stone-500"
          fill="none"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.5"
          viewBox="0 0 48 48"
        >
          {children}
        </svg>
        <input
          className="absolute inset-0 w-full h-full pt-1 text-center font-hand text-xl bg-transparent text-stone-800 dark:text-stone-200 focus:outline-none"
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
