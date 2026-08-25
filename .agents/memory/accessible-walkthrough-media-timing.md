---
name: Accessible walkthrough media timing
description: Keeps public narrated walkthrough visuals, captions, and playback controls on one timeline.
---

For a public narrated walkthrough, the audio element's play, pause, and seek state must be the source of truth for both the displayed scene and the active caption. Do not allow a separately mounted scene timer to continue while narration is paused or awaiting user activation.

**Why:** A visible play control is not an accessible alternative when the visual content continues without the narration. Delayed playback or seeking then makes the animated scene, caption, and audible explanation contradict one another.

**How to apply:** When a walkthrough exposes public audio controls, derive scene selection and caption cues from the media element's current time and update on time, seek, and metadata events. The animated/recording mode may retain its autonomous timeline only when there is no user-controlled narration.