import { CheckboxList } from "./checkbox-list";
import { Compendium, CompendiumProps } from "./compendium";
import { Divider } from "./divider";
import { MoveCard } from "./move-card";
import { Tag } from "./tag";
import { Trigger } from "./trigger";

export function MonsterCompendium(props: Omit<CompendiumProps, "title">) {
  return (
    <Compendium {...props} title="Monster Compendium">
      <div className="mt-4 grid md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div>
          <MoveCard
            className="pt-0 pb-0"
            id="metamorphosis"
            title="Metamorphosis"
          >
            <p>
              There's a monster inside you. When you{" "}
              <Trigger>reveal the monster within</Trigger> roll +CON:{" "}
              <strong>on a 7+</strong>, take on its traits, armament, moves,
              instinct, bane, etc; <strong>on a 10+</strong>, you needn't
              indulge your instinct or Defy Danger to revert back;{" "}
              <strong>on a 6-</strong>, as a 7+ but you lose yourself to your
              instinct. Mark XP and the GM will indulge it for you soon.
            </p>
          </MoveCard>

          <Divider />

          <div className="space-y-4">
            <h4 className="text-lg font-bold text-stone-800 dark:text-stone-100 tracking-wide max-md:flex-wrap">
              Traits <br />
              <span className="font-normal text-sm text-stone-500 dark:text-stone-400">
                pick 2 per bane plus <Tag>terrifying</Tag> and{" "}
                <Tag>unnatural</Tag>
              </span>
            </h4>
            <CheckboxList
              items={[
                "agile",
                "amorphous",
                "amphibious",
                "ancient",
                "ethereal",
                "fast",
                "gluttonous",
                "intelligent",
                "large",
                "magic",
                "powerful",
                "resilient",
                "sharp-eared",
                "sharp-eyed",
                "sharp-nosed",
                "small",
                "squamous",
                "stealthy",
                "terrifying",
                "tireless",
                "unnatural",
                "wild",
              ]}
              variant="traits"
            />
          </div>

          <Divider />

          <div className="space-y-3">
            <h4 className="text-lg font-bold text-stone-800 dark:text-stone-100 tracking-wide max-md:flex-wrap">
              Armament <br className="md:hidden" />
              <span className="font-normal text-sm text-stone-500 dark:text-stone-400">
                pick 2
              </span>
            </h4>
            <CheckboxList
              items={[
                <>
                  <strong>Draining Touch:</strong> d6+2{" "}
                  <Tag handwritten>hand, magic, ignores armor</Tag>
                </>,
                <>
                  <strong>Cloven Hooves:</strong> d8+3{" "}
                  <Tag handwritten>forceful, close</Tag>
                </>,
                <>
                  <strong>Chitinous Shell or Thick Hide:</strong> Armor 2
                </>,
                <>
                  <strong>Sharpened Horns:</strong> d8+3{" "}
                  <Tag handwritten>close, 2 piercing</Tag>
                </>,
                <>
                  <strong>Lashing Tongue:</strong> d8+1{" "}
                  <Tag handwritten>reach, 1 piercing</Tag>
                </>,
                <>
                  <strong>Leathery Wings:</strong> allow for short bouts of
                  flight
                </>,
                <>
                  <strong>Jagged Teeth:</strong> d8+2{" "}
                  <Tag handwritten>hand, messy, 1 piercing</Tag>
                </>,
                <>
                  <strong>Thick Tail:</strong> d8+1{" "}
                  <Tag handwritten>reach, forceful</Tag>
                </>,
                <>
                  <strong>Razor Claws:</strong> d8+2{" "}
                  <Tag handwritten>close, messy</Tag>
                </>,
                <>
                  <strong>Regeneration:</strong> +4HP/heal injuries on Recovery
                </>,
                <>
                  <strong>Grasping Pseudopods:</strong> d6+1{" "}
                  <Tag handwritten>reach, grabby</Tag>
                </>,
              ]}
              variant="small"
            />
          </div>

          <Divider />

          <div className="space-y-3">
            <h4 className="text-lg font-bold text-stone-800 dark:text-stone-100 tracking-wide max-md:flex-wrap">
              Instinct <br className="md:hidden" />
              <span className="font-normal text-sm text-stone-500 dark:text-stone-400">
                pick 1, fulfill it to revert to human form
              </span>
            </h4>
            <CheckboxList
              items={[
                "To challenge rivals",
                "To be worshiped",
                "To run with the pack",
                "To make them cower",
                "To rampage",
                "To devour (pick 1)",
                "To wreak mischief",
              ]}
              variant="instinct"
            />
          </div>

          <Divider />

          <div className="space-y-3">
            <h4 className="text-lg font-bold text-stone-800 dark:text-stone-100 tracking-wide max-md:flex-wrap">
              Bane <br className="md:hidden" />
              <span className="font-normal text-sm text-stone-500 dark:text-stone-400">
                pick 1 or 2, Defy Danger to act against it
              </span>
            </h4>
            <CheckboxList
              items={[
                <>
                  <strong>Bronze implements</strong> burn the flesh
                </>,
                <>
                  <strong>Bendis root</strong> compels you to flee
                </>,
                <>
                  <strong>Bell sounds</strong> render you mindless
                </>,
                <>
                  <strong>Holy symbols</strong> bind you
                </>,
                <>
                  <strong>Your true name</strong> commands obedience
                </>,
              ]}
              variant="small"
            />
          </div>
        </div>

        {/* Right Column - Monster Moves */}
        <div>
          <h4 className="text-lg font-bold text-stone-800 dark:text-stone-100 tracking-wide max-md:flex-wrap mb-4">
            Monster Moves{" "}
            <span className="font-normal text-sm text-stone-500 dark:text-stone-400">
              pick 1
            </span>
          </h4>
          <div className="flex flex-col gap-2">
            <MoveCard size="sm" title="Craving">
              When you indulge your instinct you may go without sustenance and
              heal as if you had made camp. If you go without for a season, mark
              a debility. If you cannot, grant control of your character to the
              GM until your instinct is satisfied.
            </MoveCard>
            <MoveCard size="sm" title="Deadly">
              When you deal damage with the intent to kill, increase all damage
              dice by one size.
            </MoveCard>
            <MoveCard size="sm" title="Formless">
              You can squeeze, flow, or ooze through surprisingly tight spaces
              without issue. Also gain +1 Armor when you go unarmored thanks to
              supernatural resilience.
            </MoveCard>
            <MoveCard size="sm" title="Implements of Evil">
              Choose 2 additional monstrous armaments from the Monster
              Compendium insert.
            </MoveCard>
            <MoveCard
              resourceName="Reign"
              resources={2}
              size="sm"
              title="Monster Squad"
            >
              You hold domain over creatures of the night. When{" "}
              <Trigger>
                you call forth nocturnal scavengers or a pestilent swarm
              </Trigger>{" "}
              roll +CHA: <strong>on a 7+</strong>, they appear and sew chaos on
              your behalf but hold 1 Reign; <strong>on a 10+</strong>, hold 2
              Reign; <strong>on a 6-</strong>, they sew chaos on your behalf but
              hold no Reign and mark XP. Spend Reign to: Shield something or
              someone from the chaos, or Provide aid to yourself or an ally.
            </MoveCard>
            <MoveCard size="sm" title="Nightbreed">
              You can smell and track blood from miles away and when you taste
              blood and <Trigger>Seek Insight</Trigger> you may roll +CON. If
              you do you can always ask "What is the extent of their injuries?"
              for free, even on a 6-.
            </MoveCard>
            <MoveCard size="sm" title="Night Crawler">
              When you{" "}
              <Trigger>
                climb, cling to, or skitter across a sheer surface
              </Trigger>{" "}
              you cannot fall and you make any rolls to hide, hunt prey, or
              traverse terrain with advantage.
            </MoveCard>
            <MoveCard size="sm" title="Release the Beast">
              You are capable of exceptional strength.{" "}
              <Trigger>
                When you lift, throw, or break something in a display of
                frightening power
              </Trigger>{" "}
              your attacks gain the <Tag>forceful</Tag> and <Tag>area</Tag> tags
              and you Let Fly with +STR but the GM will choose one: What you've
              done cannot be undone, or You risk collateral damage in addition
              to other consequences.
            </MoveCard>
          </div>
        </div>
      </div>
    </Compendium>
  );
}
