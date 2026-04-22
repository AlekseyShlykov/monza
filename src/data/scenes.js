/**
 * Scroll-normalized story timeline (0–1 over the whole `.story-region`).
 * Lap dot completes one circuit when `progress === LAP_PROGRESS_END` (lapT === 1).
 * After that, post-lap scroll drives layout + gallery (see StickyStage).
 */
export const LAP_PROGRESS_END = 0.72;

export const scenes = [
  {
    id: 'intro',
    turnLabel: 'START',
    title: 'Grid',
    caption: 'Five lights over one of racing’s most storied circuits.',
    pFadeIn: -0.12,
    pFocus: 0.035,
    pFadeOut: 0.1,
    placeholder: 'assets/placeholders/start.png',
    vibrate: [7],
  },
  {
    id: 'rettifilo',
    turnLabel: 'TURN 1',
    title: 'Rettifilo',
    caption: 'The lap begins with commitment under pressure.',
    pFadeIn: 0.06,
    pFocus: 0.1,
    pFadeOut: 0.14,
    placeholder: 'assets/placeholders/turn1.png',
    vibrate: [10],
  },
  {
    id: 'curva-grande',
    turnLabel: 'TURN 2',
    title: 'Curva Grande',
    caption: 'Speed stays high. So does the tension.',
    pFadeIn: 0.12,
    pFocus: 0.16,
    pFadeOut: 0.2,
    placeholder: 'assets/placeholders/turn2.png',
    vibrate: [9],
  },
  {
    id: 'roggia',
    turnLabel: 'TURNS 3–4',
    title: 'Variante della Roggia',
    caption: 'Monza punishes hesitation and rewards precision.',
    pFadeIn: 0.18,
    pFocus: 0.22,
    pFadeOut: 0.27,
    placeholder: 'assets/placeholders/turn34.png',
    vibrate: [11],
  },
  {
    id: 'lesmo-1',
    turnLabel: 'TURN 5',
    title: 'Lesmo 1',
    caption: 'The rhythm tightens through the forested corners.',
    pFadeIn: 0.25,
    pFocus: 0.29,
    pFadeOut: 0.33,
    placeholder: 'assets/placeholders/turn5.png',
    vibrate: [10],
  },
  {
    id: 'lesmo-2',
    turnLabel: 'TURN 6',
    title: 'Lesmo 2',
    caption: 'Exit speed matters. It always matters here.',
    pFadeIn: 0.31,
    pFocus: 0.35,
    pFadeOut: 0.39,
    placeholder: 'assets/placeholders/turn6.png',
    vibrate: [9],
  },
  {
    id: 'ascari',
    turnLabel: 'TURNS 8–10',
    title: 'Ascari',
    caption: 'One of Monza’s defining sequences demands absolute control.',
    pFadeIn: 0.41,
    pFocus: 0.5,
    pFadeOut: 0.56,
    placeholder: 'assets/placeholders/turn810.png',
    vibrate: [13],
  },
  {
    id: 'parabolica',
    turnLabel: 'TURN 11',
    title: 'Parabolica / Alboreto',
    caption: 'A final arc before the straight, the crowd, and the line.',
    pFadeIn: 0.53,
    pFocus: 0.61,
    pFadeOut: 0.67,
    placeholder: 'assets/placeholders/turn11.png',
    vibrate: [11],
  },
  {
    id: 'finish',
    turnLabel: 'FINISH',
    title: 'Race',
    caption: 'The lap closes. The clock stops. The story does not.',
    pFadeIn: 0.64,
    pFocus: LAP_PROGRESS_END,
    pFadeOut: 0.76,
    placeholder: 'assets/placeholders/finish.png',
    vibrate: null,
  },
];

/** Короткие импульсы при пересечении фокуса сцены при скролле (финиш — отдельно в движке). */
export const SCROLL_HAPTIC_MILESTONES = scenes
  .filter((s) => s.id !== 'finish')
  .map((s) => ({ p: s.pFocus, pattern: s.vibrate ?? [10] }));

/**
 * Доля post-lap скролла (postT 0→1): ниже порога — кадр cooldown, выше — podium.
 * Больше значение = дольше виден cooldown.
 */
export const POST_LAP_COOLDOWN_MAX = 0.8;

/** Подпись под кадром podium в галерее */
export const PODIUM_GALLERY_FOOTNOTE = 'Created by Alex Shlykov for Evgeniy Safronov';

/** Post-finish scroll: first cooldown, then podium (one at a time). Paths under /public. */
export const postLapPhotos = [
  'assets/placeholders/cooldown.png',
  'assets/placeholders/podium.png',
];

export function sceneOpacity(scene, progress) {
  const { pFadeIn, pFocus, pFadeOut } = scene;
  if (progress >= pFadeOut) return 0;
  if (progress < pFadeIn) return 0;
  const up = smoothstep(pFadeIn, pFocus, progress);
  const down = 1 - smoothstep(pFocus, pFadeOut, progress);
  return Math.min(up, down);
}

function smoothstep(a, b, x) {
  if (a === b) return x >= b ? 1 : 0;
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}
