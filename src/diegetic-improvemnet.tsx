import { MoveCard } from "./move-card";
import { Trigger } from "./trigger";

export function DiegeticImprovement({ className }: { className?: string }) {
  return (
    <section className={className}>
      <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 tracking-wide mb-4">
        Diegetic Improvement
      </h2>

      <p className="text-stone-700 dark:text-stone-300 mb-4">
        In most RPGs, you pick abilities from a list when you level up. You scan
        the options, choose what sounds useful, and your character can suddenly
        do a new thing. It works, but it has nothing to do with what actually
        happened in the game.
      </p>

      <p className="text-stone-700 dark:text-stone-300 mb-4">
        What if the fiction came first?
      </p>

      <p className="text-stone-700 dark:text-stone-300 mb-4">
        Find a legendary weapon in a tomb, and now Wielder moves are available.
        Get beaten by a werewolf, vampire or radioactive spider, and the Monster
        Compendium opens up. Events of the game create new mechanics.
      </p>

      <p className="text-stone-700 dark:text-stone-300 mb-4">
        <strong>Learn and Grow</strong> is the move that handles this. When
        something happens that could change your character, you talk to the GM
        about what move fits. Sometimes it unlocks immediately. Sometimes there
        are steps: training, a ritual, time. Your character is becoming someone
        through what they go through.
      </p>

      <MoveCard id="learnAndGrow" isBaseMove title="Learn and Grow">
        <p>
          When you{" "}
          <Trigger>go through something that could change who you are</Trigger>,
          discuss with the table what move or compendium fits. The GM will tell
          you it's unlocked, or give you steps to unlock it.
        </p>
        <p className="mt-2">
          When you <Trigger>have an unlocked move and XP to spend</Trigger>,
          erase 7 + your current level in XP, gain the move, and increase your
          level by 1.
        </p>
      </MoveCard>
    </section>
  );
}
