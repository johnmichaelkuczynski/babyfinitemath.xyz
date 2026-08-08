import type { SeedTopic, SeedAssignment } from "./types";

export const WEEK3_TOPICS: SeedTopic[] = [
  {
    slug: "structured-output",
    title: "Structured output",
    weekNumber: 3,
    blurb:
      "When a program has to read what a model writes, prose is a liability — this section shows how to make a model return clean, predictable JSON you can trust.",
    lectureTitle: "3.1 Getting structured output (JSON and schemas)",
    body: `# Getting structured output (JSON and schemas)

Up to now you have mostly asked models for answers a person will read. But the moment another program has to consume the answer, free-flowing prose becomes a problem. A downstream system can't reliably pull a price out of the sentence "It'll run you about forty bucks, maybe a little more." What software needs is **structured output** — data laid out in a fixed shape, with known fields and predictable types, so a machine can parse it without guessing. The most common shape today is **JSON**, and getting a model to produce it reliably is one of the most useful skills in this course.

## Why plain prose breaks programs

A program reads by position and by name. It expects to find a field called "price" holding a number, not a friendly paragraph. When you ask a model for a plain-English answer and then try to extract data from it with pattern matching, you are building on sand: the phrasing changes from one call to the next, and your extraction code fails the first time the model says "free" instead of "0.00". Structured output removes the guesswork. Instead of hoping to find the number, you say up front: return an object with a numeric price field, and the value shows up in a spot you already know how to read.

## Asking for JSON on purpose

The simplest technique is to describe the exact object you want and give an example of it. Tell the model plainly: respond with a single JSON object with these keys — name (a string), quantity (an integer), in_stock (true or false) — and nothing else. Showing one filled-in example is worth more than any description, because the model continues the pattern you demonstrate. A prompt like *"Return only JSON. Example: name: 'Bolt', quantity: 12, in_stock: true"* pins down the shape far better than the word "structured" ever could.

## Schemas: writing the contract down

A **schema** is a formal description of the allowed shape: which fields exist, what type each one is, and which are required. Some model APIs let you attach a schema so the output is validated or even forced to conform. Even when the platform offers no such feature, writing the schema into your prompt clarifies your own thinking and gives the model an unambiguous target. Treat the schema as a contract between your prompt and your code: both sides agree on the field names and types in advance, so neither has to improvise.

## Guarding against the ragged edges

Models like to be helpful, which often means wrapping JSON in an explanation — "Sure! Here's your data:" — or trailing off with commentary. That extra text breaks a strict parser. Defend against it: say "output only the JSON object, no prose, no code fences," and in your code, still parse defensively and handle the case where parsing fails. A good pattern is to attempt to parse, and if it fails, either retry with a firmer instruction or trim the surrounding text. Assume the output will occasionally be imperfect and build a fallback rather than trusting every response blindly.

## In the real world

An expense app photographs a receipt and needs the vendor, date, and total to file it automatically. Asking the model for a sentence would force brittle text-scraping; instead the prompt requests a JSON object with three named fields, and the app reads them directly into its database. A support tool classifies incoming tickets by returning a category and an urgency score as structured fields, which a router then uses without a human in the loop. In each case the structure is what turns a clever answer into something a system can act on reliably, thousands of times a day.`,
  },
  {
    slug: "prompt-chaining",
    title: "Prompt chaining",
    weekNumber: 3,
    blurb:
      "Some jobs are too big for one prompt — chaining lets you pass the output of one call into the next, building a pipeline where each step does one thing well.",
    lectureTitle: "3.2 Prompt chaining: linking multiple calls",
    body: `# Prompt chaining: linking multiple calls

A single prompt can only carry so much. When a task has several distinct stages — gather, analyze, then write — cramming all of it into one instruction usually produces a muddled result, because the model tries to juggle every goal at once. **Prompt chaining** is the practice of breaking the work into separate calls and feeding the output of one call into the input of the next. Instead of one heroic prompt, you build a small assembly line, where each station handles a single, well-defined job and hands its result down the line.

## Why one prompt often isn't enough

Complex tasks contain hidden sub-tasks that pull in different directions. Suppose you want a polished market summary from a pile of customer reviews. That really involves extracting the themes, judging sentiment, and then composing readable prose — three different mental modes. Asked to do all three at once, a model tends to shortchange some of them, skimming the extraction to get to the writing. Splitting the work lets each step get the model's full attention, and it lets you inspect the intermediate results instead of trusting one opaque leap from raw input to finished output.

## Passing output forward as input

The mechanics are simple: run the first prompt, capture its answer, and drop that answer into the second prompt as context. A chain to draft a reply to an angry email might be — step one: summarize the customer's core complaint in two sentences; step two: given that summary, list the facts we can confirm; step three: given the complaint and the confirmed facts, write a calm, specific reply. Each step's output becomes the raw material for the next. Because the handoffs are explicit, you control exactly what information travels downstream and what gets left behind.

## Designing the seams between steps

The quality of a chain lives in its **handoffs** — the format each step produces and the next step expects. If step one returns a loose paragraph but step two needs a list, you have created friction. Design the seams deliberately: have the extraction step return a clean list of items, and have the next step consume that list. Structured output from the previous section is your friend here, because a well-shaped intermediate result plugs cleanly into the following prompt. Think of each step as a function with a defined input and output, and the chain becomes far easier to reason about.

## Weighing the cost of more steps

Chaining is powerful but not free. Every additional call adds latency and cost, and errors can compound — a small mistake in step one becomes the flawed foundation for everything after it. So chain only where it earns its keep: when a task genuinely has distinct phases, when you need to inspect intermediate results, or when one giant prompt has proven unreliable. If a single well-written prompt does the job, keep it. The goal is not to build the longest chain but the shortest one that makes the work dependable.

## In the real world

A legal-tech tool reviews contracts in a chain: the first call extracts every clause into a list, the second flags which clauses are unusual, and the third drafts a plain-language note explaining each flagged clause to the client. Splitting the work means a reviewer can check the extracted clauses before any analysis runs, catching errors early. A content pipeline might research a topic, outline an article from that research, then write each section from the outline — three linked calls that together produce something no single prompt could match in coherence or accuracy.`,
  },
  {
    slug: "self-critique",
    title: "Self-critique and revision",
    weekNumber: 3,
    blurb:
      "A model's first draft is rarely its best — asking it to review and revise its own work catches mistakes that a single pass would leave in place.",
    lectureTitle: "3.3 Self-critique and revision prompts",
    body: `# Self-critique and revision prompts

When you write, your first draft is seldom your final one — you reread it, notice a weak argument or a factual slip, and fix it. Models benefit from the same discipline. A **self-critique** prompt asks the model to examine its own output against a standard, name the problems it finds, and then produce a revised version. This works because generating an answer and evaluating an answer are different tasks, and a model doing the second job with fresh instructions often spots flaws that slipped past it the first time.

## Why a second look helps

A model produces text one piece at a time, committing to each choice as it goes, with no built-in step to pause and reconsider. That single forward pass can leave in contradictions, missed requirements, or claims that don't hold up. When you follow the draft with a separate prompt — "review the answer above for accuracy and for anything the instructions asked for but it missed" — you give the model a dedicated evaluation pass. It is no longer racing forward; it is checking. This separation of drafting from reviewing is the whole engine behind self-critique.

## Giving critique something to measure against

Vague self-review yields vague improvements. "Make it better" invites the model to fiddle aimlessly. Effective critique prompts supply a concrete standard: a checklist, a rubric, or the original requirements restated. Tell the model exactly what to check — "verify every number matches the source data, confirm the tone stays formal, and ensure all three questions are answered" — and the review becomes targeted. The clearer the yardstick, the more useful the critique. You are essentially handing the model the same acceptance criteria a human reviewer would use.

## The critique-then-revise loop

The strongest pattern is two moves in sequence. First, ask the model to list specific problems without rewriting anything yet — this forces it to articulate what's wrong before fixing it, much as a good editor marks up a draft before touching the prose. Then, in a follow-up, ask it to rewrite the piece addressing each listed problem. Separating "find the flaws" from "fix the flaws" produces cleaner results than asking for both at once, because the model commits to a diagnosis first and then works against it, rather than quietly papering over issues as it rewrites.

## Knowing when to stop

Self-critique has diminishing returns. One or two rounds usually capture most of the gain; beyond that, the model may start second-guessing correct choices or drifting from the original intent, polishing away substance. It also cannot catch every kind of error — if it lacks the knowledge to know a fact is wrong in the first place, reviewing its own work won't reveal the mistake, and it may even defend the error confidently. Treat self-critique as a strong tool for coherence, completeness, and following instructions, but pair it with outside grounding when factual accuracy is on the line.

## In the real world

A grant-writing assistant drafts a proposal, then runs a critique pass against the funder's published criteria, flagging any requirement it failed to address before revising. A coding helper writes a function, then reviews it specifically for edge cases and unhandled errors, catching a division-by-zero it missed on the first pass. In both cases the second look is cheap relative to the cost of shipping a flawed result, and the explicit standard — the funder's criteria, the list of edge cases — is what turns a fuzzy "improve it" into a genuinely better draft.`,
  },
  {
    slug: "grounding-with-retrieval",
    title: "Grounding with retrieval",
    weekNumber: 3,
    blurb:
      "A model only knows what it was trained on — retrieval feeds it the right documents at prompt time so its answers rest on your facts, not its guesses.",
    lectureTitle: "3.4 Grounding with retrieval (RAG in plain terms)",
    body: `# Grounding with retrieval (RAG in plain terms)

A model's knowledge is frozen at the moment its training ended, and it never saw your private documents, your latest policy, or last week's data. Ask it about any of those and it will either admit ignorance or, worse, invent something plausible. **Grounding with retrieval** solves this by fetching the relevant facts and placing them directly into the prompt, so the model answers from material you supply rather than from memory. The popular name for this approach is **retrieval-augmented generation**, or RAG, but the idea is simpler than the acronym: look up the right information first, then ask the question with that information attached.

## Why the model needs outside facts

The model is a general reasoner with a broad but fixed store of knowledge. It cannot know your company's refund policy, the contents of a document you wrote yesterday, or a number that changes daily. When it lacks a fact, its tendency to produce fluent text means it may fill the gap with a confident guess. Grounding removes the need to guess by making the fact present. The model shifts from "recall what you were trained on" to "answer using the text in front of you," which is a far more reliable mode.

## How retrieval works in plain terms

The pattern has two stages. First, **retrieve**: given the user's question, search a collection of documents and pull out the few passages most likely to contain the answer. This search usually matches on meaning rather than exact words, so a question about "getting my money back" can surface a passage titled "refund policy." Second, **generate**: paste those retrieved passages into the prompt as context and ask the model to answer using only that material. The model does what it's good at — reading and synthesizing — over text that you have guaranteed is relevant and current.

## Telling the model to stay grounded

Supplying documents is not enough; you must instruct the model to lean on them. Say plainly: "Answer using only the passages provided. If the answer isn't in them, say you don't know." Without that instruction the model may blend the retrieved text with its own assumptions and quietly reintroduce errors. Asking it to cite which passage supports each claim makes the grounding checkable and discourages drift. The discipline is to bind the answer to the evidence, so a reader — or you — can trace every statement back to a source you provided.

## Where retrieval falls short

Retrieval is only as good as what it fetches. If the search misses the relevant passage, the model is left grounded in the wrong text and may still answer confidently from an unrelated document. If the collection itself is outdated or contradictory, those flaws flow straight into the answer. So the retrieval step deserves as much care as the prompt: sensible document chunks, a search that surfaces the right material, and a fallback when nothing relevant is found. Grounding shifts the burden of accuracy onto your retrieval, which is usually a burden worth taking on.

## In the real world

A customer-support assistant answers billing questions by first searching the current help-center articles, then answering strictly from the top matches and linking each to its source, so it never quotes an expired policy. An internal research tool lets employees ask questions of a thousand-page technical manual: it retrieves the two or three relevant sections and answers from them, complete with page references a person can verify. In both systems the model's fluency is harnessed to your facts, giving answers that are both readable and, crucially, correct for your specific situation.`,
  },
  {
    slug: "tool-use",
    title: "Tool use and function calling",
    weekNumber: 3,
    blurb:
      "A model can't check today's weather or do exact arithmetic on its own — tool use lets it call real functions and fold the results back into its answer.",
    lectureTitle: "3.5 Tool use and function calling",
    body: `# Tool use and function calling

A language model predicts text; it does not, on its own, run code, query a database, or look up a live price. Left to itself it will happily *describe* the weather in a city it knows nothing about. **Tool use** — often implemented through **function calling** — bridges that gap. You describe a set of functions the model may invoke, and when a question calls for one, the model responds not with a made-up answer but with a request to run that function, along with the arguments to pass. Your code runs the function, returns the result, and the model weaves that real result into its reply.

## What a model can't do alone

The model has no clock, no calculator it trusts, and no connection to the outside world. It can reason about arithmetic but may slip on a long multiplication; it can talk about your account balance but cannot see it. These are not flaws in reasoning — they are missing capabilities. Tool use supplies exactly those capabilities: a function that returns the current time, one that computes a sum precisely, one that fetches a record from your system. The model stays in charge of deciding *when* a tool is needed and *what* to ask it, while the tool handles the part the model can't.

## How function calling works

You give the model a description of each available function: its name, what it does, and the arguments it expects, usually as a small schema. When the user asks something that needs a tool — say, "what's the weather in Denver?" — the model doesn't invent a forecast. It emits a structured request naming the function, say get_weather, with the argument city set to Denver. Your program sees that request, actually calls your weather service, and hands the real data back to the model. The model then composes a natural-language answer grounded in that data. The model chooses and fills in the call; your code does the work.

## Describing tools so the model uses them well

The model can only use a tool as well as you describe it. A clear name, a plain-language explanation of when to use it, and precise argument definitions all steer the model toward correct calls. Vague descriptions lead to the tool being ignored or called with garbage arguments. Spell out the boundaries — "use search_orders only when the user references a specific order number" — so the model knows not just how to call the function but when it's appropriate. Good tool descriptions are a form of prompt engineering in their own right.

## Handling calls that go wrong

Tools fail: a service times out, an argument is invalid, a search returns nothing. A robust setup expects this. When a call errors, return a clear message to the model so it can adjust — retry, ask the user for clarification, or explain the limitation rather than pretending it succeeded. It is also wise to validate the arguments the model produces before acting on them, since a confidently wrong argument can otherwise trigger a real, unwanted action. Treat the model's tool requests as untrusted input that your code checks before executing.

## In the real world

A travel assistant answers "is my flight on time?" by calling a live flight-status function with the user's confirmation number, then reporting the actual gate and delay. A finance bot computes a loan payment by invoking a real calculator function instead of estimating in its head, guaranteeing the arithmetic is exact. In both, the model's job is comprehension and phrasing, while the tools supply truth the model could never produce alone — the combination is what makes an assistant genuinely useful rather than merely conversational.`,
  },
  {
    slug: "temperature-and-sampling",
    title: "Temperature and sampling",
    weekNumber: 3,
    blurb:
      "The same prompt can give a different answer each time — understanding temperature and sampling lets you dial a model between rock-steady and wildly creative.",
    lectureTitle: "3.6 Controlling randomness: temperature and sampling",
    body: `# Controlling randomness: temperature and sampling

Run the same prompt twice and you may get two different answers. That is not a bug — it is a deliberate feature of how models generate text. At each step the model doesn't pick a single "correct" next word; it produces a range of candidates with different probabilities and then **samples** one from that range. How adventurously it samples is governed mostly by a setting called **temperature**. Understanding this dial lets you decide, task by task, whether you want the model rock-steady and repeatable or loose and inventive.

## Why the same prompt varies

Internally, after reading your prompt, the model computes a probability for every possible next word — "the" might be likely, "purple" unlikely, and thousands of others somewhere in between. Rather than always choosing the single most probable word, it draws from this distribution. Because the draw involves chance, two runs can diverge, and once they diverge on one word they may continue down different paths. This built-in randomness is what gives model output its natural variety and keeps it from repeating the same phrasing every time.

## What temperature does

**Temperature** controls how much weight the sampling gives to less-likely options. At a **low temperature** near zero, the distribution is sharpened so the model almost always picks its top choice — output becomes focused, predictable, and nearly repeatable. At a **high temperature**, the odds are flattened so unlikely words get a real chance, producing more surprising, varied, and sometimes wilder text. Think of it as a caution dial: low means play it safe and consistent, high means take risks and explore. Neither is "better" in the abstract; the right setting depends on what you're doing.

## Matching the setting to the task

For work that demands consistency — extracting fields into JSON, classifying a ticket, doing a calculation, or following a strict format — keep temperature low so the model behaves the same way every time and you can rely on the shape of its output. For work that benefits from range — brainstorming names, drafting varied marketing lines, exploring several angles on a story — raise the temperature to get options worth choosing among. A useful habit is to ask what would go wrong if the output changed run to run: if the answer is "a lot," turn the dial down.

## Sampling controls beyond temperature

Temperature is the main lever, but not the only one. Some APIs expose additional controls that limit *which* candidates are eligible before sampling — for instance, restricting the draw to the smallest set of words whose combined probability crosses a threshold, so genuinely absurd options are cut out even when temperature is high. Others let you nudge the model away from repeating words it has already used. You rarely need to touch all of these; start with temperature, and reach for the finer controls only when you have a specific problem, like output that is either too repetitive or occasionally veering into nonsense.

## In the real world

A data-extraction service that reads invoices runs at a temperature near zero, because the business needs the same invoice to yield the same fields every single time — surprise is the enemy. A copywriting tool that pitches ten headline variations runs hot, deliberately courting variety so the human has a real spread to choose from. A support bot often sits in between: consistent enough to stay on-policy, loose enough to sound natural. In each case the setting is a design decision, chosen to match how much the task can tolerate the same prompt producing different results.`,
  },
  {
    slug: "evaluation-and-testing",
    title: "Consistency, evaluation, and testing",
    weekNumber: 3,
    blurb:
      "A prompt that works once may fail on the tenth try — evaluation turns \"it seemed fine\" into evidence by testing prompts against many cases with clear criteria.",
    lectureTitle: "3.7 Consistency, evaluation, and testing prompts",
    body: `# Consistency, evaluation, and testing prompts

It is easy to try a prompt once, see a good answer, and declare victory. But a prompt that works on your one favorite example may quietly fail on the tenth, the hundredth, or the awkward edge case you didn't think to try. Because model output varies and inputs vary, judging a prompt from a single run is guesswork. **Evaluation** is the practice of testing a prompt against many cases, measured against clear criteria, so that "it seemed fine" becomes actual evidence. This is how a clever prompt becomes a dependable one.

## Why one good answer proves little

A single success is a sample of size one. The next input might be longer, phrased oddly, or contain something your prompt never anticipated, and the model's built-in variability means even the same input can wobble. Anecdotes hide these problems. If you have only ever run your summarizer on tidy articles, you have no idea how it handles a rambling transcript or an empty document. To know whether a prompt is actually good, you have to see it face a spread of realistic inputs, including the messy ones.

## Building a test set

The foundation of evaluation is a **test set**: a collection of representative inputs paired, where possible, with the answer you'd consider correct or acceptable. Gather real examples — easy ones, hard ones, and deliberately nasty edge cases like blank input or wrong-language text. This set becomes your yardstick. When you tweak the prompt, you rerun the whole set and see whether you actually improved things or just fixed one case while breaking two others. Without a fixed set to measure against, "improvement" is just a feeling.

## Deciding what "good" means

You cannot measure quality until you define it. For some tasks correctness is exact — the extracted total either matches the receipt or it doesn't — and you can check it automatically. For open-ended tasks like summaries you need a **rubric**: does it capture the main points, stay within length, avoid inventing facts? Sometimes a person scores the output against that rubric; sometimes another model does a first pass. The key is to write the criteria down before you look at results, so you are grading against a standard rather than rationalizing whatever the model happened to produce.

## Testing for consistency, not just correctness

Beyond "is this answer right," ask "does this prompt behave the same way across runs and across similar inputs." Run the same input several times and see whether the format holds and the substance stays stable; for tasks that demand it, low temperature helps, but the test tells you whether it's actually working. Also probe for robustness: feed the prompt slightly reworded questions and confirm it doesn't fall apart. A prompt that is correct but erratic is still unreliable in production, so consistency deserves its own place in your testing.

## In the real world

A team shipping a résumé-parsing feature keeps a suite of a few hundred real résumés with the correct fields marked, and every prompt change is rerun against all of them before release, so a fix for one layout can't silently break another. A support-bot team scores a weekly sample of real conversations against a rubric for accuracy and tone, tracking the numbers over time to catch drift. In both cases evaluation turns prompt engineering from a matter of taste into a measurable, repeatable engineering practice — which is exactly what a real product demands.`,
  },
];

