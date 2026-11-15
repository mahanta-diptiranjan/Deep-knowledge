import type { SourceKind, TopicSlug } from "./topics";

type SeedSource = {
  title: string;
  author: string;
  kind: SourceKind;
  url?: string;
  ideas: { title: string; body: string; topic: TopicSlug }[];
};

// Starter library so the feed is never empty. Summaries are short paraphrases.
export const SEED: SeedSource[] = [
  {
    title: "Atomic Habits",
    author: "James Clear",
    kind: "book",
    ideas: [
      {
        title: "Systems beat goals",
        body: "Winners and losers often share the same goals, so goals alone can't explain success. What differs is the system: the daily processes you follow. Focus on fixing the process and the results tend to follow.",
        topic: "habits",
      },
      {
        title: "Make it obvious, attractive, easy, satisfying",
        body: "Every habit runs through cue, craving, response and reward. To build one, make the cue obvious, the habit attractive, the action easy and the reward satisfying. To break one, invert each step.",
        topic: "habits",
      },
      {
        title: "Identity-based habits",
        body: "The deepest change comes from who you believe you are, not what you want to achieve. Every action is a vote for the type of person you want to become. Instead of 'I want to run a marathon', think 'I am a runner'.",
        topic: "habits",
      },
      {
        title: "The two-minute rule",
        body: "Scale any new habit down to something that takes two minutes or less. 'Read before bed' becomes 'read one page'. The goal is to master showing up; a habit must be established before it can be improved.",
        topic: "productivity",
      },
    ],
  },
  {
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    kind: "book",
    ideas: [
      {
        title: "Two systems of thinking",
        body: "System 1 is fast, automatic and intuitive. System 2 is slow, effortful and deliberate. Most of our judgments come from System 1, which is efficient but prone to predictable errors when a problem only looks easy.",
        topic: "psychology",
      },
      {
        title: "Loss aversion",
        body: "Losses feel roughly twice as painful as equivalent gains feel good. This asymmetry makes us cling to the status quo, reject fair bets and hold losing investments too long.",
        topic: "psychology",
      },
      {
        title: "The anchoring effect",
        body: "An initial number, even an obviously random one, pulls later estimates toward it. Before negotiating or estimating, notice which anchors are in the room and deliberately consider alternatives.",
        topic: "psychology",
      },
    ],
  },
  {
    title: "Deep Work",
    author: "Cal Newport",
    kind: "book",
    ideas: [
      {
        title: "Deep work is rare and valuable",
        body: "The ability to focus without distraction on cognitively demanding tasks is becoming rarer just as it becomes more valuable. Those who cultivate it will thrive.",
        topic: "productivity",
      },
      {
        title: "Attention residue",
        body: "When you switch tasks, part of your attention stays stuck on the previous one. Frequent quick checks of email or chat leave you permanently working at reduced capacity.",
        topic: "productivity",
      },
      {
        title: "Schedule every minute",
        body: "Give every minute of your workday a job, in blocks on paper. Plans will break, and that is fine: revise the schedule. The point is deliberate choice about where your time goes.",
        topic: "productivity",
      },
    ],
  },
  {
    title: "Mindset",
    author: "Carol Dweck",
    kind: "book",
    ideas: [
      {
        title: "Fixed vs growth mindset",
        body: "With a fixed mindset you believe ability is innate, so every challenge is a test you might fail. With a growth mindset you believe ability is developed, so challenges become chances to learn.",
        topic: "learning",
      },
      {
        title: "Praise effort, not talent",
        body: "Praising children for being smart makes them avoid hard problems to protect the label. Praising the process (strategy, effort, persistence) makes them seek challenges.",
        topic: "learning",
      },
    ],
  },
  {
    title: "The Psychology of Money",
    author: "Morgan Housel",
    kind: "book",
    ideas: [
      {
        title: "Wealth is what you don't see",
        body: "Wealth is the money not spent: the car not bought, the upgrade skipped. Visible spending signals the opposite of wealth, which is hidden in the options and freedom that savings provide.",
        topic: "money",
      },
      {
        title: "Compounding needs time, not brilliance",
        body: "Most of a great investor's fortune usually comes from staying invested for decades. Being reasonable for a very long time beats being brilliant for a short time.",
        topic: "money",
      },
      {
        title: "Enough",
        body: "The hardest financial skill is getting the goalpost to stop moving. Without a sense of 'enough', people risk what they have and need for what they don't have and don't need.",
        topic: "money",
      },
    ],
  },
  {
    title: "Meditations",
    author: "Marcus Aurelius",
    kind: "book",
    ideas: [
      {
        title: "The dichotomy of control",
        body: "Some things are up to us (our judgments and actions) and some are not (other people, outcomes, reputation). Peace comes from focusing energy only on the first group.",
        topic: "philosophy",
      },
      {
        title: "The obstacle is the way",
        body: "What stands in the way becomes the way. An obstacle to one action is a chance to practise another virtue: patience, courage, or creativity.",
        topic: "philosophy",
      },
      {
        title: "Memento mori",
        body: "Remember that you will die. Far from being morbid, this sharpens priorities, shrinks trivial worries and makes each day feel worth using well.",
        topic: "philosophy",
      },
    ],
  },
  {
    title: "How to Win Friends and Influence People",
    author: "Dale Carnegie",
    kind: "book",
    ideas: [
      {
        title: "Be genuinely interested",
        body: "You can make more friends in two months by being interested in other people than in two years trying to get them interested in you. Ask questions and let them talk about themselves.",
        topic: "relationships",
      },
      {
        title: "Don't criticize, condemn or complain",
        body: "Criticism puts people on the defensive and makes them justify themselves. Try to understand why they did what they did; it breeds sympathy and tolerance.",
        topic: "communication",
      },
    ],
  },
  {
    title: "Crucial Conversations",
    author: "Patterson, Grenny, McMillan, Switzler",
    kind: "book",
    ideas: [
      {
        title: "Make it safe",
        body: "When people stop listening in a high-stakes talk, it's usually because they feel unsafe. Step out of the content, restore mutual respect and shared purpose, then step back in.",
        topic: "communication",
      },
      {
        title: "Start with heart",
        body: "Before a hard conversation, ask: what do I really want for myself, for the other person, and for the relationship? This keeps you from drifting into winning or punishing.",
        topic: "communication",
      },
    ],
  },
  {
    title: "Why We Sleep",
    author: "Matthew Walker",
    kind: "book",
    ideas: [
      {
        title: "Sleep consolidates memory",
        body: "Sleep after learning helps store new memories; sleep before learning prepares the brain to absorb them. Skimping on sleep weakens both ends of learning.",
        topic: "health",
      },
      {
        title: "Keep a regular sleep schedule",
        body: "Going to bed and waking at the same time every day, weekends included, is one of the most effective ways to improve sleep quality.",
        topic: "health",
      },
    ],
  },
  {
    title: "Start with Why",
    author: "Simon Sinek",
    kind: "book",
    ideas: [
      {
        title: "The golden circle",
        body: "Most organisations communicate from the outside in: what they do, how, and rarely why. Inspiring leaders reverse it, starting with purpose. People don't buy what you do, they buy why you do it.",
        topic: "leadership",
      },
    ],
  },
  {
    title: "Extreme Ownership",
    author: "Jocko Willink & Leif Babin",
    kind: "book",
    ideas: [
      {
        title: "There are no bad teams, only bad leaders",
        body: "Leaders own everything in their world, including failures. Instead of blaming others, a leader asks what they could have done better: clearer instructions, better training, more support.",
        topic: "leadership",
      },
      {
        title: "Simple plans win",
        body: "Complex plans fail when things go wrong because no one understands them. Communicate plans simply enough that everyone on the team can explain them back.",
        topic: "leadership",
      },
    ],
  },
  {
    title: "Steal Like an Artist",
    author: "Austin Kleon",
    kind: "book",
    ideas: [
      {
        title: "Nothing is original",
        body: "Every new idea is a mashup of earlier ones. Collect what you love, study your influences, and combine them; originality emerges from remixing many sources rather than copying one.",
        topic: "creativity",
      },
      {
        title: "Show your work",
        body: "Share small pieces of your process openly. It attracts people who care about what you do, invites feedback and builds a body of work over time.",
        topic: "creativity",
      },
    ],
  },
  {
    title: "Make It Stick",
    author: "Brown, Roediger, McDaniel",
    kind: "book",
    ideas: [
      {
        title: "Retrieval beats rereading",
        body: "Rereading feels productive but builds little lasting memory. Testing yourself, by recalling without looking, strengthens memory far more, even when you get answers wrong.",
        topic: "learning",
      },
      {
        title: "Space it out",
        body: "Practice spread over time beats cramming. Some forgetting between sessions makes retrieval effortful, and that effort is what makes learning durable.",
        topic: "learning",
      },
      {
        title: "Interleave topics",
        body: "Mixing different kinds of problems in one session feels harder than practising one type at a time, but it trains you to recognise which approach a problem needs.",
        topic: "learning",
      },
    ],
  },
  {
    title: "A Short History of Nearly Everything",
    author: "Bill Bryson",
    kind: "book",
    ideas: [
      {
        title: "You are made of star stuff",
        body: "Nearly every atom heavier than hydrogen and helium in your body was forged inside stars that exploded long before the sun formed.",
        topic: "science",
      },
      {
        title: "Atoms are mostly empty",
        body: "If an atom were a cathedral, its nucleus would be a fly in the middle. What feels solid is mostly electromagnetic repulsion between electron clouds.",
        topic: "science",
      },
    ],
  },
];
