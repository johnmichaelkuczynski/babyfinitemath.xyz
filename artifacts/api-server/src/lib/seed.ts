import { db } from "@workspace/db";
import {
  topicsTable,
  lecturesTable,
  assignmentsTable,
  problemsTable,
  seedMetaTable,
} from "@workspace/db";
import { eq, sql, and, like, notInArray } from "drizzle-orm";
import { logger } from "./logger";

// Content version of the seeded curriculum. BUMP THIS whenever the TOPICS or
// ASSIGNMENTS content below changes. On boot, seedIfEmpty compares this against
// the value stored in seed_meta; a mismatch forces a full re-seed, so content
// edits self-heal in every environment (including a republished production)
// without a manual database wipe.
const SEED_CONTENT_VERSION = "2026-06-18-basic-finite-math-v2";

type SeedTopic = {
  slug: string;
  title: string;
  weekNumber: number;
  blurb: string;
  lectureTitle: string;
  body: string;
};

const TOPICS: SeedTopic[] = [
  // Unit 1 — Basic Finite Math: useful math without the infinite
  {
    slug: "what-finite-math-is",
    title: "What finite math is",
    weekNumber: 1,
    blurb: "Finite math is the practical math of countable things — counting, chance, grids, and money — with no calculus and no infinity required.",
    lectureTitle: "1.1 What finite math is: useful math without the infinite",
    body: `# What finite math is

Most people meet "advanced math" as calculus — the math of the infinite, of curves and motion and things that grow without end. **Finite math** is its practical counterpart that stays in the world you can count. It's a collection of practical tools — for organizing, counting, measuring chance, solving with grids, making the best choice, and handling money — that all work on a finite, manageable number of things. No infinity, no limits, no calculus. Just useful math for everyday decisions, and that down-to-earth usefulness is the whole point of this course.

## What "finite" means here

A *finite* collection is one you could, in principle, finish counting: the 52 cards in a deck, the 30 students in a class, the routes between five cities. Finite math is the study of questions about exactly those kinds of countable, bounded situations — how many ways can this happen, how likely is that, what's the best option given these limits. It deliberately steps away from the endless and the continuous, which is calculus's territory, and stays where things can be listed, counted, and compared. That restriction is a feature, not a limitation: it's what keeps the subject grounded and approachable.

## A toolkit, not a single idea

Unlike a course built around one big theorem, finite math is a *toolkit* — several distinct, practical tools that each answer a different everyday question. **Sets and logic** organize things into categories. **Counting** (permutations and combinations) tells you how many ways something can happen. **Probability** measures how likely it is. **Matrices** keep grids of numbers tidy and help solve systems. **Linear programming** squeezes the best result out of limited resources. And **the math of money** handles interest, loans, and growth. This course walks through them one at a time, and the final topic shows how they combine.

## Why no calculus is needed

Calculus is built to handle change and the infinite — slopes of curves, areas under them, sums that go on forever. Finite math needs none of that. Its questions are about discrete, countable things, so the only background you need is arithmetic and a willingness to reason carefully. That's exactly why finite math is the math most often used by people in business, the social sciences, and daily life: it answers real questions without demanding years of preparation. The ideas are explained here intuitively, in plain words, rather than buried in heavy formulas.

## In the real world

Finite math is quietly behind an enormous amount of ordinary life. A scheduling app deciding how many ways a shift can be filled is counting. An insurance quote is probability. A spreadsheet balancing a budget under constraints is linear programming. A loan estimate is the math of money. None of it requires infinity — it requires the practical tools this course is about, which is why finite math is sometimes called "the most useful math you'll ever actually use."`,
  },
  {
    slug: "sets-and-logic",
    title: "Sets and logic",
    weekNumber: 1,
    blurb: "Before you can count or measure anything, you have to organize it — sets sort the world into clear categories, and logic is how we reason about them.",
    lectureTitle: "1.2 Sets and logic: organizing the world into categories",
    body: `# Sets and logic

Before you can count things or measure how likely they are, you have to be clear about *which* things you mean. That's what a **set** is: a clearly described collection of objects. Sets are the quiet foundation under everything else in finite math — once the world is sorted into tidy categories, counting and probability become possible. Paired with a little **logic**, sets give you a precise language for talking about groups, overlaps, and "and / or / not."

## What a set is

A set is just a well-defined group of items, called its **elements** — the days of the week, the students who play a sport, the whole numbers from 1 to 10. "Well-defined" is the key: for any object, you can say clearly whether it's in the set or not. Sets don't care about order or repeats; {apple, banana} is the same set as {banana, apple}. This simple idea — a clear yes-or-no membership — is what lets math handle categories without ambiguity, and it's the starting point for every counting question later.

## Combining sets: and, or, not

The power comes from combining sets. The **union** of two sets gathers everything in either one (the "or" — students who play soccer *or* basketball). The **intersection** keeps only what's in both (the "and" — students who play *both*). The **complement** is everything *not* in a set (students who play *no* sport). These three moves — or, and, not — turn vague questions like "who's left out?" or "who does both?" into precise ones you can actually answer.

## Venn diagrams and counting overlaps

A **Venn diagram** draws sets as overlapping circles, and it's the best tool for one of finite math's most common traps: double-counting. If 20 people like coffee and 15 like tea, you can't say 35 like a hot drink — some like *both*, and you'd be counting them twice. The diagram makes the overlap visible, so you add the two groups and then subtract the shared middle. Getting overlaps right is a skill you'll use constantly once probability arrives, where the very same "subtract the overlap" move shows up again.

## Logic: reasoning about statements

Logic is the close partner of sets. A logical statement is something that's either true or false, and we combine statements with the same words: **and** (true only if both parts are), **or** (true if at least one is), **not** (which flips true and false). The **if–then** statement — "if it rains, the game is cancelled" — is especially important, because so much reasoning is conditional. Logic gives you rules for deciding what *follows* from what, the same careful thinking the rest of the course depends on.

## In the real world

Sets and logic run silently behind every database search and filter. "Show me customers in Ohio who bought in the last month but haven't returned anything" is a chain of unions, intersections, and complements. Spam filters, search engines, and the conditions inside a spreadsheet formula are all applied logic. Whenever you sort, filter, or ask "which of these are also that?", you're using exactly the set-and-logic thinking this topic is about.`,
  },
  {
    slug: "art-of-counting",
    title: "The art of counting",
    weekNumber: 1,
    blurb: "'How many ways can this happen?' is a deep, practical art — and its two master tools, permutations and combinations, hinge on a single question: does order matter?",
    lectureTitle: "1.3 The art of counting: permutations and combinations",
    body: `# The art of counting

"How many ways can this happen?" sounds like a question you settled in kindergarten, but it's one of the most useful and surprisingly deep questions in all of math. When the number of possibilities is too large to list by hand — the ways to arrange a playlist, pick a team, set a password — you need *counting techniques* instead of brute force. The two master tools are **permutations** and **combinations**, and the whole art is knowing which one a situation calls for.

## The multiplication principle

Everything starts with one simple rule: if one choice can be made in *a* ways and a following choice in *b* ways, then together they can be made in *a × b* ways. Three shirts and four pairs of pants give 3 × 4 = 12 outfits. The rule chains as far as you like — it's why a 4-digit PIN has 10 × 10 × 10 × 10 = 10,000 possibilities. This **multiplication principle** is the engine under both permutations and combinations; everything else is just deciding which choices to multiply.

## Permutations: when order matters

A **permutation** counts arrangements where the *order* matters. Gold, silver, and bronze medals for a race: who comes first versus second is a different outcome, so the order counts. Using the multiplication principle, first place can go to any of the runners, second to any of those remaining, and so on — fewer choices at each step. Anytime rearranging the same items makes a genuinely different result — seating, rankings, schedules, passwords — you're counting permutations.

## Combinations: when order doesn't matter

A **combination** counts selections where order *doesn't* matter — you only care *which* items you picked, not the sequence. Choosing 3 toppings for a pizza, or 5 players for a team, are combinations: picking pepperoni then mushrooms is the same pizza as mushrooms then pepperoni. Because order no longer creates new outcomes, there are always *fewer* combinations than permutations of the same items — you divide out all the rearrangements that count as the same choice.

## Telling them apart

The entire skill is one question: **does rearranging the same items count as something new?** If yes — a podium, a password, a batting order — it's a permutation. If no — a committee, a hand of cards, a set of toppings — it's a combination. Get that one distinction right and the rest is mechanical; get it wrong and you'll over- or under-count by a wide margin. That single judgment is what this topic trains, and it's worth more than memorizing any formula.

## In the real world

Counting powers things that touch you daily. The number of possible lottery tickets (a combination) is exactly what sets your odds. The strength of a password (a permutation problem) is why length matters so much. Logistics companies count possible delivery routes; geneticists count gene combinations; a card game's whole strategy rests on how many hands are possible. Whenever someone asks "what are the chances?", the answer almost always starts by counting how many ways things can happen.`,
  },
  {
    slug: "probability",
    title: "Probability",
    weekNumber: 1,
    blurb: "Probability turns the slippery words 'likely' and 'unlikely' into a precise number between 0 and 1 — the math of uncertainty behind insurance, medicine, and every game of chance.",
    lectureTitle: "1.4 Probability: measuring what's likely",
    body: `# Probability

We talk about chance all the time — "probably," "no way," "fifty-fifty" — but those words are slippery. **Probability** makes them precise by turning likelihood into a single number between 0 (impossible) and 1 (certain). It's built directly on the counting you just learned: to find how likely something is, you count the ways it *can* happen and compare that to all the ways things *could* turn out. Probability is the math of uncertainty, and it shows up everywhere a future is unknown.

## Probability as a number from 0 to 1

A probability is a fraction: the number of outcomes you care about, divided by the total number of possible outcomes (when each is equally likely). A coin landing heads is 1 out of 2, or 0.5. Rolling a 4 on a die is 1 out of 6. Zero means it can't happen, one means it's guaranteed, and everything real lives in between. Reading probability as "what share of all the possibilities is this?" keeps it concrete and firmly grounded in counting.

## Equally likely outcomes

The clean fraction only works when the outcomes are **equally likely** — a fair coin, a balanced die, a well-shuffled deck. That's why counting matters so much: to get the probability of a particular poker hand, you count how many hands qualify and divide by all possible hands. When outcomes *aren't* equally likely — a weighted die, an unfair game — you have to weigh them, but the core idea is the same: favorable possibilities measured against all possibilities.

## Combining probabilities: and / or

Real questions chain events together. For "this **or** that," you add the chances (subtracting any overlap — exactly the Venn-diagram move from the sets topic). For "this **and** that" with **independent** events — ones that don't affect each other, like two separate coin flips — you *multiply* the chances. The most common mistake is mixing these up, or assuming events are independent when they actually are not. Knowing whether to add or multiply is the heart of working with probability.

## Conditional probability and expected value

Two ideas make probability genuinely powerful. **Conditional probability** asks how a likelihood *changes* once you know something — the chance of rain given that the sky is already dark differs from the chance of rain in general. **Expected value** asks what you'd get *on average* if a situation repeated many times: multiply each outcome by its probability and add them up. Expected value is how insurers set premiums and how you can tell a fair bet from a bad one.

## In the real world

Probability runs the parts of life that hinge on uncertainty. Insurance premiums are expected-value calculations over the chance of accidents. Medical tests are read with conditional probability — what a positive result really means depends on how common the disease is. Weather forecasts, spam filters, sports analytics, and every casino game are probability in action. Learning to measure "how likely" turns gut feelings about risk into numbers you can actually reason with.`,
  },
  {
    slug: "matrices",
    title: "Matrices",
    weekNumber: 1,
    blurb: "A matrix is just a grid of numbers — but that humble grid is how math organizes data, solves whole systems of equations at once, and powers spreadsheets and computer graphics alike.",
    lectureTitle: "1.5 Matrices: organizing and solving with grids of numbers",
    body: `# Matrices

Some problems come with a lot of numbers that belong together — prices across several stores, scores across several games, the ingredients in several recipes. A **matrix** is simply a rectangular **grid of numbers**, a tidy way to hold all of that at once. It looks plain, but organizing numbers into a grid unlocks a powerful payoff: you can manipulate the whole grid in one move, and — most usefully — solve entire systems of equations together instead of one at a time.

## What a matrix is

A matrix is numbers arranged in **rows and columns**, like a small spreadsheet. A 2-by-3 matrix has 2 rows and 3 columns. Each position holds one value, and what makes it a matrix rather than a random table is that the *position* carries meaning — row 2, column 1 always refers to the same thing. This structure lets a single object stand in for a whole batch of related data, which is the first reason matrices are so handy.

## Doing arithmetic on a whole grid

You can do arithmetic on matrices as if the grid were a single number. **Adding** two matrices of the same shape just adds matching positions — handy for combining, say, this month's sales with last month's. **Multiplying** is more involved (rows combined with columns), but it captures something deep: it applies a whole set of relationships at once. The point is that one operation transforms *all* the numbers together, which is exactly what makes matrices efficient for large amounts of data.

## Systems of equations in a grid

The classic use is solving a **system of equations** — several conditions that must all hold at the same time, like "2 coffees and 1 tea cost \\$7, and 1 coffee and 3 teas cost \\$11." Written out, juggling these by hand is tedious. Packed into a matrix, the numbers line up so the whole system can be solved with a single organized procedure. The matrix strips away the words and the *x*'s and *y*'s, leaving just the numbers that matter, each in its proper place.

## Solving by organized steps

To solve, you transform the matrix step by step using simple, legal moves — scaling a row, adding one row to another — until the answer reads straight off the grid. The beauty is that it's *mechanical*: a fixed recipe that always works, with no clever guessing required, which is exactly why computers do it so well. You're not inventing a new trick for each problem; you're applying the same dependable procedure to whatever grid you're handed.

## In the real world

Matrices are everywhere data lives. Spreadsheets are matrices. Computer graphics rotate and scale images by multiplying matrices, so every video game and animated film leans on them. Economists model whole industries as systems of equations in matrix form; navigation, search engines (the original Google ranking was a giant matrix calculation), and machine learning all run on matrix arithmetic. The humble grid of numbers turns out to be one of the most powerful organizing ideas in all of applied math.`,
  },
  {
    slug: "linear-programming",
    title: "Linear programming",
    weekNumber: 1,
    blurb: "When you want the most profit or the least cost but resources are limited, linear programming finds the single best choice — and proves you only need to check the corners.",
    lectureTitle: "1.6 Linear programming: getting the most out of limited resources",
    body: `# Linear programming

Almost every real decision comes with limits — only so much money, time, material, or staff — and a goal you're trying to push as far as it will go. **Linear programming** is the branch of finite math built for exactly this: finding the **best possible outcome** (most profit, least cost) when you're hemmed in by constraints. It's one of the most genuinely useful tools in the whole subject, because "do the best you can with what you've got" describes so much of business and life.

## The setup: a goal and some limits

Every linear programming problem has two parts. The **objective** is the single quantity you want to make as big or as small as possible — profit, cost, time. The **constraints** are the limits you can't break — the hours available, the budget, the raw materials on hand. A bakery might want to *maximize profit* (objective) given only so much flour, oven time, and labor (constraints). Writing a messy real decision in this clean "maximize this, subject to those" form is half the work.

## The feasible region

All the constraints together carve out a set of allowed choices called the **feasible region** — every combination that breaks none of the limits. Picture it as a shape: each constraint is a boundary line, and the region is the area that satisfies all of them at once. Any point inside is a *possible* plan; the whole game is finding the *best* point in that region. Choices outside it are simply off the table, because they would violate one of the limits.

## The corner principle

Here's the elegant surprise that makes linear programming work: the best answer is always found at a **corner** of the feasible region — where the boundary lines meet — never in the vague middle. That means you don't have to check endlessly many possibilities; you only check the handful of corners. This **corner principle** turns an overwhelming "try everything" problem into a short, finite checklist, which is exactly the finite-math spirit: a bounded, countable set of candidates.

## Reading off the best choice

So the recipe is clean: find the corners of the feasible region, calculate the objective at each one, and pick the corner that gives the best value. If two corners tie, any point along the edge between them works too. The answer tells you the *exact* mix — how many of each product to make, how to split the budget — that squeezes the most out of your limited resources. No guesswork, just a finite comparison of a few candidates.

## In the real world

Linear programming quietly runs the modern economy. Airlines use it to schedule crews and routes; factories use it to decide product mixes; farmers use it to blend feed at the lowest cost; delivery companies use it to plan logistics. Diet planners, investment managers, and hospitals scheduling staff all lean on it. Anytime an organization needs the most output from limited input — which is nearly always — linear programming is the tool that finds the optimal answer instead of just a good-enough guess.`,
  },
  {
    slug: "math-of-money",
    title: "The math of money",
    weekNumber: 1,
    blurb: "Interest is the engine behind loans, savings, and debt — and understanding how money grows over time is the single most practical piece of math most people will ever use.",
    lectureTitle: "1.7 The math of money: interest, loans, and growth",
    body: `# The math of money

Of all the tools in finite math, this is the one you're guaranteed to use: the math of how money grows and shrinks over time. At its center is **interest** — the rent paid for the use of money — and it works both *for* you (in savings) and *against* you (in debt). Understanding interest, loans, and growth is arguably the most practical math there is, because it shapes nearly every major financial decision a person makes.

## Simple vs. compound interest

**Simple interest** is paid only on the original amount — lend \\$100 at 5% and you earn \\$5 every year, forever the same. **Compound interest** pays interest *on the interest already earned*, so the base keeps growing. The first year you earn \\$5; the next year you earn 5% on \\$105, a little more; and it accelerates from there. That difference — interest on interest — sounds small but is the single most important idea in personal finance.

## The power of compounding

Compounding is sometimes called the most powerful force in finance because it grows money *exponentially*, not steadily — slowly at first, then dramatically. A sum left to compound can double, then double again, with the later doublings adding huge amounts. This is why starting to save early matters so much: the money has more time to compound on itself. The very same engine is what makes high-interest debt so dangerous — it compounds against you just as relentlessly.

## Loans and regular payments

A loan flips compounding around: the lender charges compound interest, and you chip away with **regular payments** — a mortgage, a car loan, student debt. Each payment covers that period's interest first, and only the rest reduces what you owe, which is why early payments feel like they barely dent the balance. The stream of equal payments that pays off a loan (or builds toward a savings goal) is called an **annuity**, and a single relationship ties together the payment, the rate, the term, and the total.

## Saving and growth over time

The same math, pointed forward, is how savings grow. Putting a fixed amount aside every month and letting it compound builds a surprisingly large sum over decades — that's how retirement accounts work. The key levers are the **rate**, the **time**, and how often interest compounds. Small differences in the rate, or an early start, compound into large differences at the end, which is the whole reason "time in the market" and starting young are repeated like mantras.

## In the real world

This topic *is* the real world: every credit card, mortgage, car loan, savings account, and retirement plan runs on it. Understanding compound interest is what separates a manageable loan from a debt trap, and an okay retirement from a comfortable one. Banks, lenders, and investors live inside these calculations — and so does anyone choosing between paying off debt or investing. No other piece of math in this course will touch your own life as directly, or as often.`,
  },
  {
    slug: "finite-math-at-work",
    title: "Putting finite math to work (capstone)",
    weekNumber: 1,
    blurb: "Each tool answered one kind of question — but the real power of finite math is combining them to take a messy real decision from raw situation all the way to a confident answer.",
    lectureTitle: "1.8 Putting finite math to work (Capstone)",
    body: `# Putting finite math to work (capstone)

We've now gathered the whole toolkit: sets and logic to organize, counting to enumerate possibilities, probability to measure chance, matrices to handle grids and systems, linear programming to optimize under limits, and the math of money to handle growth over time. The capstone idea is simple and worth carrying with you: finite math isn't one big theorem — it's a **toolbox**, and real problems get solved by reaching for the right tool, or *several tools together*.

## Pulling the course together

In one sentence, here's the whole journey: **sets and logic** sort a situation into clear categories; **counting** tells you how many possibilities those categories contain; **probability** measures how likely each one is; **matrices** organize and solve when many numbers and conditions interact; **linear programming** finds the best choice when resources are limited; and **the math of money** handles anything that grows or shrinks over time. Each tool answers a different question, and most of them hand the next one its starting point — counting fed probability, sets fed both.

## How the tools combine

The real skill is seeing which tools a messy problem needs — often more than one. Pricing an insurance policy uses *counting* and *probability* to find the chance of a claim, then the *math of money* to value future payouts. Planning a product launch might use *linear programming* to set the production mix and *probability* to weigh uncertain demand, with *sets and logic* organizing the categories underneath. The capstone mindset is to break a tangled real decision into the clean sub-questions each tool was built to answer.

## A way of thinking, not just formulas

Step back and the deepest takeaway isn't any single technique — it's a habit of mind. Finite math teaches you to *make problems precise*: define exactly what you're counting, separate "and" from "or," ask "how likely, really?", and pin down the goal and the limits before deciding. That disciplined, quantitative way of looking at choices is valuable far beyond any one formula — it's how you turn a vague "what should I do?" into a question math can actually answer.

## Why this math is so widely used

Finite math is the math most working professionals actually reach for, precisely because it stays in the countable, practical world. Business, economics, the social sciences, computing, and everyday personal decisions all run on these tools rather than on calculus. They require little background, they map directly onto real situations, and they give concrete answers — which is exactly why "finite math" is a staple course across so many fields and a quietly powerful life skill.

## In the real world

Put it all together and finite math is a decision-making engine. A small business owner might use counting and probability to forecast demand, linear programming to allocate a budget, and the math of money to plan financing — sometimes all in a single afternoon. The same toolkit underlies logistics, insurance, finance, scheduling, and analytics across every industry. The one habit worth carrying out of this course is this: when a real decision feels overwhelming, ask which of these tools turns it into something countable, measurable, and solvable — because usually one of them does.`,
  },
];

