import { CheckboxList } from "./checkbox-list";
import { Compendium, CompendiumProps } from "./compendium";
import { MoveCard } from "./move-card";
import { Tag } from "./tag";
import { Trigger } from "./trigger";

export function WielderCompendium(props: Omit<CompendiumProps, "title">) {
  return (
    <Compendium {...props} title="Wielder Compendium">
      <div className="mt-4 grid md:grid-cols-2 gap-8">
        <div>
          <div className="space-y-3">
            <h4 className="text-lg font-bold text-stone-800 dark:text-stone-100 tracking-wide max-md:flex-wrap">
              Your Weapon{" "}
              <span className="font-normal text-sm text-stone-500 dark:text-stone-400">
                pick one
              </span>
            </h4>
            <CheckboxList
              className="space-y-4!"
              items={[
                <>
                  <strong>Crom Faeyr,</strong> hammer of the dwarf-kings{" "}
                  <Tag handwritten>+1d4 damage, forceful, loud</Tag>
                  <p className="mt-2">
                    When you{" "}
                    <Trigger>roll 12+ to Hack & Slash with this hammer</Trigger>
                    , it booms like thunder, stuns them, and sends them flying.
                  </p>
                </>,
                <>
                  <strong>The Ebon Blade,</strong> a heavy, jet-black sword{" "}
                  <Tag handwritten>+1 damage, messy</Tag>
                  <p className="mt-2">
                    When you{" "}
                    <Trigger>
                      kill a living, bleeding creature with this sword
                    </Trigger>
                    , regain 1d4 HP.
                  </p>
                </>,
                <>
                  <strong>Ironfang,</strong> an ornate spear of black steel{" "}
                  <Tag handwritten>+1 damage, reach, thrown</Tag>
                  <p className="mt-2">
                    When you <Trigger>Volley with this spear</Trigger>, you can
                    use STR instead of DEX. When you{" "}
                    <Trigger>will it so</Trigger>, the spear flies safely into
                    your open hand.
                  </p>
                </>,
                <>
                  <strong>Meofainn,</strong> an ax tempered in dragon's blood{" "}
                  <Tag handwritten>+1 damage, messy, forceful, 3 piercing</Tag>
                  <p className="mt-2">
                    This ax cuts wood like it was clay, stone like it was wood,
                    and steel like it was stone. When you{" "}
                    <Trigger>roll 12+ to Hack & Slash with this ax</Trigger>,
                    destroy something they wield, wear, or carry.
                  </p>
                </>,
                <>
                  <strong>Sindarin,</strong> a slim blade like a crescent moon{" "}
                  <Tag handwritten>+1 damage, ignores armor</Tag>
                  <p className="mt-2">
                    When you <Trigger>Hack & Slash with this blade</Trigger>,
                    you can use DEX instead of STR. Its edge can cut even
                    spirits or insubstantial foes.
                  </p>
                </>,
                <>
                  <strong>Urawhu,</strong> a barbed blade on a long silver chain{" "}
                  <Tag handwritten>+1 damage, reach, thrown</Tag>
                  <p className="mt-2">
                    When you <Trigger>Hack & Slash with Urawhu</Trigger>, you
                    can use DEX instead of STR. When you{" "}
                    <Trigger>
                      roll a 12+ to Hack & Slash or Volley with Urawhu
                    </Trigger>
                    , describe how you ensnare, trip, or disarm your foe.
                  </p>
                </>,
              ]}
              variant="small"
            />
          </div>
        </div>
        <div>
          <h4 className="text-lg font-bold text-stone-800 dark:text-stone-100 tracking-wide max-md:flex-wrap mb-4">
            Wielder Moves
          </h4>

          <CheckboxList
            items={[
              <MoveCard size="sm" title="Snicker-Snack!">
                When you <Trigger>wield Your Weapon and fight to kill</Trigger>,
                you deal damage with advantage.
              </MoveCard>,
              <MoveCard size="sm" title="Voices">
                When you{" "}
                <Trigger>consult the spirits bound to Your Weapon</Trigger>,
                roll +CHA: <strong>on a 10+</strong>, they give you a clear,
                useful insight into your situation but might ask some questions
                in return; <strong>on a 7-9</strong>, they'll give you insight
                into your situation, but pick 1:
                <ul className="mt-3 space-y-1 pl-4">
                  <li className="flex items-start gap-2">
                    <span className="text-stone-400">•</span> The insight is
                    vague, cryptic, or incomplete
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-stone-400">•</span> They make a demand
                    of you
                  </li>
                </ul>
              </MoveCard>,
              <MoveCard
                resourceName="Penalty"
                resources={4}
                size="sm"
                title="Well of Power"
              >
                Pick a spell from the Wizard or Cleric playbook:
                <p className="mt-3">
                  When you <Trigger>use Your Weapon to cast this spell</Trigger>
                  , roll +CHA: <strong>on a 10+</strong>, the spell works;{" "}
                  <strong>on a 7-9</strong>, it works but pick 1:
                </p>
                <ul className="diamond mt-3 space-y-1 text-sm">
                  <li>You endanger yourself, an ally, or an innocent</li>
                  <li>
                    You take a -1 ongoing penalty (cumulative) to use this move
                    until you Make Camp
                  </li>
                </ul>
              </MoveCard>,
            ]}
            variant="compendium-move"
          />
        </div>
      </div>
    </Compendium>
  );
}
