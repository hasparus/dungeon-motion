// Hogtown Villager Generator — browser version (no fs)
// Ported from hasparus/hogtown-villager-generator

import bondRows from "./data/bonds.json";
import lookRows from "./data/looks.json";
import nameRows from "./data/names.json";
import occupationRows from "./data/occupations.json";

type Species = "Dwarf" | "Elf" | "Halfling" | "Human";

export interface Villager {
  bond: string;
  damage: string;
  gear: string[];
  heritageMoves: string[];
  hp: number;
  load: number;
  look: string;
  modifiers: Record<string, number>;
  name: string;
  occupation: string;
  species: Species;
  stats: Record<string, number>;
}

type Dice = `${number}d${number}`;

function roll(dice: Dice): number {
  const [count, sides] = dice.split("d").map(Number);
  let sum = 0;
  for (let i = 0; i < count; i++) sum += Math.floor(Math.random() * sides) + 1;
  return sum;
}

function getMod(score: number): number {
  if (score === 3) return -3;
  if (score <= 5) return -2;
  if (score <= 8) return -1;
  if (score <= 12) return 0;
  if (score <= 15) return 1;
  if (score <= 17) return 2;
  return 3;
}

const CROPS = ["barley","onions","peppers","potatoes","squash","rice","wheat","hops","beets","oats"];
const INSTRUMENTS = ["accordion (2 wt)","drum (1 wt)","fiddle (1 wt)","flute","guitar (1 wt)","mbira","horn (1 wt)","banjo (1 wt)"];
const ANIMAL_TRAINER_GEAR = ["leather gauntlet, falcon","2 dogs, leashes","monkey, music box (2 wt)","cage (1 wt), 2 ferrets"];

function expandGearTemplate(template: string): string {
  return template
    .replaceAll(/\{(\d+)d(\d+)\}/g, (_, count, sides) => String(roll(`${count}d${sides}` as Dice)))
    .replaceAll('{2+1d4*2}', () => String(2 + roll("1d4") * 2))
    .replaceAll('{crop}', () => CROPS[roll("1d10") - 1])
    .replaceAll('{instrument}', () => INSTRUMENTS[roll("1d8") - 1])
    .replaceAll('{animal_trainer_gear}', () => ANIMAL_TRAINER_GEAR[roll("1d4") - 1])
    .replaceAll('{poultry}', () => {
      const birds = [`${roll("1d6")} chickens`, `${roll("1d6")} ducks`, `${roll("1d4")} geese`, `${roll("1d4")} swans`];
      return birds[roll("1d4") - 1];
    });
}

function parseRange(s: string): [number, number] {
  const parts = s.split("-").map(Number);
  return parts.length === 1 ? [parts[0], parts[0]] : [parts[0], parts[1]];
}

function getOccupation(rollResult: number) {
  const row = (occupationRows as string[][]).find(([range]) => {
    const [min, max] = parseRange(range);
    return rollResult >= min && rollResult <= max;
  })!;
  return { gear: expandGearTemplate(row[2]), name: row[1], species: (row[3] as Species) || "Human" };
}

function getName(species: Species): string {
  const r = roll("1d20") - 1;
  const row = (nameRows as string[][])[r];
  switch (species) {
    case "Dwarf": return row[5];
    case "Elf": return row[4];
    case "Halfling": return row[6];
    default: return row[roll("1d3")];
  }
}

function getLook(): string {
  const rows = lookRows as string[][];
  const [face, eyes, hair, body, clothing] = [
    rows[roll("1d20") - 1][1],
    rows[roll("1d20") - 1][2],
    rows[roll("1d20") - 1][3],
    rows[roll("1d20") - 1][4],
    rows[roll("1d20") - 1][5],
  ];
  return `${face.toLowerCase()} face, ${eyes.toLowerCase()} eyes, ${hair.toLowerCase()} hair, ${body.toLowerCase()} body, ${clothing.toLowerCase()} clothing`;
}

function getBond(): string {
  const row = (bondRows as string[][])[roll("1d20") - 1];
  const detail = row[roll("1d4")];
  return row[0].replace("...", detail);
}

function getHeritageMoves(species: Species): string[] {
  switch (species) {
    case "Dwarf":
      return ["Etched in Stone: When you appraise an artificial item, object, or location, the GM will tell you something interesting about the one who made it, no questions asked."];
    case "Elf":
      return ["These Elf Eyes: You see perfectly in the barest light and may focus your senses to Detect Magic at will."];
    case "Halfling":
      return ["Lucky: When you Tempt Fate and score a 10+ you don't suffer disadvantage and on a 12+ your luck rubs off; the nearest ally gains advantage on their next roll."];
    default:
      return [];
  }
}

export function generateVillager(): Villager {
  const stats: Record<string, number> = {
    CHA: roll("3d6"), CON: roll("3d6"), DEX: roll("3d6"),
    INT: roll("3d6"), LUC: roll("3d6"), STR: roll("3d6"), WIS: roll("3d6"),
  };
  const modifiers: Record<string, number> = {};
  for (const [k, v] of Object.entries(stats)) modifiers[k] = getMod(v);

  const occ = getOccupation(roll("1d100"));
  return {
    bond: getBond(),
    damage: "d4",
    gear: [occ.gear],
    heritageMoves: getHeritageMoves(occ.species),
    hp: modifiers.CON + 4,
    load: modifiers.STR + 4,
    look: getLook(),
    modifiers,
    name: getName(occ.species),
    occupation: occ.name,
    species: occ.species,
    stats,
  };
}
