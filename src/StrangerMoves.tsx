import React from "react";
import { CheckboxList } from "./CheckboxList";
import { cn } from "./cn";

type MoveId = string;

interface MoveCardProps {
  id: MoveId;
  title: string;
  children: React.ReactNode;
  requirement?: string;
  hasResource?: boolean;
  resourceName?: string;
  resourceCount?: number;
  className?: string;
}

const Trigger = ({ children }: { children: React.ReactNode }) => (
  <em className="text-stone-900 dark:text-stone-100 font-medium">{children}</em>
);

const Tag = ({
  children,
  handwritten = false,
}: {
  children: React.ReactNode;
  handwritten?: boolean;
}) => (
  <span
    className={cn(
      "text-stone-900 dark:text-stone-100",
      handwritten
        ? "font-hand text-lg leading-none [text-box-trim:trim-end] -translate-y-px text-stone-700 dark:text-stone-300 [text-box-edge:cap_alphabetic]"
        : "italic"
    )}
  >
    {children}
  </span>
);

const Divider = () => (
  <div className="border-t border-stone-300 dark:border-stone-600 my-8" />
);

const SectionDivider = () => (
  <div className="flex items-center gap-4 my-12">
    <div className="flex-1 border-t border-stone-400 dark:border-stone-600" />
    <div className="w-2 h-2 rotate-45 border border-stone-400 dark:border-stone-600" />
    <div className="flex-1 border-t border-stone-400 dark:border-stone-600" />
  </div>
);

