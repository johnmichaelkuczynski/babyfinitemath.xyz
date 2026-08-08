import type { SeedTopic, SeedAssignment } from "./types";

export const WEEK1_TOPICS: SeedTopic[] = [
  {
    slug: "what-prompt-engineering-is",
    title: "What prompt engineering is",
    weekNumber: 1,
    blurb: "Prompt engineering is the practical craft of writing instructions that steer a language model toward the output you actually want.",
    lectureTitle: "1.1 What prompt engineering is (and why it works)",
    body: `# What prompt engineering is

Most people meet a language model as a chat box: you type something, it answers, and the quality of the answer feels like luck. **Prompt engineering** is the discipline that turns that luck into a skill. It is the practice of deliberately writing the text you send to a model — the *prompt* — so that the response is more accurate, more useful, and more repeatable. There is no magic incantation and no secret vocabulary. There is only clear thinking, made visible in words, applied to a system that responds to exactly what you give it.

## Why the wording matters so much

A language model does not read your mind and it does not know your intentions. It only sees the characters you typed, and it produces the continuation that those characters make most likely. That means every ambiguity in your request becomes a coin flip in the answer. If you ask for "a short summary," the model has to guess whether short means one sentence or one page. If you ask it to "improve this email," it has to guess whether you value brevity, warmth, or formality. Prompt engineering is the work of removing those guesses. When you say what you want plainly and completely, the model's most likely continuation is the one you were hoping for.

## It is editing, not programming

People sometimes imagine prompt engineering as a kind of coding, full of tricks and special tokens. It is closer to being a good editor or a clear manager. A strong prompt reads like an instruction you could hand to a competent but literal-minded assistant who has never met you: it states the goal, gives the needed background, shows the input, and describes the desired output. When your first attempt disappoints, you do not rewrite it in code — you reread it as that assistant would and ask, "What did I leave unsaid?" Then you say it. This is why writing skill transfers directly: the clearer your thinking, the better your prompts.

## Why the same technique keeps working

Prompt engineering is durable across models and versions because it rests on a stable fact: these systems predict text conditioned on the text you provide. **Conditioning** simply means that everything in the prompt shifts what the model considers likely next. Give it an example, and answers that resemble the example become more likely. Name a role, and language fitting that role becomes more likely. Set a constraint, and outputs that violate it become less likely. You are not flipping hidden switches; you are stacking the odds. Because that mechanism does not change when a new model arrives, the habits you build now keep paying off.

## What good looks like

A well-engineered prompt is judged by its results, not its length. Sometimes one precise sentence beats a page of instructions. The mark of skill is that the output is **reliable**: run the prompt on ten similar inputs and you get ten answers you can trust in the same way. You get there by being specific about the task, honest about the context, and explicit about the format — the themes of this entire first week.

## In the real world

A support team was pasting customer complaints into a model and getting replies that were sometimes apologetic, sometimes defensive, and occasionally invented refund policies that did not exist. Nothing about the model changed when they fixed it; they changed the prompt. They stated the tone they wanted, pasted the actual refund policy as context, and told the model to say "I'll escalate this" whenever the policy did not cover a case. The replies became consistent overnight. That is the entire promise of prompt engineering: predictable, useful output from clearer requests.`,
  },
  {
    slug: "how-models-read-text",
    title: "How models read and continue text",
    weekNumber: 1,
    blurb: "A language model does one thing — predict the next chunk of text — and understanding that single mechanism explains almost everything about how prompts behave.",
    lectureTitle: "1.2 How language models read and continue text",
    body: `# How language models read and continue text

To write good prompts you do not need to understand the mathematics inside a model, but you do need an honest mental picture of what it is doing. Underneath the conversational surface, a language model performs one operation over and over: given a stretch of text, it predicts what text is likely to come next. Everything that feels intelligent — answering questions, writing code, translating — is that single **next-token prediction** applied at scale. Once you internalize this, prompt behavior stops being mysterious and starts being predictable.

## Text becomes tokens

The model does not see words the way you do. It first breaks text into **tokens**, which are common chunks of characters — sometimes a whole word, often a piece of one. "Unhappiness" might split into "un", "happi", and "ness." This matters in practice because the model reasons in these pieces, which is why it can miscount letters in a word or fumble with unusual spellings: it never saw the individual letters, only the chunks. When someone says a model has a limited **context window**, they mean it can only hold so many tokens of your prompt and its own reply at once. Long documents get squeezed against that limit.

## Prediction, not retrieval

When you ask a question, the model is not looking up a stored answer in a database. It is generating the most probable continuation of your text, token by token, based on patterns absorbed during training. This is the crucial difference between a model and a search engine. A search engine finds a document that exists; a model produces text that *sounds like* it should follow your prompt. That is why models can be fluent and wrong at the same time — a confident, well-formed sentence can be the most likely continuation even when it is not true.

## Everything is conditioning

Because the model predicts based on the full text in front of it, every word you add reshapes the probabilities. This is **conditioning**, and it is your main lever. Start your prompt with "As a cautious tax accountant," and careful, qualified language becomes more likely. Include a worked example, and the model leans toward matching its structure. Even the model's own earlier sentences condition what comes next, which is why a reply that starts down a wrong path often keeps going — each mistaken token makes the following mistaken token more probable.

## One token at a time

The model writes left to right, choosing each token before it sees the one after. It cannot revise a sentence it has already produced the way a human editor would. This explains a common trick: asking a model to "think step by step" before giving a final answer genuinely helps, because the reasoning it writes first becomes context that conditions the answer that follows. You are giving it room to build the right continuation instead of forcing a conclusion out of thin air.

## In the real world

An analyst could not understand why a model kept inventing plausible but fake citations for a literature review. The answer was in the mechanism: asked to "list five papers on this topic," the model produced text that *looked* like a citation list, because that is the most likely continuation — author names, years, and journal-style titles — whether or not those papers exist. The fix was to stop treating prediction as retrieval: the analyst supplied the actual abstracts as context and asked the model to quote only from them. Knowing that the model continues text rather than looks it up turned a frustrating failure into an obvious, avoidable one.`,
  },
  {
    slug: "anatomy-of-a-prompt",
    title: "Anatomy of a prompt",
    weekNumber: 1,
    blurb: "Most effective prompts share the same four parts — instruction, context, input, and output specification — and naming them makes writing prompts far less improvisational.",
    lectureTitle: "1.3 Anatomy of a prompt: instruction, context, input, output",
    body: `# Anatomy of a prompt

When a prompt fails, it usually fails because a piece is missing, not because the wording was inelegant. The most reliable way to catch a missing piece is to know the parts a good prompt tends to contain. Almost every effective prompt can be read as four components working together: the **instruction**, the **context**, the **input**, and the **output specification**. You will not always need all four, but naming them turns prompt writing from guesswork into a checklist you can run in your head.

## The instruction

The instruction is the verb of the prompt — the thing you are asking the model to do. "Summarize," "classify," "rewrite," "extract," "explain." A weak instruction hides the real task inside vague language, as in "look at this and tell me about it." A strong instruction names the action and its purpose: "Summarize this contract clause in plain language for a non-lawyer." Notice that the strong version already smuggles in the audience and the goal, which quietly narrows the model's choices. If you can only fix one part of a struggling prompt, sharpen the instruction first.

## The context

Context is the background the model needs but does not already have. It answers the question, "What would a competent stranger need to know to do this well?" That might be a policy the model must follow, the definition of a term specific to your company, the reason behind the request, or the audience who will read the result. Context is where you compensate for the fact that the model knows a great deal about the world in general and nothing about *your* situation in particular. Skipping it is the most common cause of technically correct answers that are useless to you.

## The input

The input is the specific material the model should act on: the email to rewrite, the paragraph to translate, the data to analyze. Keeping the input clearly separated from your instructions prevents a whole class of confusion where the model treats part of your input as a command. A simple habit is to label it — "Here is the review to classify:" — and set it off on its own so the boundary is obvious. When the input is long or contains its own instructions, this separation becomes essential, a theme we return to when we discuss delimiters.

## The output specification

Finally, describe what you want back. What form should it take — a paragraph, a list, a table, a single word? How long? What must it include or avoid? "Give three bullet points, each under fifteen words, no jargon" leaves almost nothing to chance. When you omit the output specification, the model picks a format for you, and it will often pick a chatty paragraph when you wanted a clean list. Stating the shape of the answer is one of the cheapest ways to make results consistent.

## In the real world

A recruiter was frustrated that a model kept writing flowery job descriptions when she wanted crisp, scannable ones. Her original prompt was a single line: "Write a job description for a data analyst." Rebuilt with the four parts, it became an instruction ("Write a job posting"), context ("for a mid-size hospital, emphasizing patient-data privacy"), input (the list of duties she pasted), and an output specification ("under 200 words, with a bulleted responsibilities section"). The result matched what she needed on the first try. She had not learned a new trick — she had simply stopped leaving three of the four parts unsaid.`,
  },
  {
    slug: "being-specific",
    title: "Being specific",
    weekNumber: 1,
    blurb: "Vagueness forces the model to guess, and specificity — in detail, scope, and constraints — is the single most reliable way to improve an answer.",
    lectureTitle: "1.4 Being specific: clarity, detail, and constraints",
    body: `# Being specific

If there is one habit that separates people who get good results from people who get frustrated, it is specificity. A model fills every gap you leave with its best guess about what an average person might mean. Sometimes that guess is fine; often it is not what you meant at all. **Being specific** is the act of closing those gaps before the model has to guess. It sounds obvious, yet most disappointing outputs trace back to a request that was simply too open to interpretation.

## Detail replaces guessing

Consider "write a product description." The model must guess the product's audience, tone, length, and selling points. Now consider "write a 60-word product description for a stainless-steel water bottle, aimed at gym-goers, emphasizing durability and a leak-proof lid, in an energetic tone." Every added detail removes a decision the model would otherwise make blindly. Detail is not padding; each phrase is a constraint that steers the output. The skill is knowing which details actually matter for your goal and stating those, rather than drowning the request in irrelevant description.

## Constraints do the steering

A **constraint** is a rule the output must obey: a word count, a required section, a forbidden word, a reading level. Constraints are powerful because they are easy for a model to check itself against and easy for you to verify. "Explain this to someone with no finance background, and never use the word *derivative*" gives the model a clear line it must not cross. Positive constraints ("include a concrete example") and negative constraints ("do not include a conclusion") both work. Well-chosen constraints often do more to shape an answer than paragraphs of description.

## Say what you want, not just what you dislike

A subtle trap is describing the problem instead of the goal. "This is too formal" tells the model what is wrong but leaves the fix ambiguous — less formal how, and how far? "Rewrite this in a warm, conversational tone, as if explaining to a colleague over coffee, using contractions" points at a target. Whenever you catch yourself giving negative feedback, translate it into a positive description of the destination. The model steers toward what you name, not away from what you complain about.

## Specific does not mean long

Specificity is about precision, not volume. A short, exact prompt beats a rambling one, because extra words can introduce their own ambiguity and bury the real request. The goal is that every sentence earns its place by narrowing the output. If you can delete a phrase and the model would still know exactly what to do, delete it. If deleting it would reopen a guess, keep it. That test keeps prompts both specific and lean.

## In the real world

A marketing manager kept getting blog intros that were generic and could have described any company. Her prompt asked for "an engaging introduction about our software." When it failed, her instinct was to add adjectives — "more engaging, more unique." Nothing improved, because *engaging* and *unique* are not things a model can act on. The turnaround came when she got specific about substance: "Open with the exact frustration a warehouse manager feels at 5 p.m. when inventory counts don't match, then name our product as the fix, in two sentences." The intro was suddenly concrete and distinctive. Specificity about *content* solved what adjectives about *style* never could.`,
  },
  {
    slug: "role-and-tone",
    title: "Setting role and tone",
    weekNumber: 1,
    blurb: "Assigning the model a role and specifying tone quietly reshapes its vocabulary, assumptions, and judgment — and the system message is where those framing choices live.",
    lectureTitle: "1.5 Setting role and tone (system vs. user framing)",
    body: `# Setting role and tone

You can change the character of an answer dramatically without changing the question at all, simply by telling the model who it should be and how it should sound. This is because a model's output is conditioned on everything in the prompt, and a role or a tone is a rich bundle of expectations packed into a few words. **Role framing** and **tone setting** are among the most efficient tools you have: a short phrase can shift vocabulary, depth, assumptions, and even what the model chooses to warn you about.

## Why a role changes the answer

When you write "You are an experienced pediatric nurse," you are not giving the model new knowledge — it already contains language from countless nursing contexts. You are making that language more likely to surface. A role activates a whole style of response: the level of caution, the technical vocabulary, the things such a person would think to mention. Ask "how much ibuprofen for a fever" with no role and you get a generic answer; ask it in the pediatric-nurse role and you are more likely to get weight-based dosing and a note about when to call a doctor. The role primes relevant judgment, not just relevant words.

## Tone is a separate dial

Role and tone are related but distinct. Role is *who is speaking*; tone is *how they sound*. You can pair a legal-expert role with a warm, reassuring tone, or a friendly-coach role with a blunt, no-nonsense tone. Naming the tone explicitly — "encouraging," "neutral and factual," "wry but respectful" — prevents the model from defaulting to the polished, slightly corporate voice it tends to reach for. When tone matters to your reader, it deserves its own line in the prompt rather than being left to chance.

## System framing versus user framing

Many interfaces separate two kinds of instructions. The **system message** sets durable, background rules — the model's persistent role, tone, and boundaries — that should hold across an entire conversation. The **user message** carries the specific request of the moment. Putting "You are a concise technical writer who never uses marketing language" in the system message means it governs every reply without being repeated. Putting a one-off request there would be a mistake. The rule of thumb: stable identity and rules go in the system framing; the immediate task goes in the user framing.

## Roles constrain as well as enable

A role is also a way to set limits. "You are a careful research assistant who says 'I'm not certain' rather than guessing" builds humility into every answer. "You only answer using the provided documents" is a role that fences the model off from its general knowledge. Used this way, role framing is not costume-play; it is a compact way to encode the behavior you want, including the behavior of *declining* to do something.

## In the real world

A fintech company's help assistant kept giving customers overconfident financial opinions, which was a compliance problem. The engineers did not retrain anything. They rewrote the system message: "You are a support agent for a budgeting app. You explain how the app's features work. You never give personalized investment advice; if asked, you say that and suggest speaking with a licensed advisor." The role and its boundaries, set once in system framing, reshaped every subsequent answer. The same model that had been dispensing stock tips now stayed firmly in its lane — because they told it, precisely, who it was.`,
  },
  {
    slug: "format-and-length",
    title: "Controlling format and length",
    weekNumber: 1,
    blurb: "Telling the model exactly what shape and size the answer should take turns unpredictable prose into output you can use, paste, or process without cleanup.",
    lectureTitle: "1.6 Controlling format and length",
    body: `# Controlling format and length

An answer can be entirely correct and still be a nuisance to use because it arrived in the wrong shape — a wall of prose when you wanted a table, three paragraphs when you needed one line. Controlling **format** and **length** is how you make output fit the place it is going, whether that is a slide, a spreadsheet, or another program. This is often the difference between an answer you can drop straight into your work and one you have to spend five minutes cleaning up.

## Name the format explicitly

Left to itself, a model tends to answer in flowing paragraphs, because that is the most common shape of text it has seen. If you want something else, say so directly: "Answer as a numbered list," "Return a two-column table with the term and its definition," "Give only the corrected sentence, nothing else." The more precisely you describe the structure, the less the model improvises. When the output feeds another system, an explicit format is not a preference but a requirement — a downstream program expecting a list will break on a paragraph.

## Length is a design choice

Length shapes how an answer is received. A one-line reply respects a busy reader; a detailed walkthrough serves a learner. Vague length words like "short" or "detailed" are interpreted inconsistently, so prefer concrete targets: "in under 50 words," "in exactly three sentences," "one paragraph of about 100 words." Be aware that very tight limits force the model to drop information, which is sometimes exactly what you want and sometimes not. Choose the length for the reader, then state it plainly so the model does not choose for you.

## Suppress the extras

Models like to be helpful, which often means wrapping the real answer in preamble ("Sure! Here's a summary:") and a polite closing offer to help further. When you are going to reuse the output, those extras are noise. A short instruction removes them: "Return only the JSON object, with no explanation or surrounding text." This matters most for automated pipelines, where a stray friendly sentence can corrupt the data your program is trying to read. Telling the model what *not* to include is as useful as telling it what to include.

## Structure improves substance

Asking for a particular format does more than tidy the output; it can improve the thinking behind it. Requesting a table with columns for "option," "benefit," and "risk" forces the model to actually produce a benefit and a risk for each option, rather than gliding past the ones it finds hard. A required structure becomes a checklist the model must fill, which is why format instructions often surface gaps that a free-form paragraph would have quietly hidden.

## In the real world

An operations lead used a model to triage incoming bug reports, but the replies were chatty paragraphs that a teammate then had to retype into a tracking sheet. The content was good; the shape was wrong. The fix was purely about format and length: "For each report, output one row with three fields separated by a pipe — severity (low, medium, or high), affected area, and a one-line summary under twelve words. No other text." The output became something they could paste directly into their spreadsheet and, eventually, feed to a script. The model's judgment had been fine all along; specifying the shape is what made it usable.`,
  },
  {
    slug: "failure-modes",
    title: "Common failure modes",
    weekNumber: 1,
    blurb: "Knowing the handful of characteristic ways prompts go wrong — from confident fabrication to ignored instructions — lets you diagnose a bad answer instead of just rerolling it.",
    lectureTitle: "1.7 Common failure modes and how to spot them",
    body: `# Common failure modes and how to spot them

When an answer disappoints, the temptation is to run the prompt again and hope. You will make faster progress if you can recognize *how* it failed, because each characteristic **failure mode** points to a different fix. A handful of these patterns account for most bad outputs. Learning to name them turns a vague sense of "that's not right" into a specific diagnosis you can act on.

## Confident fabrication

The most dangerous failure is **hallucination**: the model states something false with complete confidence — an invented statistic, a fake citation, a function that does not exist. Recall from earlier that the model predicts likely text rather than retrieving facts, so a fluent falsehood can be the most probable continuation. Spot it by watching for specific, checkable claims that appear without a source, especially names, numbers, and dates. The usual fix is to supply the real facts as context and instruct the model to rely only on them, or to have it flag uncertainty rather than fill gaps.

## Ignoring part of the instruction

A model will sometimes obey most of your prompt and quietly drop a piece — you asked for three examples and got two, or asked it to avoid jargon and it slipped some in. This often happens when a prompt is long and the constraint was buried in the middle. Spot it by checking the output against your requirements one by one, as a literal checklist. The fix is usually to move the neglected constraint somewhere prominent, state it more forcefully, or split an overloaded prompt into smaller requests.

## Drifting off task

Sometimes the model answers a nearby question instead of the one you asked, or wanders into general commentary. This drift usually traces back to an ambiguous instruction that let the model choose an easier interpretation. If the answer is coherent but not what you wanted, suspect that your request had room to be read another way. Rereading your prompt literally — as a stranger would — tends to reveal the phrase that opened the door, and tightening it closes the door.

## Wrong shape or wrong level

Other failures are about fit rather than truth: the answer is far too long, uses the wrong format, or is pitched at the wrong audience — too technical for a beginner or too shallow for an expert. These are the easiest to fix because they trace directly to a missing format, length, or audience specification. When an answer is correct but unusable, the diagnosis is almost always that you did not tell the model the shape and reader you had in mind.

## In the real world

A paralegal used a model to draft client-facing summaries of court filings and nearly sent one that cited a precedent that did not exist. Instead of simply regenerating, she diagnosed the failure: it was hallucination, driven by asking the model to summarize a document it had never actually been given. The fix followed from the diagnosis — she began pasting the full filing into the prompt and adding, "Summarize only what appears in the text above; if a detail isn't stated, say so." The fabrications stopped. The lesson generalizes: naming the failure mode told her exactly which lever to pull, which is far faster than pulling levers at random.`,
  },
];

