import { SectionDivider } from "./section-divider";

function Truth({
  id,
  description,
  name,
  questStarter,
}: {
  id: string;
  description: string;
  name: string;
  questStarter: string;
}) {
  return (
    <label className="block cursor-pointer group">
      <div className="flex items-start gap-2">
        <input
          className="size-4 aspect-square shrink-0 mt-0.5"
          name={id}
          type="checkbox"
        />
        <div>
          <div className="font-bold text-stone-800 dark:text-stone-200">
            {name}
          </div>
          <div className="text-stone-600 dark:text-stone-400">
            {description}
          </div>
        </div>
      </div>
      <p className="text-sm italic text-stone-500 dark:text-stone-500 mt-2 ml-6 leading-relaxed">
        {questStarter}
      </p>
    </label>
  );
}

function TruthSection({
  number,
  question,
  title,
  truths,
}: {
  number?: number;
  question?: string;
  title: string;
  truths: {
    id: string;
    description: string;
    name: string;
    questStarter: string;
  }[];
}) {
  return (
    <section className="break-inside-avoid-page">
      <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200 mb-1">
        {number ? `${number}. ` : ""}
        {title}
      </h3>
      {question && (
        <p className="text-sm italic text-stone-500 dark:text-stone-400 mb-4">
          {question}
        </p>
      )}
      <div className="space-y-4">
        {truths.map((truth) => (
          <Truth key={truth.id} {...truth} />
        ))}
      </div>
    </section>
  );
}

function GodSection({
  gods,
  title,
}: {
  gods: { description: string; name: string }[];
  title: string;
}) {
  return (
    <div className="break-inside-avoid">
      <h4 className="text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">
        {title}
      </h4>
      <div className="space-y-1 text-sm">
        {gods.map((god) => (
          <p key={god.name}>
            <strong className="text-stone-800 dark:text-stone-200">
              {god.name}
            </strong>{" "}
            <span className="text-stone-600 dark:text-stone-400">
              — {god.description}
            </span>
          </p>
        ))}
      </div>
    </div>
  );
}

