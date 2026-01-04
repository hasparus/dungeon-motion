import { Columns } from "./columns";
import { MonsterCompendium } from "./monster-compendium";
import { MoveCard } from "./move-card";
import { SectionDivider } from "./section-divider";
import { Tag } from "./tag";
import { Trigger } from "./trigger";
import { WielderCompendium } from "./wielder-compendium";

export const Moves = () => {
  return (
    <form className="min-h-screen">
      <GrainOverlay />

      <div className="relative max-w-4xl mx-auto px-6 print:px-0">
        <section className="mb-16">
          <Columns>
            <MoveCard
              id="pariah"
              resourceName="Fear"
              resources={4}
              title="Pariah"
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

            <MoveCard id="nightmare" requirement="Pariah" title="Nightmare">
              <p>
                You can spend Fear to ask questions from the Seek Insight list.
              </p>
            </MoveCard>

            <MoveCard id="hardToKill" title="Hard to Kill">
              <p>
                When you <Trigger>are at Death's Door</Trigger>, you can roll
                +CON or +nothing (your choice). <strong>On a 7-9</strong>, you
                can mark a debility of your choice to regain 1 HP.
              </p>
            </MoveCard>

            <MoveCard
              id="unstoppable"
              requirement="Hard to Kill"
              resourceName=""
              resources={5}
              title="Unstoppable"
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

            <MoveCard id="alpha" requirement="Wild Speech" title="Alpha">
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

            <MoveCard
              id="ravensVoice"
              resourceName="Memory"
              resources={1}
              title="Raven's Voice"
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

            <MoveCard
              id="dreamDancer"
              requirement="Sleepwalker"
              title="Dream Dancer"
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

            <MoveCard id="turnTheSoil" resources={1} title="Turn the Soil">
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

            <MoveCard
              id="musclebound"
              requirement="Strength +2 or higher"
              title="Musclebound"
            >
              <p>
                When you <Trigger>make a hand-to-hand or thrown attack</Trigger>
                , it's <Tag>forceful</Tag> and <Tag>messy</Tag>. If it would
                already be <Tag>forceful</Tag> and/or <Tag>messy</Tag>, it's
                even more so.
              </p>
            </MoveCard>
          </Columns>
        </section>

        <SectionDivider />

        {/* Otherkin Move */}
        <section className="mb-16">
          <Columns>
            <MoveCard checkboxes={3} id="otherkin" title="Otherkin">
              <p>
                Your human form is but a guise. Fill out the Monster Compendium
                insert. Each time you select this move, choose a new monster
                move. You may undergo Metamorphosis at any time to take on your
                monstrous traits, instinct, bane, moves, etc.
              </p>
            </MoveCard>
            <MoveCard
              id="acceptance"
              requirement="level 6+ and Otherkin"
              title="Acceptance"
            >
              <p>
                You've come to terms with your monstrous nature. You no longer
                gain the <Tag>terrifying</Tag> tag unless you wish to and you
                may mark a debility at any time to resist your instinct or your
                bane and retain control.
              </p>
            </MoveCard>
          </Columns>
        </section>

        {/* Monster Compendium */}
        <MonsterCompendium className="mb-16" />

        <SectionDivider className="" />

        <WielderCompendium className="mb-16" />

        {/* Footer */}
        <footer className="mt-20 text-center">
          <div className="flex items-center justify-center gap-3 mb-20">
            <div className="w-12 h-px bg-stone-400 dark:bg-stone-600" />
            <div className="w-8 h-8 rounded-full border border-stone-400 dark:border-stone-600 flex items-center justify-center [corner-shape:superellipse(-.75)]" />
            <div className="w-12 h-px bg-stone-400 dark:bg-stone-600" />
          </div>
          <p className="text-sm mb-6">
            moves from{" "}
            <a href="https://www.kickstarter.com/projects/1735046512/stonetop">
              Stonetop
            </a>{" "}
            and{" "}
            <a href="https://spoutinglore.blogspot.com/2018/07/homebrew-world.html">
              Homebrew World
            </a>
            {" · "}set in{" "}
            <a href="https://velvetyne.fr/fonts/avara/">Avara by Velvetyne</a>
            {" · "}
            website by Loudmouth Looter
          </p>
        </footer>
      </div>
    </form>
  );
};

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