export const WEEK1_ASSIGNMENTS: SeedAssignment[] = [
  {
    kind: "homework",
    title: "Homework 1 — Foundations of prompting",
    weekNumber: 1,
    isTimed: false,
    timeLimitMinutes: null,
    instructions:
      "Untimed practice covering sections 1.1–1.7. Answer each question in a few sentences (about 3–5) in your own words. You don't need to write actual code — just explain the reasoning clearly. One-word answers won't receive credit.",
    problems: [
      {
        topicSlug: "how-models-read-text",
        prompt:
          "A colleague asks a model to \"list the five most-cited studies on remote-work productivity,\" and it returns five confident-looking citations with authors, journals, and years. When she checks, two of the papers don't seem to exist. She's baffled because the model \"sounded so sure.\" Using what you know about how models generate text, explain why this happened and why the model's confidence is not evidence of accuracy.",
        correctAnswer:
          "The model isn't looking up real papers in a database; it's predicting the most likely continuation of the text \"list the five most-cited studies…\", which is a list that *looks like* citations — plausible author names, journal titles, and years. Because it generates by next-token prediction rather than retrieval, a fluent, well-formed citation can be the most probable output whether or not the paper is real. Its \"confidence\" is just the smoothness of the generated text, not a check against any source. To avoid this, she should supply the actual papers or abstracts as context and tell the model to draw only from them.",
        explanation:
          "Full credit: identifies that the model predicts likely text rather than retrieving facts (next-token prediction, not a database lookup), explains that a plausible-sounding citation can be the most probable continuation even if false, and notes that fluency/confidence is not a truth check. Bonus if they suggest grounding it in supplied sources.",
        hint: "Think about the difference between a search engine that finds an existing document and a model that produces a likely continuation.",
      },
      {
        topicSlug: "anatomy-of-a-prompt",
        prompt:
          "A manager sends this entire prompt: \"Make this better.\" pasted above a customer email. The model returns a rewrite that is longer, more formal, and misses that the customer was actually asking for a refund. Using the four parts of a prompt (instruction, context, input, output specification), identify which parts were missing and how supplying them would have changed the result.",
        correctAnswer:
          "The instruction was vague — \"make this better\" doesn't name the actual task (rewrite? shorten? clarify the refund request?) — so the model guessed at \"more formal and longer.\" There was no context: the model didn't know the goal (getting a refund handled) or the audience, so it optimized for polish instead of purpose. The input was present (the pasted email) but not clearly separated or explained. And there was no output specification for tone or length, so the model chose a longer, formal style on its own. Naming the task, stating that the aim is a clear refund request to support, and specifying a short, plain tone would have produced a rewrite that actually served the goal.",
        explanation:
          "Full credit: correctly maps the failure to at least three of the four parts (weak instruction, missing context, missing output specification, and notes the input was there), and explains concretely how supplying each would steer the result toward the customer's real goal. Simply listing the four parts without applying them to this scenario is not enough.",
      },
      {
        topicSlug: "being-specific",
        prompt:
          "A writer keeps telling a model \"this intro is too boring, make it more engaging,\" and the results never improve — they just get more adjectives. Explain why this kind of feedback tends to fail, and describe how you would rewrite the request to actually steer the model. Include at least one concrete, specific instruction you would add.",
        correctAnswer:
          "\"More engaging\" describes a feeling, not an action the model can take, so it can only reach for surface changes like extra adjectives — it has no target to aim at. The writer is describing what's wrong instead of naming the destination. A better request replaces the complaint with a specific, positive description of content and structure: for example, \"Open with the exact moment a warehouse manager realizes the inventory count is wrong at 5 p.m., in two concrete sentences, then name the product as the fix.\" Adding constraints like a sentence count, a specific scenario to open on, or a forbidden generic phrase gives the model something checkable to steer toward.",
        explanation:
          "Full credit: explains that vague, feeling-based negative feedback gives the model nothing actionable, states the principle of describing the desired destination rather than the problem, and supplies at least one concrete constraint or specific content instruction. A generic \"be more specific\" without a concrete example does not earn full credit.",
        hint: "Consider the difference between describing what you dislike and describing the exact target you want.",
      },
      {
        topicSlug: "role-and-tone",
        prompt:
          "A budgeting app's support assistant keeps offering customers personalized investment opinions, which creates a compliance problem. The team doesn't want to retrain the model. Explain how setting a role in the system message could fix this, and why placing it in the system framing (rather than repeating it in each user message) is the right choice.",
        correctAnswer:
          "A role packs a bundle of expectations into a few words and makes matching behavior more likely, so defining the assistant as \"a support agent who explains the app's features and never gives personalized investment advice; if asked, it declines and suggests a licensed advisor\" reshapes every answer without any retraining. The role isn't just a costume — it encodes a boundary, including the behavior of declining. Putting it in the system message is right because that framing sets durable, background rules that persist across the whole conversation, so the limit applies to every reply automatically. Repeating it in each user message would be error-prone and easy to forget, and it mixes a stable identity with one-off requests.",
        explanation:
          "Full credit: explains that a role conditions the model toward the desired behavior (including declining) without retraining, and correctly distinguishes system framing as durable/persistent rules versus user framing as the per-message request, justifying why the boundary belongs in the system message. Must connect the role to the compliance boundary, not just describe roles in general.",
      },
      {
        topicSlug: "format-and-length",
        prompt:
          "An operations lead uses a model to triage bug reports, but each answer comes back as a chatty paragraph that a teammate then retypes into a spreadsheet with columns for severity, affected area, and a one-line summary. The content is accurate. Explain what to change about the prompt and why specifying format and length here improves both usability and the quality of the model's thinking.",
        correctAnswer:
          "The content is fine; the shape is the problem, so the fix is a format and length specification rather than anything about accuracy. The lead should tell the model to output one row per report with three fields — severity (low/medium/high), affected area, and a summary under about twelve words — separated by a delimiter, and to include no other text. This makes the output paste-ready and even script-readable instead of something a teammate retypes. Requiring those exact fields also improves the thinking: the model must produce a severity and an affected area for every report rather than gliding past the hard ones, so the required structure acts as a checklist that surfaces gaps a free paragraph would hide.",
        explanation:
          "Full credit: recognizes this is a format/length issue (not accuracy), gives a concrete structured-output instruction with the required fields and a length limit plus suppressing extra text, and explains that an imposed structure forces the model to fill every field, improving completeness. Mentioning downstream/automated reuse is a plus.",
        hint: "Think about why a required table or field list can force the model to address things it might otherwise skip.",
      },
    ],
  },
];