export function WorldTruthsForm() {
  return (
    <form className="max-w-4xl mx-auto px-6 print:px-0 print:max-w-none">
      <section className="mb-8">
        <h2 className="text-base font-bold text-stone-700 dark:text-stone-300 mb-4">
          THE GODS
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <GodSection
            gods={[
              {
                description:
                  "Primal earth, fire, pressure, depths. Elemental, ancient, vast. Wizards serve it as Primarchs.",
                name: "The Mountain",
              },
              {
                description:
                  "Cycles, erosion, the pull. What comes and goes. What wears everything down eventually. Patient, inevitable.",
                name: "The Tide",
              },
              {
                description:
                  "Distance, fate, cold light. What watches from above. Navigation, prophecy, the unreachable. Ancient and indifferent.",
                name: "The Stars",
              },
            ]}
            title="The Three Thrones"
          />
          <GodSection
            gods={[
              {
                description:
                  "Unity, loyalty, the hunt. The bond between those who run together. Predators who share.",
                name: "The Pack",
              },
              {
                description:
                  "Multitude, hunger, consumption. The many as one. No individual matters. Unstoppable.",
                name: "The Swarm",
              },
              {
                description:
                  "Secrets, burrows, survival. Those who hide, dig, wait. Paths unseen. The prey who endure.",
                name: "The Warren",
              },
            ]}
            title="The Three Bloods"
          />
        </div>
      </section>

      <SectionDivider className="my-6 print:my-4" />

      <div className="space-y-8 print:space-y-6">
        <TruthSection
          number={1}
          question="What happened to the ones who came before?"
          title="THE PRECURSORS"
          truths={[
            {
              id: "precursors-plague",
              description:
                "A sickness swept the world that killed only the true-blooded races. It spread too fast to stop. The wizards survived — some say because they were no longer fully human themselves. Now their creations inherit empty cities and untended fields.",
              name: "The Plague of Flesh",
              questStarter:
                "Quest Starter: A village uncovered a sealed chamber containing preserved human bodies. Some appeared to merely be sleeping. What do the wizards want done with them? What do you do?",
            },
            {
              id: "precursors-war",
              description:
                "The great mages turned on each other, and the world burned. Humans, elves, halflings — caught between the spellfire, they were simply... erased. The wizards who survived carved domains from the ashes and populated them with servants of their own making.",
              name: "The Wizard War",
              questStarter:
                "Quest Starter: You found a weapon from the war — something that killed thousands. It still works. Who wants it? What will you do with it?",
            },
            {
              id: "precursors-exodus",
              description:
                "The old peoples left. Through great portals, across impossible seas, or into the sky itself — no one knows where they went or why. They left their cities, their belongings, their world. Only the wizards stayed behind, and they do not speak of it. Perhaps they were exiled. Perhaps they refused to go. Perhaps they couldn't.",
              name: "The Exodus",
              questStarter:
                "Quest Starter: You found a map showing the location of a portal the old peoples used. It may still function. Who wants to follow them? Who wants to make sure no one can?",
            },
          ]}
        />

        <TruthSection
          number={2}
          question="How do people live together?"
          title="COMMUNITIES"
          truths={[
            {
              id: "communities-circles",
              description:
                "Small settlements, rarely more than a few families. Each keeps to itself, trading or feuding with neighbors. What lives in the next valley may not be anything like you.",
              name: "Circles",
              questStarter:
                "Quest Starter: A circle that once welcomed you has gone silent. When you arrived, you found the homes empty but undamaged. What happened to them?",
            },
            {
              id: "communities-towns",
              description:
                "Settlements have grown in the ruins of the old peoples' cities. Markets draw traders from different domains — beast-kin alongside fae, constructs, and stranger things. Coin spends the same regardless of who made you.",
              name: "Towns",
              questStarter:
                "Quest Starter: A trader from Stargard arrived with goods no one has seen before. Now they're dead. Who killed them? What were they really selling?",
            },
            {
              id: "communities-countries",
              description:
                "The land is divided by countries, with borders, laws, and subjects. Each has its own peoples, its own rules. Crossing borders is serious business.",
              name: "Countries",
              questStarter:
                "Quest Starter: You crossed into another domain without permission. Their soldiers found you — and they aren't anything like you. What do they want in exchange for your freedom?",
            },
          ]}
        />

        <TruthSection
          number={3}
          question="Who holds power?"
          title="LEADERS"
          truths={[
            {
              id: "leaders-varied",
              description:
                "Each settlement finds its own way. Some follow the strongest, others defer to elders or councils. Some have no leaders at all. It depends on who made them and what they remember.",
              name: "Varied",
              questStarter:
                "Quest Starter: Two leaders claim authority over the same settlement. Both have followers willing to fight. How did this happen? Whose side are you on?",
            },
            {
              id: "leaders-masters",
              description:
                "The powerful rule. Wizards, sorcerers, fae lords — whoever created or claimed a domain, their word is law. Some rule through fear, others through loyalty. But all rule.",
              name: "Masters",
              questStarter:
                "Quest Starter: Your master gave you an order that will harm people you care about. Do you obey? What happens if you don't?",
            },
          ]}
        />

        <TruthSection
          number={4}
          question="How do the wizards relate to each other?"
          title="THE SORCERER-LORDS"
          truths={[
            {
              id: "sorcerers-kingdoms",
              description:
                "Each wizard claims a domain. They trade, feud, and occasionally war. Borders shift. Alliances form and break.",
              name: "Petty Kingdoms",
              questStarter:
                "Quest Starter: A wizard's envoy arrived with a message for your master. They were killed before delivering it. What did the message say? Who wanted it silenced?",
            },
            {
              id: "sorcerers-compact",
              description:
                "The surviving wizards have agreements — territories, rules of engagement, forbidden magics. Breaking the Compact has consequences.",
              name: "The Compact",
              questStarter:
                "Quest Starter: Your master broke the Compact. You don't know how or why, but others are coming to enforce it. What will you do?",
            },
            {
              id: "sorcerers-isolation",
              description:
                "Each wizard is an island. They rarely interact, separated by vast wildernesses. Meeting another wizard's creations is rare and significant.",
              name: "Isolation",
              questStarter:
                "Quest Starter: You encountered someone from another domain — the first your village has ever seen. They carry a warning. What is it?",
            },
            {
              id: "sorcerers-hierarchy",
              description:
                "One wizard (or a council) rules the others. Perhaps Grimrod answers to someone greater. Perhaps the Red Sorcerer was a rebel.",
              name: "The Hierarchy",
              questStarter:
                "Quest Starter: A summons came from above — your master must answer to their superior. They're afraid. Why?",
            },
          ]}
        />

        <TruthSection
          number={5}
          question="What do the common people believe?"
          title="RELIGION"
          truths={[
            {
              id: "religion-thrones",
              description:
                "Everyone knows the great gods are real. The Mountain, the Tide, the Stars. Wizards serve them as Primarchs. Common folk pray, make offerings, fear their judgment.",
              name: "The Thrones",
              questStarter:
                "Quest Starter: A shrine to one of the Thrones was desecrated. The village fears retribution — not from the god, but from its Primarch. Who did this, and why?",
            },
            {
              id: "religion-bloods",
              description:
                "Beast-kin feel the pull of something deeper — the Warren, the Pack, or the Swarm. It's not worship, exactly. It's instinct. It's what you are.",
              name: "The Bloods",
              questStarter:
                "Quest Starter: Someone of a different Blood saved your life. Your kinds don't mix — old instinct, old enmity. But the debt is real. Who are they? What do you owe?",
            },
            {
              id: "religion-both",
              description:
                "The Thrones rule the world. The Bloods rule the self. Wise folk honor both — one for protection, one for understanding who they really are.",
              name: "Both",
              questStarter:
                "Quest Starter: An elder called upon both a Throne and a Blood in a single ritual. It was forbidden, but the need was great. It worked — and something else answered. What did the village need so badly? What came?",
            },
            {
              id: "religion-neither",
              description:
                "The beast-kin were made, not born. They have no ancestors, no traditions. Some find this freeing. Others feel the absence like a wound.",
              name: "Neither",
              questStarter:
                "Quest Starter: A wanderer came preaching a new faith — no Thrones, no Bloods, something made by beast-kin for beast-kin. You listened. Then they vanished. What did they teach? Will you continue their work?",
            },
          ]}
        />

        <TruthSection
          number={6}
          question="What giant beasts roam the land?"
          title="MEGAFAUNA"
          truths={[
            {
              id: "megafauna-legend",
              description:
                "Stories of giant beasts from before the wizards came. Bones sometimes surface. Nothing more.",
              name: "Legend",
              questStarter:
                "Quest Starter: A massive skeleton was uncovered after a landslide. Merchants want the bones. Scholars want to study them. Something else wants them buried again. Why?",
            },
            {
              id: "megafauna-wilds",
              description:
                "They exist, far from settlements. Travelers sometimes don't return. Hunters speak of shadows that block out the sun.",
              name: "In the deep wilds",
              questStarter:
                "Quest Starter: A hunting party went after something big. Only one returned, and she won't speak. What did they find? What followed her back?",
            },
            {
              id: "megafauna-shadow",
              description:
                "They roam freely. Settlements are built around their migration paths. When one comes, you hide or you die.",
              name: "We live in their shadow",
              questStarter:
                "Quest Starter: The great beast that passes by your village every spring is late. The elders are worried — not relieved. What does its absence mean? What drove it from its path?",
            },
          ]}
        />

        <TruthSection
          number={7}
          question="Do the dead stay dead?"
          title="UNDEAD"
          truths={[
            {
              id: "undead-dead",
              description:
                "Whatever magic made us, it doesn't linger after death. A body is just meat.",
              name: "The dead stay dead",
              questStarter:
                "Quest Starter: Someone claims to have seen a dead villager walking in the woods. Everyone knows that's impossible. You went to prove them wrong. What did you find?",
            },
            {
              id: "undead-echoes",
              description:
                "Some dead don't rest — especially in the old places, where the Precursors fell. Stay away from the ruins at night.",
              name: "Echoes remain",
              questStarter:
                "Quest Starter: A ruin that was safe by day became deadly after sunset. A salvage team learned this the hard way. One survivor made it back. What do they need you to retrieve — and why is it worth the risk?",
            },
            {
              id: "undead-door",
              description:
                "The dead rise. Vampires stalk the night. Things older still crawl from old graves. Pyres burn every night for good reason.",
              name: "Death is a door",
              questStarter:
                "Quest Starter: The pyres went out during a storm. By morning, the cemetery was empty. Where did they go? Who is calling them?",
            },
          ]}
        />

        <TruthSection
          number={8}
          question="What became of the great wyrms?"
          title="DRAGONS"
          truths={[
            {
              id: "dragons-extinct",
              description:
                "The great wyrms died with the Precursors, or before. Only bones remain — massive ribcages in the hills, skulls used as temples.",
              name: "Long extinct",
              questStarter:
                "Quest Starter: Miners broke into a cavern and found a dragon skeleton — and whatever killed it. A weapon? A creature? The remains don't match anything anyone recognizes. What was it?",
            },
            {
              id: "dragons-rare",
              description:
                "They exist — a handful, hidden in the highest peaks or deepest caverns. To see one is a once-in-a-lifetime event. To anger one is to end lifetimes.",
              name: "Rare and ancient",
              questStarter:
                "Quest Starter: Someone found a dragon egg — warm, alive, ready to hatch. Word is spreading fast. Who found it? Who's coming for it?",
            },
            {
              id: "dragons-among",
              description:
                "Dragons are shapeshifters. They wear the faces of common folk, Precursors, perhaps even wizards. That merchant. That hermit. That ruler. Any of them could be something else entirely.",
              name: "Walk among us",
              questStarter:
                "Quest Starter: A dying stranger revealed their true form — scales, wings, fire in their blood. Their last words were a warning. What did they say? Who killed them?",
            },
          ]}
        />
      </div>

      <SectionDivider className="my-8 print:my-4" />

      <section className="text-center text-sm text-stone-500 dark:text-stone-500 print:hidden">
        <p>Check the truths that define your world, then print this page.</p>
      </section>
    </form>
  );
}
