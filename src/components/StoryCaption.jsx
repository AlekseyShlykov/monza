import { memo } from 'react';

function assetUrl(path) {
  const p = path.startsWith('/') ? path.slice(1) : path;
  return `${import.meta.env.BASE_URL}${p}`;
}

export const StoryCaption = memo(function StoryCaption({ scene, strength }) {
  const visible = strength > 0.04;

  return (
    <div
      className="story-caption"
      data-visible={visible ? 'true' : 'false'}
      data-scene={scene.id}
      style={{
        opacity: visible ? Math.min(1, strength * 1.15) : 0,
        transform: `translate3d(0, ${visible ? 0 : 10}px, 0)`,
      }}
    >
      <div className="story-caption__panel">
        <p className="story-caption__eyebrow">
          <span>{scene.turnLabel}</span>
          <span className="story-caption__rule" />
        </p>
        <h2 className="story-caption__title">{scene.title}</h2>
        <p className="story-caption__text">{scene.caption}</p>
        <div className="story-caption__art" aria-hidden>
          <img
            key={scene.id}
            src={assetUrl(scene.placeholder)}
            alt=""
            loading="lazy"
            decoding="async"
            className="story-caption__img"
          />
        </div>
      </div>
    </div>
  );
});
