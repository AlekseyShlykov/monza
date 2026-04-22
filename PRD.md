# PRD.md

## Project
Monza Scroll Longread Prototype

## Purpose
Build a scroll-driven storytelling prototype about the Monza circuit and its history. The prototype is meant as a pitchable demo: the user should finish the experience feeling that Monza is an iconic, dramatic, and historically rich track.

This is not a content-heavy editorial longread yet. It is a visual and interaction prototype with placeholder assets, clear pacing, and a strong storytelling structure.

## Product Goal
Create a standalone website where:
- the top section contains a persistent Monza track visual
- a small red point moves along the track as the user scrolls
- the track remains visually anchored while the story unfolds
- images and short captions appear section by section
- the experience starts with red start lights and transitions into the race when scrolling begins
- the ending includes post-race weighing, the waiting room with three chairs and driver silhouettes, and finally the podium reveal

## Primary User Outcome
The user should feel:
- Monza is not just a circuit, but a sequence of memorable moments
- the track has personality, rhythm, and history
- the scroll itself feels like completing a lap and a race weekend arc

## Audience
Potential clients, collaborators, or partners who need an example of scroll-based interactive storytelling.

## Platform
Standalone website hosted on GitHub Pages.

## Language
English only for this prototype.

## Experience Summary
The page behaves like a guided race weekend / lap story.

High-level flow:
1. Intro view: track visible, 5 red start lights shown over the track
2. User begins scrolling
3. Start lights switch immediately to green
4. Red point begins moving smoothly along the SVG track path
5. At each major corner or segment, a visual card appears with a placeholder image and short caption
6. Near the end, the race finishes and transitions into post-race sequence:
   - weigh-in image
   - waiting room with 3 chairs and 3 driver silhouettes
   - podium animation
7. Experience ends on podium

## Recommended Technical Approach
Use **Vite + React + plain CSS**.

Why:
- static export works well for GitHub Pages
- enough structure for scroll choreography, reusable scene components, and future scaling
- lighter and simpler than Next.js for a standalone prototype
- easier to maintain than a single large HTML file once assets and scenes grow

Animation stack:
- browser native scroll with `position: sticky`
- `requestAnimationFrame` for smoothing and sync
- SVG path for track outline and point motion
- Web APIs only for vibration on mobile
- avoid heavy animation libraries unless needed later

## Core UX Decision
Use **sticky storytelling** instead of a fully free-form page.

Reason:
- better control of pacing
- stronger visual focus on the track
- more premium “interactive editorial” feel
- easier synchronization between scroll progress, point movement, and scene reveals

Implementation idea:
- one sticky stage occupies the viewport
- beneath it, invisible or lightweight scroll sections drive progress
- scroll progress maps to a normalized value from 0 to 1
- all animation states derive from that normalized progress

## Non-Goals
For this prototype, do not include:
- branching choices
- audio engine or background music
- CMS or admin
- analytics unless explicitly added later
- complex historical accuracy review
- real image sourcing pipeline beyond placeholders

## Functional Requirements

### 1) Sticky Track Stage
The top visual stage must remain pinned while the main storytelling sequence is active.

Requirements:
- display Monza as a clean SVG outline
- maintain a realistic visual style overall
- support desktop and mobile layouts
- keep the stage legible even on small screens

### 2) Track Graphic
Requirements:
- Monza track rendered as SVG path or SVG group
- only the circuit contour is required for the prototype
- SVG must support exact path-following for the red point
- SVG should scale responsively without breaking point positioning

### 3) Moving Red Point
Requirements:
- small red point moves along the track according to scroll progress
- movement is uniform relative to normalized progress
- point includes a visible trailing tail
- no acceleration curve in the base version
- point should stay crisp and readable on both mobile and desktop

Suggested implementation:
- compute point position from SVG path total length
- draw tail using recent sampled positions or short fading path segment
- smooth visual movement with rAF to avoid jitter on scroll

### 4) Start Lights
Requirements:
- 5 red start lights appear over the track in the initial state
- on the first actual user scroll interaction, they switch immediately to green
- this should happen only once per page load

Behavior:
- before scroll: red lights visible
- after first scroll delta: green lights visible
- no countdown sequence in this version

### 5) Corner-Based Story Scenes
Requirements:
- each major corner or segment gets a content moment
- each moment includes:
  - placeholder image block
  - corner name
  - short caption
- placeholder assets should be easy to replace later
- each placeholder should exist as a separate file

Placeholder strategy:
- create simple colored rectangular assets
- add visible label text such as `TURN 1`, `TURN 2`, etc.
- store them in a dedicated assets folder

### 6) Text Content Style
Requirements:
- short captions only
- English only
- tone: concise, atmospheric, informative
- each caption should reinforce that Monza is historically and emotionally distinctive

### 7) Final Sequence
The ending must go beyond a simple podium reveal.

Required order:
1. Finish / race completion cue
2. Weigh-in visual
3. Waiting room visual with 3 chairs and 3 driver silhouettes
4. Podium visual with scroll-driven reveal / animation

