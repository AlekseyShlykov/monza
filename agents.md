# agents.md

## Project Context
This project is a standalone interactive scroll-storytelling prototype about the Monza circuit.

The experience uses a sticky visual stage with a Monza SVG track, a small red point moving along the track with a trail, corner-based scene reveals, start lights, and a final post-race sequence.

The purpose is not just to make a website that works. The purpose is to create a pitch-quality prototype that makes Monza feel exciting, iconic, and cinematic.

## Core Principle
Every agent should optimize for this outcome:

> The user scrolls once and immediately understands that this is not a generic longread. It feels like a guided lap and a race story.

## Product Summary
Build a responsive static site for GitHub Pages with:
- a sticky Monza track stage
- Monza rendered as SVG contour
- a small red point moving uniformly along the track as the user scrolls
- a visible trail behind the point
- 5 red start lights that turn green on first scroll
- scene-by-scene placeholder image reveals for corners
- short English captions
- final sequence: finish -> weigh-in -> waiting room with 3 chairs and silhouettes -> podium
- subtle mobile vibration on selected beats

## Recommended Stack
Default stack unless there is a strong reason to change it:
- Vite
- React
- plain CSS
- SVG path animation with browser APIs
- no heavy libraries by default

Allowed additions only if they clearly improve the result without bloating the prototype.

## Global Constraints
Agents must respect the following:
- optimize for a polished prototype, not an overengineered app
- keep the site lightweight and GitHub Pages friendly
- prefer clear structure over clever abstractions
- use placeholders for images as separate files
- English only
- no branching interactions for v1
- mobile and desktop must both work well
- agents are allowed to improve UX, animation quality, layout, and implementation details

## What Good Looks Like
A good result should feel:
- cinematic
- smooth
- minimal but not empty
- premium enough to pitch
- easy to replace placeholder assets later

A bad result would feel:
- like a generic scroll page with disconnected sections
- jittery
- overloaded with libraries
- visually flat
- broken on mobile

## Agent Roles

### 1. Product / UX Agent
Purpose:
Turn the concept into a coherent user journey.

Responsibilities:
- preserve the narrative arc from start lights to podium
- define scene thresholds and pacing
- ensure the finish sequence feels earned
- simplify anything that hurts clarity
- improve transitions if they make the experience stronger

Rules:
- do not add new interaction patterns unless clearly beneficial
- preserve the scroll-first concept
- keep copy short and atmospheric

Output expectations:
- clean scene order
- sensible scroll pacing
- readable captions on all screen sizes

### 2. Frontend Architecture Agent
Purpose:
Set up the codebase cleanly and make future edits easy.

Responsibilities:
- create a maintainable Vite + React structure
- separate concerns: stage, scenes, motion, data, styles
- keep logic readable and easy for future Cursor sessions
- make deployment to GitHub Pages straightforward

Rules:
- do not prematurely optimize into complicated patterns
- avoid hidden magic and confusing abstractions
- prefer explicit scene config data over hardcoded scattered logic

Output expectations:
- intuitive folder structure
- reusable components
- a clear data file for scenes and thresholds

### 3. Motion / Interaction Agent
Purpose:
Make scrolling feel smooth and intentional.

Responsibilities:
- implement normalized scroll progress
- map progress to SVG path motion
- create the trailing effect for the red point
- handle start light state change on first scroll
- choreograph finish, weigh-in, waiting room, and podium transitions
- add subtle mobile vibration where appropriate

Rules:
- movement should feel uniform, not artificially accelerated
- avoid choppy or frame-dependent motion
- support reduced-motion users gracefully
- do not over-animate every element

Output expectations:
- stable sticky stage
- smooth point motion
- elegant scene timing
- subtle, satisfying beats

### 4. Visual Design Agent
Purpose:
Make the prototype feel realistic, focused, and premium.

Responsibilities:
- define layout, spacing, typography, and contrast
- ensure the track remains visually central
- make placeholders feel intentional rather than temporary trash
- keep the red point visually readable at all times
- design scenes so they work on both desktop and mobile

Rules:
- avoid decorative clutter
- avoid trendy effects that weaken the realism
- keep UI chrome minimal
- placeholders can be simple, but must still look composed

Output expectations:
- a visually coherent stage
- balanced compositions
- strong readability
- responsive layouts that still feel designed

### 5. Performance Agent
Purpose:
Protect load speed and rendering quality.

Responsibilities:
- reduce asset weight
- lazy-load non-critical images
- keep JavaScript small
- avoid layout thrashing
- test that scroll and SVG animation remain smooth on mid-range mobile devices