type SeedAssignment = {
  kind: "homework" | "test" | "midterm" | "final";
  title: string;
  weekNumber: number;
  isTimed: boolean;
  timeLimitMinutes: number | null;
  instructions: string;
  problems: Array<{
    topicSlug: string;
    prompt: string;
    correctAnswer: string;
    explanation: string;
    hint?: string;
  }>;
};

const ASSIGNMENTS: SeedAssignment[] = [
  {
    kind: "homework",
    title: "Homework 1.1 — Finite math, sets, counting, and probability",
    weekNumber: 1,
    isTimed: false,
    timeLimitMinutes: null,
    instructions:
      "Untimed practice covering sections 1.1–1.4. Answer each question in a few sentences (about 3–5) in your own words. You don't need to crunch heavy numbers — just explain the reasoning clearly. One-word answers won't receive credit.",
    problems: [
      {
        topicSlug: "what-finite-math-is",
        prompt:
          "A friend says, 'Math only gets useful once you reach calculus — all the everyday stuff is just arithmetic.' Using what 'finite math' means, explain why this is a misunderstanding and what kinds of real questions finite math answers without any calculus. (3–5 sentences.)",
        correctAnswer:
          "Finite math is a toolkit for questions about countable, bounded situations — how many ways something can happen, how likely it is, or the best choice given limited resources — and it needs only arithmetic and careful reasoning, no calculus. Calculus is built for change and the infinite (curves, limits, endless sums), but a huge number of real decisions never touch the infinite at all. Counting the ways a team can be chosen, finding the chance of an event, optimizing a budget, or figuring out a loan payment are all finite-math questions. So 'useful math' isn't waiting only at calculus; much of the most practical math lives in the finite, countable world.",
        explanation:
          "Full credit: explains finite math handles countable/bounded questions with no calculus, contrasts it with calculus (change/the infinite), and gives concrete examples (counting, probability, optimization, money).",
      },
      {
        topicSlug: "sets-and-logic",
        prompt:
          "A club reports that 20 members signed up for the hiking trip and 15 signed up for the kayaking trip, and someone concludes that 35 different members signed up for a trip. Using the idea of sets and overlaps, explain why this reasoning can be wrong and how to count correctly. (3–5 sentences.)",
        correctAnswer:
          "The two groups can overlap — some members may have signed up for *both* trips — and those people get counted twice if you simply add 20 and 15. In set language you want the union of the two sets, but adding them straight up counts the intersection (the both-trips members) twice. To count correctly you add the two groups and then subtract the overlap, so if 5 members signed up for both, the real number is 20 + 15 − 5 = 30. A Venn diagram makes this clear by showing the shared middle that must be counted only once.",
        explanation:
          "Full credit: identifies the possible overlap/double-counting, frames it as union vs. intersection, and gives the correct method (add the groups, subtract the overlap).",
        hint: "Could anyone have signed up for both trips? What happens to those people when you just add 20 + 15?",
      },
      {
        topicSlug: "art-of-counting",
        prompt:
          "A coach must (a) pick which 5 of 12 players will start the game, and (b) decide the batting order of those 5. Explain why one of these is a combination and the other a permutation, and which produces more possibilities. (3–5 sentences.)",
        correctAnswer:
          "Picking which 5 players start is a combination, because only *which* players are chosen matters — the same five are the same starting group no matter what order you name them in. Deciding the batting order is a permutation, because rearranging the same five players into a different order is a genuinely different lineup, so order matters. Since each chosen group of 5 can be arranged in many different orders, the batting-order question has far more possibilities than the selection question. The test is simply whether reordering the same items creates something new: no for the roster (combination), yes for the order (permutation).",
        explanation:
          "Full credit: identifies the selection as a combination (order doesn't matter) and the ordering as a permutation (order matters) using the reorder test, and notes the permutation yields more possibilities.",
      },
      {
        topicSlug: "probability",
        prompt:
          "Someone flips a fair coin twice and reasons, 'The chance of getting heads at least once is 1/2 + 1/2 = 1, so it's certain.' Explain what's wrong with this and how to combine the chances correctly. (3–5 sentences.)",
        correctAnswer:
          "Probabilities can't just be added like that — if they could, three flips would give a probability above 1, which is impossible. The flips are independent events, and the clean way to handle 'at least once' is to find the chance of the opposite (no heads at all) and subtract from 1. Each flip has a 1/2 chance of tails, and for independent events you *multiply*, so two tails in a row is 1/2 × 1/2 = 1/4. Therefore the chance of at least one head is 1 − 1/4 = 3/4, not a certainty — the original mistake was adding chances that should have been combined through multiplication.",
        explanation:
          "Full credit: explains you can't simply add (probabilities would exceed 1), uses independence/multiplication, and reaches 'at least one head' = 1 − (1/2 × 1/2) = 3/4 (or equivalent correct reasoning).",
      },
    ],
  },
  {
    kind: "homework",
    title: "Homework 1.2 — Matrices, optimization, money, and the big picture",
    weekNumber: 1,
    isTimed: false,
    timeLimitMinutes: null,
    instructions:
      "Untimed practice covering sections 1.5–1.8. Answer each question in a few sentences (about 3–5) in your own words. No heavy calculations are required — explain your reasoning. One-word answers won't receive credit.",
    problems: [
      {
        topicSlug: "matrices",
        prompt:
          "A café tracks how many coffees and teas it sold at each of its three locations, and it wants both to combine these with last month's numbers and, separately, to solve for prices from a couple of receipts. Explain how organizing the numbers into matrices helps with both tasks. (3–5 sentences.)",
        correctAnswer:
          "A matrix is a grid of numbers where each position has a fixed meaning (which drink, which location), so the café can store all three locations' sales in one organized object. Combining this month with last month is then just matrix addition — adding the numbers in matching positions in a single step instead of one by one. For the prices, the receipts form a system of equations ('so many coffees and teas cost this much'), and packing the coefficients into a matrix lets you solve the whole system with one organized, mechanical procedure. In both cases the grid keeps the numbers in their proper places so a single operation handles them all at once.",
        explanation:
          "Full credit: describes a matrix as a structured grid, explains addition combines matching entries in one step, and that a system of equations becomes solvable as a matrix via an organized procedure.",
      },
      {
        topicSlug: "linear-programming",
        prompt:
          "A bakery wants to make as much profit as possible but has only so much flour, oven time, and labor. Explain how linear programming frames this problem and why you only need to check the 'corners' of the feasible region rather than every possible plan. (3–5 sentences.)",
        correctAnswer:
          "Linear programming splits the problem into an objective — maximize profit — and constraints, the limits on flour, oven time, and labor that no plan may exceed. Together the constraints carve out a feasible region: every production mix that breaks none of the limits. The key result is the corner principle: the best value of the objective always occurs at a corner of that region, where the constraint boundaries meet, never somewhere vaguely in the middle. So instead of testing endlessly many plans, you only compute the profit at the handful of corners and pick the best — a short, finite checklist.",
        explanation:
          "Full credit: identifies the objective (maximize profit) and constraints (limited resources), describes the feasible region, and states the corner principle (the optimum is at a corner, so only corners need checking).",
        hint: "What two pieces does every linear programming problem have, and where does the corner principle say the best answer lives?",
      },
      {
        topicSlug: "math-of-money",
        prompt:
          "Two friends each save the same amount, but one starts ten years earlier and leaves it in an account that compounds. Explain, using the idea of compound interest, why the early starter can end up with far more — even if they both eventually contribute the same total. (3–5 sentences.)",
        correctAnswer:
          "Compound interest pays interest not just on the original money but on the interest already earned, so the balance grows on itself and accelerates over time. The early starter's money has many more years to compound, and it's the later years — when the balance is largest — that add the most, so those extra ten years up front are worth a great deal. Even if both contribute the same total dollars, the early money simply spends longer multiplying, so it grows into a bigger sum. That's why starting early matters so much: time is the lever that lets compounding do its most dramatic work.",
        explanation:
          "Full credit: explains compound interest is interest on interest (accelerating/exponential growth), and that more time lets the early starter's money compound more, especially in the high-balance later years.",
      },
      {
        topicSlug: "finite-math-at-work",
        prompt:
          "A skeptic says, 'Finite math is just a grab-bag of unrelated tricks — it doesn't really add up to anything.' Using ideas from across the course, push back by explaining how the tools work together on a real problem. (3–5 sentences.)",
        correctAnswer:
          "Finite math is a toolbox, and the power comes from combining the tools on one real problem rather than using them in isolation. Pricing an insurance policy, for example, uses counting and probability to find how likely a claim is, then the math of money to value the future payouts. Planning production might use linear programming to set the best mix under limited resources while probability weighs uncertain demand, with sets and logic organizing the categories underneath. The shared thread is a way of thinking — making a messy decision precise enough that the right tool turns it into something countable, measurable, and solvable — so it's far more than a grab-bag of tricks.",
        explanation:
          "Full credit: frames finite math as a combinable toolkit, gives at least one realistic example using two or more tools together, and notes the unifying 'make it precise' way of thinking.",
      },
    ],
  },
  {
    kind: "test",
    title: "Unit Test — Basic Finite Math: Useful Math Without the Infinite",
    weekNumber: 1,
    isTimed: true,
    timeLimitMinutes: 30,
    instructions:
      "Timed. 30 minutes. Covers sections 1.1–1.8. Answer each question in a few sentences (about 4–6) in your own words. No heavy calculations are required. Pasting is disabled; keystrokes are screened for AI use.",
    problems: [
      {
        topicSlug: "what-finite-math-is",
        prompt:
          "Explain what finite math is and how it differs from calculus. Cover what 'finite' refers to, why no calculus is needed, the kinds of tools it includes, and give an example of a real question it answers. (4–6 sentences.)",
        correctAnswer:
          "Finite math is a collection of practical tools for questions about finite, countable situations — collections you could in principle finish counting, like the cards in a deck or the routes among a few cities. It differs from calculus, which is built to handle change and the infinite (curves, limits, endless sums); finite math deliberately stays where things can be listed, counted, and compared, so it needs only arithmetic and careful reasoning. Its tools include sets and logic, counting (permutations and combinations), probability, matrices, linear programming, and the math of money. A real question it answers might be 'how many ways can a 5-person team be chosen from 12 people?' or 'what's the chance of drawing a winning hand?' — concrete, countable questions that never require the infinite.",
        explanation:
          "Full credit: defines finite math as tools for countable/bounded problems, contrasts with calculus (change/the infinite), lists several of its tools, and gives a concrete real example.",
      },
      {
        topicSlug: "sets-and-logic",
        prompt:
          "Explain how sets help organize a problem. Cover what a set is, the meaning of union, intersection, and complement, and how a Venn diagram helps avoid double-counting when groups overlap. (4–6 sentences.)",
        correctAnswer:
          "A set is a well-defined collection of elements where, for any object, you can clearly say whether it belongs — order and repeats don't matter. Sets are combined with three moves: the union gathers everything in either set (the 'or'), the intersection keeps only what's in both (the 'and'), and the complement is everything not in the set. These let vague questions like 'who's in both groups?' or 'who's left out?' be answered precisely. A Venn diagram draws sets as overlapping circles, which makes the shared middle visible so you don't double-count: to count a union you add the groups and subtract the overlap, since the people in both would otherwise be counted twice.",
        explanation:
          "Full credit: defines a set (clear membership), correctly describes union/intersection/complement, and explains the Venn-diagram add-then-subtract-the-overlap method for avoiding double-counting.",
      },
      {
        topicSlug: "art-of-counting",
        prompt:
          "Explain the difference between a permutation and a combination. Cover the multiplication principle, what distinguishes the two, an example of each, and which gives more possibilities. (4–6 sentences.)",
        correctAnswer:
          "The multiplication principle is the foundation: if one choice can be made in a ways and the next in b ways, together they can be made in a × b ways, chaining as far as needed. A permutation counts arrangements where order matters — like awarding gold, silver, and bronze, where who's first versus second is a different outcome. A combination counts selections where order doesn't matter — like choosing 3 pizza toppings, where the same three toppings make the same pizza in any order. Because each selected group can be rearranged many ways, there are always more permutations than combinations of the same items. The deciding question is simply whether rearranging the same items creates something new: yes means permutation, no means combination.",
        explanation:
          "Full credit: states the multiplication principle, distinguishes permutations (order matters) from combinations (order doesn't) with the reorder test, gives an example of each, and notes permutations are more numerous.",
      },
      {
        topicSlug: "probability",
        prompt:
          "Explain how probability measures likelihood. Cover the 0-to-1 scale, the role of equally likely outcomes, when to add versus multiply chances, and what expected value tells you. (4–6 sentences.)",
        correctAnswer:
          "A probability is a number from 0 (impossible) to 1 (certain), found, when outcomes are equally likely, as the number of favorable outcomes divided by the total number of possible outcomes — which is why careful counting matters so much. For combining events, 'this or that' adds the chances (subtracting any overlap, like a Venn diagram), while 'this and that' for independent events multiplies them. Mixing these up — or assuming independence when the events actually affect each other — is the most common error. Expected value asks what you'd get on average over many repetitions: multiply each outcome by its probability and add, which is how insurers set premiums and how you tell a fair bet from a bad one.",
        explanation:
          "Full credit: describes the 0–1 scale and favorable/total fraction for equally likely outcomes, explains add for 'or' and multiply for independent 'and', and defines expected value as the probability-weighted average.",
      },
      {
        topicSlug: "matrices",
        prompt:
          "Explain what a matrix is and why organizing numbers into a grid is useful. Cover what a matrix looks like, how matrix addition works, how a system of equations becomes a matrix, and why solving it is mechanical. (4–6 sentences.)",
        correctAnswer:
          "A matrix is a rectangular grid of numbers arranged in rows and columns, where each position carries a fixed meaning — like a small, structured spreadsheet. Organizing data this way lets you operate on the whole grid at once: matrix addition, for example, just adds the numbers in matching positions, combining two batches of data in a single step. A system of equations — several conditions that must all hold, like prices implied by a couple of receipts — can be packed into a matrix by lining up its numbers in their proper places. Solving is then mechanical: you transform the matrix with simple legal moves (scaling a row, adding rows) following a fixed recipe until the answer reads off the grid, which is exactly why computers handle it so well.",
        explanation:
          "Full credit: defines a matrix (grid of rows/columns with positional meaning), describes addition of matching entries, explains a system of equations becomes a matrix, and notes solving follows a fixed mechanical procedure.",
      },
      {
        topicSlug: "linear-programming",
        prompt:
          "Explain how linear programming finds the best choice under limits. Cover the objective and constraints, the feasible region, the corner principle, and how you read off the best answer. (4–6 sentences.)",
        correctAnswer:
          "Linear programming frames a decision as an objective — the single quantity to maximize or minimize, like profit or cost — together with constraints, the limits (budget, materials, time) that no plan may break. The constraints together carve out the feasible region: every choice that satisfies all the limits at once. The corner principle is the key result: the best value of the objective always occurs at a corner of that region, where boundary lines meet, never vaguely in the interior. So you find the corners, calculate the objective at each, and pick the corner with the best value — turning an overwhelming 'try everything' into a short, finite checklist that gives the exact optimal mix.",
        explanation:
          "Full credit: identifies objective and constraints, describes the feasible region, states the corner principle, and explains evaluating the objective at each corner to pick the best.",
      },
      {
        topicSlug: "math-of-money",
        prompt:
          "Explain the math of money. Cover the difference between simple and compound interest, why compounding is so powerful, how loan payments work, and why starting to save early matters. (4–6 sentences.)",
        correctAnswer:
          "Simple interest is paid only on the original amount, so it adds the same fixed sum each period, while compound interest pays interest on the interest already earned, so the balance grows on itself and accelerates. That acceleration makes compounding powerful: money grows exponentially rather than steadily, with the largest gains coming in the later years when the balance is biggest. A loan turns this around — the lender charges compound interest and you make regular payments, each covering that period's interest first and only then reducing the balance, which is why early payments barely dent what you owe. Starting to save early matters because the money has more years to compound, and those extra early years let the growth do its most dramatic work, so an early start can beat contributing more later.",
        explanation:
          "Full credit: contrasts simple (on principal only) vs. compound (interest on interest) interest, explains compounding's accelerating/exponential growth, describes loan payments covering interest first, and why early saving benefits from more compounding time.",
      },
      {
        topicSlug: "finite-math-at-work",
        prompt:
          "Pull the course together: explain how the tools of finite math fit into one toolkit and how they combine on a real problem. Name several tools and give a concrete example using more than one. (4–6 sentences.)",
        correctAnswer:
          "Finite math is a toolbox rather than a single theorem: sets and logic organize a situation into clear categories, counting tells you how many possibilities there are, probability measures how likely each is, matrices organize and solve when many numbers interact, linear programming finds the best choice under limits, and the math of money handles growth over time. The real skill is breaking a messy decision into the clean sub-questions each tool was built to answer, often using several together. Pricing an insurance policy, for instance, uses counting and probability to find how likely a claim is, then the math of money to value the future payouts. Planning a product launch might use linear programming to set the production mix while probability weighs uncertain demand. The unifying thread is a habit of making problems precise enough that the right tool turns them into something countable, measurable, and solvable.",
        explanation:
          "Full credit: frames finite math as a combinable toolkit, names several tools with their roles, and gives at least one concrete example that uses more than one tool together.",
      },
    ],
  },
  {
    kind: "final",
    title: "Final — Basic Finite Math: Useful Math Without the Infinite",
    weekNumber: 1,
    isTimed: true,
    timeLimitMinutes: 45,
    instructions:
      "Timed cumulative final. 45 minutes. Covers the whole course (sections 1.1–1.8). Answer each question in a paragraph (about 5–7 sentences) in your own words. No heavy calculations are required. Pasting is disabled; keystrokes are screened for AI use.",
    problems: [
      {
        topicSlug: "finite-math-at-work",
        prompt:
          "Using ideas from across the whole course, trace how finite math takes a messy real decision and turns it into a confident answer. Show how at least four different tools fit together (for example: sets and logic, counting, probability, matrices, linear programming, the math of money). (5–7 sentences.)",
        correctAnswer:
          "It starts by organizing the situation: sets and logic sort the people, options, or conditions into clear categories and pin down exactly what you mean. Counting then tells you how many possibilities those categories contain — how many ways a team, route, or selection could go — using permutations when order matters and combinations when it doesn't. Probability builds directly on that counting to measure how likely each possibility is, turning vague hunches about risk into numbers, and expected value tells you what to expect on average. When many numbers and conditions interact, matrices keep them organized and let you solve whole systems mechanically, and when resources are limited, linear programming finds the single best choice by checking the corners of the feasible region. Finally, the math of money values anything that grows or shrinks over time, so future costs and payoffs can be compared today. Put together, these tools take a tangled 'what should I do?' and break it into countable, measurable sub-questions, each answered by the tool built for it — which is the whole point of finite math.",
        explanation:
          "Full credit: traces a coherent path through at least four tools (e.g. sets/logic → counting → probability → matrices/linear programming → math of money), correctly describing each tool's role and how they connect.",
      },
      {
        topicSlug: "art-of-counting",
        prompt:
          "Someone says, 'Counting is trivial — there's nothing to learn; you just count.' Using the course's ideas, argue why counting possibilities is a real skill, using a concrete example where the permutation-vs-combination distinction changes the answer. (5–7 sentences.)",
        correctAnswer:
          "Counting feels trivial only until the possibilities are too many to list, which is exactly when technique matters. The foundation is the multiplication principle — multiply the number of independent choices — but the real skill is deciding whether order matters. Consider a club of 10 people: choosing officers versus choosing a committee gives different answers. Picking a president, vice-president, and treasurer is a permutation, because the same three people in different roles is a different outcome, so order counts. Picking a three-person committee from the same 10 is a combination, because the same three people are the same committee no matter the order, so order doesn't count. The committee count is smaller, since every committee corresponds to several role-assignments that all collapse to the same group. Getting that one distinction wrong over- or under-counts badly, which is why 'just count' hides a genuine skill — the answer depends entirely on whether rearranging the same items creates something new.",
        explanation:
          "Full credit: explains why counting needs technique (too many to list, multiplication principle), and gives a concrete example where permutation (order matters) vs. combination (order doesn't) changes the answer, with the smaller count for combinations.",
      },
      {
        topicSlug: "probability",
        prompt:
          "A friend insists, 'A medical test that's 99% accurate means a positive result is almost certainly correct.' Using the course's ideas about probability — especially conditional probability — explain why this confident intuition can be wrong. Use a concrete example. (5–7 sentences.)",
        correctAnswer:
          "The intuition ignores that what a positive result means depends on how common the condition is — that's conditional probability, the chance of being sick *given* a positive test, which is not the same as the test's accuracy. Imagine a disease that affects 1 in 1,000 people and a test that's 99% accurate. Out of 100,000 people, about 100 truly have it, and at 99% roughly 99 of them test positive, but among the ~99,900 healthy people, 1% — about 999 — also test positive by error. So there are far more false positives (999) than true positives (99), and a randomly positive person actually has only about a 9% chance of being sick. The accuracy number alone is misleading because a rare condition lets false positives swamp the true ones. The right question is always conditional — given this result, how likely is the condition, taking the base rate into account — not just how accurate the test is.",
        explanation:
          "Full credit: distinguishes test accuracy from the conditional probability of being sick given a positive, uses the base rate to show false positives can outnumber true positives for a rare condition, and concludes a positive can be far from certain.",
      },
      {
        topicSlug: "linear-programming",
        prompt:
          "A manager says, 'To find the most profitable plan I'd have to try every possible combination — there are way too many, so I'll just guess.' Using linear programming, explain why they don't need to try everything and how the method finds the true optimum. Use a concrete example. (5–7 sentences.)",
        correctAnswer:
          "Linear programming shows the guess is unnecessary because the best plan is never hidden somewhere in the vast middle of the options. First you frame the decision: an objective (maximize profit) and constraints (limited labor, materials, budget) that no plan may break. Together the constraints carve out a feasible region of all allowed plans, and the corner principle guarantees the optimum sits at a corner of that region, where boundary lines meet. So for a workshop making, say, tables and chairs under limited wood and hours, you don't test endless mixes — you find the handful of corner points, compute the profit at each, and pick the best. That turns an overwhelming 'try everything' into a short, finite checklist, and unlike guessing it returns the exact optimal mix rather than a hopeful one. The method works precisely because the answer is always cornered, so only finitely many candidates ever need checking.",
        explanation:
          "Full credit: sets up objective and constraints, describes the feasible region, invokes the corner principle to explain only corners need checking, applies it to a concrete example, and notes this gives the true optimum rather than a guess.",
      },
      {
        topicSlug: "math-of-money",
        prompt:
          "A friend says, 'Saving a little now versus later barely matters, and interest is interest — there's nothing tricky about it.' Using the course's ideas about simple versus compound interest, explain why this is wrong and why timing matters so much. Use a concrete example. (5–7 sentences.)",
        correctAnswer:
          "The claim misses the difference between simple and compound interest. Simple interest pays only on the original amount, so it adds the same fixed sum each year, but compound interest pays interest on the interest already earned, so the balance grows on itself and accelerates. Picture \\$1,000 at 7%: under simple interest it gains \\$70 every year forever, but under compounding it gains \\$70 the first year, then 7% of \\$1,070 the next, and a bit more each year, roughly doubling over about a decade and then doubling again. Because the biggest gains come in the later years when the balance is largest, money saved early spends far more time multiplying than the same money saved later. That's why timing matters enormously — an early start can beat a larger contribution made years afterward — and why the same compounding makes high-interest debt so dangerous when it works against you. So interest is not just interest: whether it compounds, and for how long, changes the outcome dramatically.",
        explanation:
          "Full credit: contrasts simple vs. compound interest, explains compounding's accelerating/exponential growth with a concrete example, and shows why an early start matters (more time compounding, biggest gains late), optionally noting debt compounds against you.",
      },
    ],
  },
];