export const WEEK3_ASSIGNMENTS: SeedAssignment[] = [
  {
    kind: "homework",
    title: "Homework 3 — Advanced patterns and reliability",
    weekNumber: 3,
    isTimed: false,
    timeLimitMinutes: null,
    instructions:
      "Untimed practice covering sections 3.1–3.7. Answer each question in a few sentences (about 3–5) in your own words. You don't need to write actual code — just explain the reasoning clearly. One-word answers won't receive credit.",
    problems: [
      {
        topicSlug: "structured-output",
        prompt:
          "A colleague built a feature that asks a model, in plain English, \"How much does this product cost?\" and then uses pattern matching to pull the dollar amount out of the reply so the app can store it. It works on their test product but breaks in production about once a day. Explain what is going wrong and how switching to structured output would fix it. Be concrete about what you'd change in the prompt.",
        correctAnswer:
          "The problem is that the model returns free-flowing prose, and its phrasing changes from call to call — sometimes \"$40\", sometimes \"forty dollars,\" sometimes \"it's free.\" Pattern matching against prose is brittle, so any unexpected wording breaks the extraction, which explains the intermittent failures. Switching to structured output means instructing the model to return only a JSON object with a known field, such as a numeric price field, and showing one filled-in example so it copies the shape. The app then reads that field by name instead of guessing, and the code parses defensively with a fallback for the occasional malformed response.",
        explanation:
          "Full credit: identifies that variable prose phrasing is what breaks pattern matching (the source of intermittent failure), and proposes structured output — a named/typed JSON field the program reads directly, ideally with an example and defensive parsing. Partial credit for naming the cause without a concrete prompt fix, or vice versa.",
        hint: "Think about what changes from one model reply to the next, and what a program actually needs to find a value reliably.",
      },
      {
        topicSlug: "prompt-chaining",
        prompt:
          "You want to turn a stack of 200 customer reviews into a polished one-page market summary. Your single prompt — \"read these reviews and write a market summary\" — keeps producing shallow output that skims the reviews. Describe how you would restructure this as a prompt chain, naming the steps and what each hands to the next, and explain why chaining should help.",
        correctAnswer:
          "I'd split the work into distinct steps because the task really contains several different jobs the model is trying to do at once. Step one extracts the recurring themes and sentiment from the reviews into a clean list; step two takes that list and analyzes which themes matter most or are most negative; step three takes the analysis and writes the polished summary. Each step's output becomes the next step's input, with clean handoffs (e.g., a structured list) between them. Chaining helps because each call gets the model's full attention on one job, and I can inspect the intermediate results to catch problems before they flow downstream.",
        explanation:
          "Full credit: proposes a chain with distinct, sensibly ordered steps, describes the output-to-input handoff, and explains the benefit (focused attention per step plus inspectable intermediates) tied to why the single prompt was shallow. Partial credit if steps are named but handoffs or rationale are missing.",
      },
      {
        topicSlug: "grounding-with-retrieval",
        prompt:
          "A support chatbot for a software company keeps confidently citing an old refund policy that changed last month, even though the model itself is otherwise accurate. A teammate suggests \"just retyping the new policy into the system prompt.\" Explain why grounding with retrieval is a better long-term fix, and what instruction you'd add so the model actually stays grounded.",
        correctAnswer:
          "The model is answering from its frozen training knowledge, which predates the policy change, so it recalls the outdated version. Retrieval is a better fix than hardcoding one policy because the help content changes over time and there are many policies; retrieval searches the current documents at question time and pastes the relevant passage into the prompt, so answers always reflect what's live. Hardcoding one policy doesn't scale and goes stale again the next time something changes. Crucially, I'd instruct the model to answer using only the retrieved passages, to say it doesn't know if the answer isn't there, and to cite which passage supports its claim so the grounding is checkable.",
        explanation:
          "Full credit: explains that stale training knowledge is the cause, that retrieval supplies current documents at query time and scales/stays fresh where hardcoding doesn't, and adds a grounding instruction (answer only from passages, admit ignorance, cite). Partial credit for the retrieval concept without the grounding instruction.",
        hint: "Consider why the model knew the old policy in the first place, and what has to be true every time the policy changes again.",
      },
      {
        topicSlug: "temperature-and-sampling",
        prompt:
          "Your team runs two features on the same model: one extracts invoice fields into JSON for the accounting system, and one generates ten alternative marketing taglines for a human to choose from. A junior engineer set both to the same high temperature. Explain what will likely go wrong with each feature, and what temperature setting you'd recommend for each and why.",
        correctAnswer:
          "High temperature flattens the odds so the model takes more risks, which is wrong for the invoice extractor: it needs the same invoice to produce the same fields in the same shape every time, and randomness will cause inconsistent output the accounting system can't rely on. So I'd set the extractor to a low temperature near zero for focused, repeatable results. The tagline generator is the opposite case — variety is the point, and a low temperature would give ten near-identical lines. I'd keep the tagline feature at a high temperature so the human gets a genuinely varied spread to choose from.",
        explanation:
          "Full credit: recommends low temperature for the deterministic extraction task and high temperature for the creative variety task, and justifies each by the effect of temperature on consistency vs. variety (high temp harms the extractor's reliability; low temp would make taglines samey). Partial credit if only one feature is reasoned correctly.",
      },
      {
        topicSlug: "evaluation-and-testing",
        prompt:
          "A developer says their new résumé-parsing prompt is \"working great\" because it correctly parsed the three résumés they tried. They want to ship it. What's the flaw in this reasoning, and what concrete evaluation process would you set up before release? Explain what the process would catch that three examples cannot.",
        correctAnswer:
          "Three successes is a sample far too small to trust — résumés vary enormously in layout, length, and formatting, and model output varies run to run, so a handful of tidy examples tells you almost nothing about production behavior. I'd build a test set of many representative résumés, deliberately including hard and edge cases like unusual layouts, missing sections, or blank input, each paired with the correct fields. Before any release, I'd rerun the whole set and measure how many parse correctly against those known answers, and I'd rerun the same inputs a few times to check consistency. This catches the failures that three easy examples hide — the odd layout that breaks parsing, or a change that fixes one case while quietly breaking others.",
        explanation:
          "Full credit: identifies that three examples is an inadequate sample (variability of inputs and output), proposes a representative test set with edge cases and known-correct answers, rerun on every change with consistency checks, and explains what that catches that anecdotes don't. Partial credit for spotting the flaw without a concrete process.",
        hint: "Think about how many different shapes a real résumé can take, and how you'd know a prompt tweak actually helped rather than just fixing one case.",
      },
    ],
  },
];