Rules:
- performance is part of the product quality, not an afterthought
- do not introduce large dependencies for small problems
- optimize images and SVG usage early

Output expectations:
- fast static load
- smooth scrolling
- acceptable demo performance on GitHub Pages

### 6. QA Agent
Purpose:
Catch fragile behavior and edge cases before they become demo-breaking issues.

Responsibilities:
- test desktop and mobile layouts
- verify that start lights switch once and correctly
- verify point reaches exact end of path
- verify scene thresholds do not overlap awkwardly
- verify final sequence order is correct
- verify vibration fails safely on unsupported browsers
- verify sticky stage behavior across viewport sizes

Rules:
- assume the prototype will be shown to others
- prioritize demo-breaking issues first
- propose fixes, not just bug descriptions

Output expectations:
- short bug list with severity
- concrete fixes
- confidence that the demo will hold up in presentation

## Build Priorities
Agents should prioritize work in this order:

1. Core structure
- app skeleton
- sticky stage
- responsive layout

2. Core interaction
- scroll progress system
- point movement on SVG path
- start lights state

3. Story scenes
- placeholders as separate files
- captions and reveal timing

4. Final sequence
- weigh-in
- waiting room
- podium

5. Polish
- trail refinement
- motion smoothing
- vibration
- small visual improvements

6. Performance and QA
- asset optimization
- mobile fixes
- deployment readiness

## Decision Rules
When uncertain, agents should follow these rules:

- Choose the simpler implementation if the user experience is the same.
- Choose the more cinematic implementation if complexity stays reasonable.
- Prefer browser-native APIs over adding a package.
- Prefer data-driven scene configuration over hardcoding timings in many places.
- Do not ask for more content if placeholders are sufficient to move forward.
- Make the prototype presentable even with temporary assets.

## Scene Model Recommendation
Store scenes in structured data, for example:
- id
- label
- title
- caption
- progressStart
- progressEnd
- imageSrc
- alignment
- vibrationTrigger

This allows future editing without rewriting animation logic.

## Placeholder Asset Rules
Until final assets arrive:
- create separate image files for each scene
- use clear labels such as `TURN 1`, `ASCARI`, `WEIGH-IN`, `PODIUM`
- keep consistent dimensions and visual system
- ensure filenames are predictable and reusable

## Scroll Model Guidance
Preferred model:
- one sticky viewport stage
- long scroll container underneath
- one normalized master progress value
- all scene logic derived from that progress

Avoid:
- many unrelated scroll listeners
- deeply nested intersection logic when a progress timeline would be cleaner
- scene logic spread across many components without a shared timing source

## Mobile Guidance
Agents must treat mobile as a first-class target.

Requirements:
- maintain readability of captions
- keep the track legible on small screens
- reduce excessive motion if cramped
- ensure placeholders and final scenes fit vertically
- vibration should be optional and subtle

## Accessibility Guidance
Agents should include:
- semantic markup where reasonable
- color contrast checks
- reduced motion fallback
- no reliance on vibration for understanding state

## Deployment Guidance
Target deployment: GitHub Pages.

Agents should:
- keep asset paths compatible with static hosting
- configure Vite base path if needed
- avoid server-only features
- ensure build output is static and portable

## Definition of Done
The task is complete when:
- the site builds and runs as a static app
- the sticky Monza stage works on desktop and mobile
- the point moves smoothly with a trail along the SVG track
- red start lights switch to green on first scroll
- corner placeholders appear with short captions
- finish sequence includes weigh-in, waiting room, and podium in the correct order
- mobile vibration works where supported and fails gracefully otherwise
- structure is clean enough for future content replacement
- the prototype is visually strong enough to show as an example to potential clients

## What Agents May Improve Without Asking
Agents may improve the following autonomously:
- motion smoothing
- scene timing
- typography and spacing
- placeholder styling
- responsive behavior
- visual hierarchy
- code organization
- minor copy polish in English
- deployment configuration

## What Agents Should Not Change Without Strong Reason
Agents should avoid changing these core decisions unless there is a compelling implementation issue:
- Monza as the subject
- sticky storytelling format
- small red point with trail
- instant light change on first scroll
- short captions instead of long paragraphs
- final order: finish -> weigh-in -> waiting room -> podium
- standalone static site direction

## Final Reminder
This project is a prototype, but it should not feel disposable.

Build it like a small, focused interactive case study that already demonstrates the value of the format.