type SeedPrimer = SeedTopic;

const REASONING_PRIMERS: SeedPrimer[] = [
  {
    slug: "reasoning-primer-subject",
    title: "How to reason about finite-math cases",
    weekNumber: 1,
    blurb:
      "Diagnostic primer: applying the course's tools to concrete situations about counting, chance, optimizing, and money.",
    lectureTitle: "Primer: How to reason about finite-math cases",
    body: `# How to reason about finite-math cases

This short primer prepares you for the **Finite Math** diagnostic. That check is *ungraded practice* — it never affects your course grade. It is drawn from the eight topics of this unit and asks you to *apply* what you have learned to a specific situation, not to recite a definition.

## It tests application, not memorization

A diagnostic question gives you a small, concrete scene — two groups that overlap, a selection where you must decide whether order matters, a test result whose meaning depends on how rare a condition is, a plan squeezed by limited resources, money left to grow over time — and asks what the course's tools tell you about it. Knowing the words "combination" or "compound interest" is not enough; the question wants you to recognize *which* tool fits and *why* it matters here.

## What the questions reward

- **Reaching for the right tool** — match the situation to the idea that fits it: organizing with sets and logic, counting with permutations or combinations, measuring chance with probability, solving with matrices, optimizing with linear programming, or handling growth with the math of money.
- **Using evidence from the scene** — point to the detail that decides it (does order matter? do the groups overlap? are the events independent? how long does the money compound?), rather than answering from a general impression.
- **Avoiding the lazy guess** — finite math replaces reflexes like "just add the two groups" or "a 99%-accurate test is almost always right" with careful reasoning. The best answers resist those reflexes and stay grounded in what the situation actually says.

## How to do this activity well

1. **Read the situation first**, then ask which topic it belongs to.
2. **Find the detail that decides it** — the overlap, the order, the independence, the constraint, the time — that makes one answer better than another.
3. For written items, **give the core idea in a sentence or two** — clear and correct beats long and padded.

Take it as often as you like; the questions are freshly generated every time, and there is no penalty for any answer.`,
  },
  {
    slug: "reasoning-primer-general",
    title: "Core reasoning skills",
    weekNumber: 1,
    blurb:
      "Diagnostic primer: analysis, inference, evaluation, deduction, and induction.",
    lectureTitle: "Primer: Core reasoning skills",
    body: `# Core reasoning skills

This short primer prepares you for the **General Reasoning** diagnostic — an *ungraded* check that tests five genuine reasoning skills. These are the same skills you use to decide what a set of facts really shows, so they matter directly for thinking clearly about finite math.

## The five skills

- **Analysis** — break an argument into parts: find its **point** (the conclusion), the **reasons** given for it, and any hidden assumption it leans on. Ask: "What is this trying to convince me of, and what does it take for granted?"
- **Inference** — work out what *follows* from what you're told, and how strongly. Tell apart what *must* be true, what is *likely*, and what is only *possible*.
- **Evaluation** — judge how much the reasons actually support the point. Notice when evidence is beside the point, a source isn't trustworthy, or a step doesn't really connect.
- **Deduction** — reasoning where true starting facts *guarantee* the conclusion. If the starting facts are true, the conclusion can't be false. Watch for sneaky forms that only *look* airtight.
- **Induction** — reasoning from a few examples to a *probable* general rule or prediction. Strong induction uses many fair examples; weak induction over-generalizes from too few.

## A recurring trap: things that move together

Most wrong answers are statements that *sound* reasonable but are **not actually backed up by what you were told**. The discipline this check rewards is the same one careful mathematical thinking demands: keep apart what the facts **show**, what you're **assuming**, and what only *sounds* right. Two things happening together does not prove one causes the other.

## How to do this activity well

1. Find the **point** (conclusion) first, then the reasons.
2. Ask which of the five skills the question is testing (a hidden-assumption question is analysis; a "what follows" question is inference or deduction; a "how good is this reasoning" question is evaluation).
3. Pick the option that follows **only** from what you were given — not the one that merely sounds true or appealing.

Take it as often as you like; the questions are freshly generated every time, and it never affects your grade.`,
  },
];