Requirements:
- each step should feel like a new scene
- track motion should reach completion before or as the finish sequence begins
- the podium should feel like the payoff

### 8) Mobile Vibration
Requirements:
- use the Vibration API where supported
- vibration should be subtle and sparse
- recommended triggers:
  - first scroll / race start
  - finish moment
  - podium reveal
- must fail gracefully on unsupported devices

### 9) Responsive Design
Requirements:
- work well on desktop and mobile
- desktop can prioritize cinematic composition
- mobile must remain readable and lightweight
- SVG track, point, lights, captions, and image blocks must remain aligned and uncluttered

### 10) Performance
Requirements:
- lightweight initial load
- optimized for GitHub Pages static hosting
- lazy-load non-critical placeholder images
- avoid unnecessary JavaScript dependencies
- keep animation logic efficient and tied to one normalized progress system

## Suggested Content Structure
Use Monza-inspired scene naming. Exact text can be placeholder for now.

Suggested prototype scene list:
1. Intro / Start lights
2. Rettifilo
3. Curva Grande
4. Variante della Roggia
5. Lesmo 1
6. Lesmo 2
7. Serraglio / transition segment
8. Ascari
9. Parabolica / Alboreto
10. Finish
11. Weigh-in
12. Waiting room
13. Podium

If fewer scenes are needed, combine some mid-lap segments.

## Placeholder Caption Examples
These are starter placeholders, not final copy.

- Start: `Five lights over one of racing's most storied circuits.`
- Rettifilo: `The lap begins with commitment under pressure.`
- Curva Grande: `Speed stays high. So does the tension.`
- Roggia: `Monza punishes hesitation and rewards precision.`
- Lesmo 1: `The rhythm tightens through the forested corners.`
- Lesmo 2: `Exit speed matters. It always matters here.`
- Ascari: `One of Monza's defining sequences demands absolute control.`
- Parabolica / Alboreto: `A final arc before the straight, the crowd, and the line.`
- Weigh-in: `After the finish, every detail still counts.`
- Waiting room: `Three chairs. Three silhouettes. One result still hanging in the air.`
- Podium: `At Monza, the finish is only the beginning of the celebration.`

## UX Flow Details

### Initial State
- viewport opens on sticky stage
- Monza SVG visible
- red point sits at lap start
- 5 red lights visible
- first caption invites downward scroll subtly

### Active Story State
- user scroll drives normalized progress
- red point moves continuously along path
- scenes fade/slide in when progress reaches scene thresholds
- previous scenes can fade out or become secondary

### Finish State
- point reaches the end of the track
- track story resolves
- scene transitions into weigh-in, waiting room, then podium

## Interaction Model
Map page scroll to a single master progress value.

Example:
- `progress = clamp((scrollY - stageStart) / scrollRange, 0, 1)`

Derived from progress:
- point position along SVG path
- trail rendering
- scene active states
- start light state
- finish sequence thresholds
- vibration triggers

## Information Architecture
Suggested project structure:

```text
/
  index.html
  /src
    main.jsx
    App.jsx
    /components
      StickyStage.jsx
      TrackMap.jsx
      StartLights.jsx
      StoryScene.jsx
      FinalSequence.jsx
    /data
      scenes.js
    /hooks
      useScrollProgress.js
      usePathMotion.js
    /styles
      base.css
      layout.css
      scenes.css
  /public
    /assets
      /images
        turn-01.png
        turn-02.png
        turn-03.png
        ...
        weigh-in.png
        waiting-room.png
        podium.png
      /svg
        monza-track.svg
```

## Visual Design Direction
- realistic overall mood
- clean editorial composition
- high contrast between dark / neutral background and the red point
- restrained UI, minimal controls, almost no chrome
- image placeholders may use solid colors now, but dimensions and layout should already feel intentional

## Accessibility Requirements
- text contrast should be sufficient
- motion should not break usability
- page should remain usable without vibration support
- semantic structure should be preserved
- provide `prefers-reduced-motion` fallback where motion intensity is reduced

## Acceptance Criteria
The prototype is successful when:
- Monza track remains sticky and visually stable during core scroll sequence
- point moves smoothly and uniformly along the SVG track
- trail is visible behind the point
- 5 red lights switch to green on first scroll
- each scene reveals a placeholder image and short caption
- finish sequence includes weigh-in, waiting room, and podium in that order
- site works well on desktop and mobile
- initial load is lightweight enough for GitHub Pages demo use
- codebase is structured cleanly enough for future asset replacement and content expansion

## Future Extensions
Not required now, but architecture should not block them later:
- real photography or archival images
- richer historical storytelling
- sound design
- multilingual support
- other circuits using the same engine
- analytics and engagement tracking
- alternate pacing / autoplay / guided mode

## Open Assumptions Resolved
These assumptions are locked for v1 unless changed later:
- English only
- realistic tone
- scroll-only interaction
- uniform point movement
- small red point with trail
- instant light switch on first scroll
- SVG track contour
- placeholder image blocks as separate files
- standalone site on GitHub Pages
- agents may improve UX and implementation quality