const MonsterMove = ({
  title,
  trailing,
  children,
}: {
  title: string;
  trailing?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <h5 className="font-bold text-stone-800 dark:text-stone-100 tracking-wide">
        {title}
      </h5>
      {trailing && (
        <span className="text-xs text-stone-500 dark:text-stone-400 ml-auto">
          {trailing}
        </span>
      )}
    </div>
    <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
      {children}
    </p>
  </div>
);

const MoveCard = ({
  id,
  title,
  children,
  requirement,
  hasResource = false,
  resourceName = "",
  resourceCount = 0,
  className = "",
}: MoveCardProps) => (
  <article className={`group ${className}`}>
    <div className="flex items-start gap-3">
      <input
        type="checkbox"
        id={id}
        value={id}
        aria-describedby={`${id}-title`}
        className="w-5 h-5 mt-0.5"
      />
      <div className="flex-1">
        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <h3
            className="text-xl tracking-wide font-bold text-stone-800 dark:text-stone-100"
            id={`${id}-title`}
          >
            {title}
          </h3>
          {hasResource && (
            <div className="flex items-center gap-1 text-stone-500 dark:text-stone-400 text-sm">
              <span className="tracking-wider">{resourceName}</span>
              <div className="flex gap-0.5 ml-1">
                {[...Array(resourceCount)].map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-full border border-stone-400 dark:border-stone-600"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        {requirement && (
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            (Requires {requirement})
          </p>
        )}
        <div className="mt-2 text-stone-700 dark:text-stone-300 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  </article>
);

const DungeonMotion = () => {
  return (
    <form className="min-h-screen">
      <GrainOverlay />

      <div className="relative max-w-4xl mx-auto px-6 py-16">
        {/* Main Moves */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
            <MoveCard
              id="pariah"
              title="Pariah"
              hasResource
              resourceName="Fear"
              resourceCount={4}
            >
              <p>
                When you{" "}
                <Trigger>
                  draw upon your reputation to scare or intimidate someone
                </Trigger>
                , roll +CHA: <strong>on a 10+</strong>, hold 3 Fear;{" "}
                <strong>on a 7-9</strong>, hold 1 Fear. When{" "}
                <Trigger>you're humbled, de-fanged, or show mercy</Trigger>,
                lose all Fear. Spend Fear 1-for-1 to:
              </p>
              <ul className="diamond mt-3 space-y-1">
                <li>Draw all attention to yourself</li>
                <li>Cause someone to hesitate, flinch, or flee</li>
                <li>Coerce a temporary agreement or concession</li>
              </ul>
            </MoveCard>

            <MoveCard id="hardToKill" title="Hard to Kill">
              <p>
                When you <Trigger>are at Death's Door</Trigger>, you can roll
                +CON or +nothing (your choice). <strong>On a 7-9</strong>, you
                can mark a debility of your choice to regain 1 HP.
              </p>
            </MoveCard>

            <MoveCard id="fireWithin" title="Fire Within">
              <p>
                When you <Trigger>are in darkness</Trigger>, you are able to see
                by the light of your inner fire. When you{" "}
                <Trigger>take damage from cold or fire</Trigger>, reduce that
                damage by 2.
              </p>
            </MoveCard>

            <MoveCard id="guidingLight" title="Guiding Light">
              <p>
                When you <Trigger>lead one or more NPCs through danger</Trigger>
                , roll +CHA: <strong>on a 10+</strong>, you all make it through
                (Helior be praised); <strong>on a 7-9</strong>, the GM will tell
                you what's required to get everyone through safely.
              </p>
            </MoveCard>

            <MoveCard id="stalker" title="Stalker">
              <p>
                When{" "}
                <Trigger>
                  you carry a normal or light load and move with care
                </Trigger>
                , you make no noise and leave no sign of your passing. When you{" "}
                <Trigger>hide yourself in a natural environment</Trigger>, you
                remain unseen until you draw attention to yourself, move
                positions, or attack.
              </p>
            </MoveCard>

            <MoveCard id="wildSpeech" title="Wild Speech">
              <p>
                The grunts, barks, chirps, and calls of natural beasts are as a
                language to you. You can understand their intentions and
                communicate basic ideas. When you{" "}
                <Trigger>Persuade a beast</Trigger>, you can choose to roll
                +WIS.
              </p>
            </MoveCard>

            <MoveCard id="mollify" title="Mollify">
              <p>
                When you <Trigger>spend time with someone</Trigger>, you can ask
                their player why you frighten them or creep them out (you
                usually will) and get an honest answer.
              </p>
              <p className="mt-2">
                When you{" "}
                <Trigger>
                  Make Camp and relate your fears to one another
                </Trigger>{" "}
                banish fear from your heart for a time.
              </p>
            </MoveCard>

            <MoveCard id="otherkin" title="Otherkin" className="md:row-span-2">
              <p className="flex items-center gap-2 mb-2">
                <input type="checkbox" className="w-3 h-3" />
                <input type="checkbox" className="w-3 h-3" />
                <input type="checkbox" className="w-3 h-3" />
              </p>
              <p>
                Your human form is but a guise. Fill out the Stranger's Monster
                Compendium insert. Each time you select this move, choose a new
                monster move. You may undergo Metamorphosis at any time to take
                on your monstrous traits, instinct, bane, moves, etc.
              </p>
            </MoveCard>

            <MoveCard
              id="ravensVoice"
              title="Raven's Voice"
              hasResource
              resourceName="Memory"
              resourceCount={1}
            >
              <p>
                When you{" "}
                <Trigger>
                  record a sound, sentence, or phrase you've heard with flawless
                  tone and pitch
                </Trigger>{" "}
                mark Memory. When you{" "}
                <Trigger>
                  release the words you've memorized back into the world
                </Trigger>{" "}
                spend Memory to Persuade with advantage (if it makes sense) or
                to reproduce a spell or effect precisely. You will become mute
                for a time. Your voice will return in ~1 hour.
              </p>
            </MoveCard>

            <MoveCard id="sleepwalker" title="Sleepwalker">
              <p>
                When you{" "}
                <Trigger>anoint a sleeping person with your own blood</Trigger>{" "}
                you may share in their dreams.{" "}
                <Trigger>
                  When you Seek Insight within a dream or vision
                </Trigger>
                , you may roll with +CHA instead of +WIS. If you are reduced to
                zero HP in a dream, you fall into a deep slumber from which you
                awaken after a day's rest.
              </p>
            </MoveCard>

            <MoveCard id="trickOfLight" title="Trick of Light and Shadow">
              <p>
                When you{" "}
                <Trigger>
                  invoke the shadows within and without to shield you from sight
                </Trigger>{" "}
                roll +CHA: <strong>on a 10+</strong>, you may walk between
                shadows for a time; <strong>on a 7-9</strong>, you disappear and
                reappear a short distance away.
              </p>
            </MoveCard>

            <MoveCard
              id="turnTheSoil"
              title="Turn the Soil"
              hasResource
              resourceName=""
              resourceCount={1}
            >
              <p>
                Once per expedition when you{" "}
                <Trigger>Have What You Need</Trigger> you may choose to retrieve
                an item one might find on a corpse or in an unturned grave up to
                a value of 2. You needn't Requisition this item, instead choose
                a number of options equal to its value:
              </p>
              <ul className="diamond mt-3 space-y-1 text-sm">
                <li>
                  <strong>Time has taken its toll.</strong> Add or remove a tag
                  to reflect this flaw. Also reduce its value by 1.
                </li>
                <li>
                  <strong>You suffer a minor curse.</strong> Receive
                  disadvantage when you Defy Danger until you make amends.
                </li>
                <li>
                  <strong>It's clearly recognizable as plunder.</strong>{" "}
                  Someone, or something, will come looking for it soon.
                </li>
              </ul>
            </MoveCard>

            <MoveCard id="poisoner" title="Poisoner">
              <p>
                Mark the Poisons special possession. You ignore the{" "}
                <Tag>dangerous</Tag> tag when handling poisons. Gain access to
                the following in addition to nightshade oil:
              </p>
              <ul className="diamond mt-3 space-y-1 text-sm">
                <li>
                  <strong>Corpse root</strong>{" "}
                  <Tag handwritten>ingested, slow, dangerous</Tag> results in a
                  temporary death-like state.
                </li>
                <li>
                  <strong>Nailadd venom</strong>{" "}
                  <Tag handwritten>contact, dangerous</Tag> results in +1d4
                  damage and numbness when injected.
                </li>
                <li>
                  <strong>Fireweed</strong>{" "}
                  <Tag handwritten>burned, dangerous</Tag> creates black caustic
                  smoke that repels pests and vermin.
                </li>
              </ul>
            </MoveCard>

            <MoveCard id="nightmare" title="Nightmare" requirement="Pariah">
              <p>
                You can spend Fear to ask questions from the Seek Insight list.
              </p>
            </MoveCard>

            <MoveCard
              id="unstoppable"
              title="Unstoppable"
              requirement="Hard to Kill"
              hasResource
              resourceName=""
              resourceCount={5}
            >
              <p>
                When you <Trigger>are reduced to 0 HP in battle</Trigger>, you
                can keep fighting. Each time you take damage while at 0 HP, mark
                1. If something would heal you while you keep fighting, clear
                one mark instead.
              </p>
              <p className="mt-2">
                When you <Trigger>stop fighting</Trigger>, roll for Death's Door
                with a -1 penalty for each circle marked. If you survive, clear
                all your circles.
              </p>
            </MoveCard>

            <MoveCard
              id="musclebound"
              title="Musclebound"
              requirement="Strength +2 or higher"
            >
              <p>
                When you <Trigger>make a hand-to-hand or thrown attack</Trigger>
                , it's <Tag>forceful</Tag> and <Tag>messy</Tag>. If it would
                already be <Tag>forceful</Tag> and/or <Tag>messy</Tag>, it's
                even more so.
              </p>
            </MoveCard>

            <MoveCard id="alpha" title="Alpha" requirement="Wild Speech">
              <p>
                When you{" "}
                <Trigger>
                  assert your dominance over a beast or spirit of the wild
                </Trigger>
                , roll +WIS: <strong>on a 7+</strong>, it must choose 1 from the
                list below; <strong>on a 10+</strong>, you also gain advantage
                on your next roll against it.
              </p>
              <ul className="diamond mt-3 space-y-1">
                <li>Fight you for dominance</li>
                <li>Slink away or flee, then avoid you</li>
                <li>Accept your authority, at least for now</li>
              </ul>
            </MoveCard>
          </div>
        </section>

        <SectionDivider />

        {/* Advanced Moves */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-stone-800 dark:text-stone-100 tracking-wide mb-2 text-center">
            Advanced Moves
          </h2>
          <p className="text-center text-stone-500 dark:text-stone-400 mb-8">
            Requires level 6 or higher
          </p>

          <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
            <MoveCard
              id="acceptance"
              title="Acceptance"
              requirement="level 6+ and Otherkin"
            >
              <p>
                You've come to terms with your monstrous nature. You no longer
                gain the <Tag>terrifying</Tag> tag unless you wish to and you
                may mark a debility at any time to resist your instinct or your
                bane and retain control.
              </p>
            </MoveCard>

            <MoveCard
              id="dreamDancer"
              title="Dream Dancer"
              requirement="level 6+ and Sleepwalker"
            >
              <p>
                When you{" "}
                <Trigger>
                  enter a dream and craft and shape it to your will
                </Trigger>{" "}
                you roll +CHA: <strong>on a 10+</strong>, you can do anything
                you imagine; <strong>on a 7-9</strong>, you do it but the dream
                turns sour. Either allow the GM to make a hard move or awaken,
                suddenly, in a cold sweat.
              </p>
            </MoveCard>
          </div>
        </section>

        <SectionDivider />

        {/* Monster Compendium */}
        <section className="mb-16">
          <div className="border border-stone-300 dark:border-stone-700 p-8 relative">
            <div className="absolute top-0 -translate-y-1/2 left-8 px-4 bg-stone-50 dark:bg-stone-900 border pb-1 pt-2.5 leading-none border-stone-300 dark:border-stone-700">
              <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 tracking-wide">
                Monster Compendium
              </h2>
            </div>

            <div className="mt-4 grid md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div>
                <MoveCard id="metamorphosis" title="Metamorphosis">
                  <p>
                    There's a monster inside you. When you{" "}
                    <Trigger>reveal the monster within</Trigger> roll +CON:{" "}
                    <strong>on a 7+</strong>, take on its traits, armament,
                    moves, instinct, bane, etc; <strong>on a 10+</strong>, you
                    needn't indulge your instinct or Defy Danger to revert back;{" "}
                    <strong>on a 6-</strong>, as a 7+ but you lose yourself to
                    your instinct. Mark XP and the GM will indulge it for you
                    soon.
                  </p>
                </MoveCard>

                <Divider />

                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-stone-800 dark:text-stone-100 tracking-wide">
                    Traits{" "}
                    <span className="font-normal text-sm text-stone-500 dark:text-stone-400">
                      pick 2 per bane plus <Tag>terrifying</Tag> and{" "}
                      <Tag>unnatural</Tag>
                    </span>
                  </h4>
                  <CheckboxList
                    variant="traits"
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
                  />
                </div>

                <Divider />

                <div className="space-y-3">
                  <h4 className="text-lg font-bold text-stone-800 dark:text-stone-100 tracking-wide">
                    Armament{" "}
                    <span className="font-normal text-sm text-stone-500 dark:text-stone-400">
                      pick 2
                    </span>
                  </h4>
                  <CheckboxList
                    variant="armament"
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
                        <strong>Leathery Wings:</strong> allow for short bouts
                        of flight
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
                        <strong>Regeneration:</strong> +4HP/heal injuries on
                        Recovery
                      </>,
                      <>
                        <strong>Grasping Pseudopods:</strong> d6+1{" "}
                        <Tag handwritten>reach, grabby</Tag>
                      </>,
                    ]}
                  />
                </div>

                <Divider />

                <div className="space-y-3">
                  <h4 className="text-lg font-bold text-stone-800 dark:text-stone-100 tracking-wide">
                    Instinct{" "}
                    <span className="font-normal text-sm text-stone-500 dark:text-stone-400">
                      pick 1, fulfill it to revert to human form
                    </span>
                  </h4>
                  <CheckboxList
                    variant="instinct"
                    items={[
                      "To challenge rivals",
                      "To be worshiped",
                      "To run with the pack",
                      "To make them cower",
                      "To rampage",
                      "To devour (pick 1)",
                      "To wreak mischief",
                    ]}
                  />
                </div>

                <Divider />

                <div className="space-y-3">
                  <h4 className="text-lg font-bold text-stone-800 dark:text-stone-100 tracking-wide">
                    Bane{" "}
                    <span className="font-normal text-sm text-stone-500 dark:text-stone-400">
                      pick 1 or 2, Defy Danger to act against it
                    </span>
                  </h4>
                  <CheckboxList
                    variant="bane"
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
                  />
                </div>
              </div>

              {/* Right Column - Monster Moves */}
              <div>
                <h4 className="text-lg font-bold text-stone-800 dark:text-stone-100 tracking-wide mb-4">
                  Monster Moves{" "}
                  <span className="font-normal text-sm text-stone-500 dark:text-stone-400">
                    pick 1
                  </span>
                </h4>

                <CheckboxList
                  variant="monster-move"
                  items={[
                    <MonsterMove title="Craving">
                      When you indulge your instinct you may go without
                      sustenance and heal as if you had made camp. If you go
                      without for a season, mark a debility. If you cannot,
                      grant control of your character to the GM until your
                      instinct is satisfied.
                    </MonsterMove>,
                    <MonsterMove title="Deadly">
                      When you deal damage with the intent to kill, increase all
                      damage dice by one size.
                    </MonsterMove>,
                    <MonsterMove title="Formless">
                      You can squeeze, flow, or ooze through surprisingly tight
                      spaces without issue. Also gain +1 Armor when you go
                      unarmored thanks to supernatural resilience.
                    </MonsterMove>,
                    <MonsterMove title="Implements of Evil">
                      Choose 2 additional monstrous armaments from the
                      Stranger's Monster Compendium insert.
                    </MonsterMove>,
                    <MonsterMove title="Monster Squad" trailing="Reign ○○">
                      You hold domain over creatures of the night. When{" "}
                      <Trigger>
                        you call forth nocturnal scavengers or a pestilent swarm
                      </Trigger>{" "}
                      roll +CHA: <strong>on a 7+</strong>, they appear and sew
                      chaos on your behalf but hold 1 Reign;{" "}
                      <strong>on a 10+</strong>, hold 2 Reign;{" "}
                      <strong>on a 6-</strong>, they sew chaos on your behalf
                      but hold no Reign and mark XP. Spend Reign to: Shield
                      something or someone from the chaos, or Provide aid to
                      yourself or an ally.
                    </MonsterMove>,
                    <MonsterMove title="Nightbreed">
                      You can smell and track blood from miles away and when you
                      taste blood and <Trigger>Seek Insight</Trigger> you may
                      roll +CON. If you do you can always ask "What is the
                      extent of their injuries?" for free, even on a 6-.
                    </MonsterMove>,
                    <MonsterMove title="Night Crawler">
                      When you{" "}
                      <Trigger>
                        climb, cling to, or skitter across a sheer surface
                      </Trigger>{" "}
                      you cannot fall and you make any rolls to hide, hunt prey,
                      or traverse terrain with advantage.
                    </MonsterMove>,
                    <MonsterMove title="Release the Beast">
                      You are capable of exceptional strength.{" "}
                      <Trigger>
                        When you lift, throw, or break something in a display of
                        frightening power
                      </Trigger>{" "}
                      your attacks gain the <Tag>forceful</Tag> and{" "}
                      <Tag>area</Tag> tags and you Let Fly with +STR but the GM
                      will choose one: What you've done cannot be undone, or You
                      risk collateral damage in addition to other consequences.
                    </MonsterMove>,
                  ]}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-20 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-px bg-stone-400 dark:bg-stone-600" />
            <div className="w-8 h-8 rounded-full border border-stone-400 dark:border-stone-600 flex items-center justify-center [corner-shape:superellipse(-.75)]" />
            <div className="w-12 h-px bg-stone-400 dark:bg-stone-600" />
          </div>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-2">
            Moves from Stonetop · Set in Avara
          </p>
        </footer>
      </div>
    </form>
  );
};

export default DungeonMotion;

function GrainOverlay() {
  return (
    <div className="fixed inset-0 pointer-events-none opacity-5 invert dark:invert-0 z-100">
      <div
        className="w-full h-full"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          filter: "contrast(170%) brightness(1000%)",
          mixBlendMode: "overlay",
        }}
      />
    </div>
  );
}