// Insert any teaching-to-the-test primer lectures whose slug is not yet present.
// Safe to run on every boot: it only adds what is missing.
export async function seedReasoningPrimersIfMissing(): Promise<void> {
  const currentSlugs = REASONING_PRIMERS.map((p) => p.slug);
  // Remove any obsolete primer topics from earlier diagnostic models (their
  // lectures cascade-delete), so renamed/retired primers self-heal instead of
  // stranding stale content in existing or republished databases.
  const stale = await db
    .delete(topicsTable)
    .where(
      and(
        like(topicsTable.slug, "reasoning-primer-%"),
        notInArray(topicsTable.slug, currentSlugs),
      ),
    )
    .returning({ slug: topicsTable.slug });
  if (stale.length > 0) {
    logger.info(
      { removed: stale.map((s) => s.slug) },
      "Reasoning primers: removed obsolete primers",
    );
  }
  let added = 0;
  for (let i = 0; i < REASONING_PRIMERS.length; i++) {
    const t = REASONING_PRIMERS[i]!;
    const existing = await db
      .select({ id: topicsTable.id })
      .from(topicsTable)
      .where(eq(topicsTable.slug, t.slug));
    if (existing.length > 0) continue;
    const [inserted] = await db
      .insert(topicsTable)
      .values({
        slug: t.slug,
        title: t.title,
        weekNumber: t.weekNumber,
        blurb: t.blurb,
        position: 900 + i,
      })
      .returning();
    if (!inserted) throw new Error(`Failed to insert primer ${t.slug}`);
    await db.insert(lecturesTable).values({
      topicId: inserted.id,
      weekNumber: t.weekNumber,
      title: t.lectureTitle,
      body: t.body,
    });
    added += 1;
  }
  if (added > 0) {
    logger.info({ added }, "Reasoning primers seeded");
  } else {
    logger.info("Reasoning primers: already present, skipping");
  }
}

export async function seedIfEmpty(): Promise<void> {
  // The course was migrated to the Basic Finite Math syllabus. Detect the
  // marker topic; if present and the content version matches, the content is
  // current and we skip. This makes the seed self-healing across environments: a
  // database that still holds older content (e.g. a previous curriculum) is
  // detected and replaced on boot.
  const markerTopic = await db
    .select({ id: topicsTable.id })
    .from(topicsTable)
    .where(eq(topicsTable.slug, "what-finite-math-is"));
  // Read the stored content version. Tolerate the seed_meta table not yet
  // existing (e.g. a boot that races ahead of schema migration): treat that as
  // "no version recorded", which forces a reseed once the table is present.
  let currentVersion: string | null = null;
  try {
    const storedVersion = await db
      .select({ value: seedMetaTable.value })
      .from(seedMetaTable)
      .where(eq(seedMetaTable.key, "content_version"));
    currentVersion = storedVersion[0]?.value ?? null;
  } catch (err) {
    logger.warn({ err: (err as Error).message }, "Seed: seed_meta unavailable, treating version as unset");
    currentVersion = null;
  }
  if (markerTopic.length > 0 && currentVersion === SEED_CONTENT_VERSION) {
    logger.info("Seed: course content present and current, skipping");
    return;
  }
  if (markerTopic.length > 0) {
    logger.warn(
      { storedVersion: currentVersion, expected: SEED_CONTENT_VERSION },
      "Seed: course content present but out of date — re-seeding with the current curriculum",
    );
  }

  // No current content. Either the database is empty (fresh) or it still holds
  // an older curriculum. Do the (optional) wipe and the full reseed in a SINGLE
  // transaction so the marker topic only ever becomes visible once the entire
  // curriculum has committed. A crash mid-seed rolls back, so the next boot
  // retries instead of leaving partial content that the marker check would
  // wrongly treat as healthy. TRUNCATE also takes an ACCESS EXCLUSIVE lock, so
  // concurrent readers never observe a half-empty course during the replace
  // window. The diagnostic tables are truncated here too so the (non
  // version-gated) diagnostic seed repopulates them with the current content on
  // the same boot.
  await db.transaction(async (tx) => {
    const existing = await tx.execute(sql`select count(*)::int as n from topics`);
    const row = (existing.rows[0] ?? {}) as { n?: number };
    if ((row.n ?? 0) > 0) {
      logger.warn(
        "Seed: stale course content detected — replacing with the Basic Finite Math curriculum",
      );
      await tx.execute(
        sql`TRUNCATE TABLE answers, attempts, practice_attempts, practice_problems, practice_sessions, problems, assignments, lectures, topics, diagnostic_responses, diagnostic_attempts, diagnostic_items, diagnostic_assessments RESTART IDENTITY CASCADE`,
      );
    } else {
      logger.info("Seed: populating course content");
    }

    // Topics + lectures
    const slugToTopicId = new Map<string, number>();
    for (let i = 0; i < TOPICS.length; i++) {
      const t = TOPICS[i]!;
      const [inserted] = await tx
        .insert(topicsTable)
        .values({
          slug: t.slug,
          title: t.title,
          weekNumber: t.weekNumber,
          blurb: t.blurb,
          position: i,
        })
        .returning();
      if (!inserted) throw new Error(`Failed to insert topic ${t.slug}`);
      slugToTopicId.set(t.slug, inserted.id);
      await tx.insert(lecturesTable).values({
        topicId: inserted.id,
        weekNumber: t.weekNumber,
        title: t.lectureTitle,
        body: t.body,
      });
    }

    // Assignments + problems
    for (let i = 0; i < ASSIGNMENTS.length; i++) {
      const a = ASSIGNMENTS[i]!;
      const [inserted] = await tx
        .insert(assignmentsTable)
        .values({
          kind: a.kind,
          title: a.title,
          weekNumber: a.weekNumber,
          position: i,
          isTimed: a.isTimed,
          timeLimitMinutes: a.timeLimitMinutes,
          instructions: a.instructions,
        })
        .returning();
      if (!inserted) throw new Error(`Failed to insert assignment ${a.title}`);
      for (let p = 0; p < a.problems.length; p++) {
        const prob = a.problems[p]!;
        const topicId = slugToTopicId.get(prob.topicSlug);
        if (!topicId) throw new Error(`Unknown topic slug ${prob.topicSlug}`);
        await tx.insert(problemsTable).values({
          assignmentId: inserted.id,
          topicId,
          position: p,
          prompt: prob.prompt,
          correctAnswer: prob.correctAnswer,
          explanation: prob.explanation,
          hint: prob.hint ?? null,
        });
      }
    }

    // Stamp the content version last, inside the same transaction, so the
    // marker check on the next boot only treats the course as "current" once
    // the entire curriculum has committed.
    await tx
      .insert(seedMetaTable)
      .values({ key: "content_version", value: SEED_CONTENT_VERSION })
      .onConflictDoUpdate({
        target: seedMetaTable.key,
        set: { value: SEED_CONTENT_VERSION, updatedAt: new Date() },
      });
  });

  logger.info(
    { topics: TOPICS.length, assignments: ASSIGNMENTS.length, version: SEED_CONTENT_VERSION },
    "Seed complete",
  );
}
