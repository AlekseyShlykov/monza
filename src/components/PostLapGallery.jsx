import { memo, useMemo } from 'react';
import { POST_LAP_COOLDOWN_MAX, postLapPhotos } from '../data/scenes.js';

function assetUrl(path) {
  const p = path.startsWith('/') ? path.slice(1) : path;
  return `${import.meta.env.BASE_URL}${p}`;
}

/** Большую часть post-lap скролла — cooldown, затем podium (см. POST_LAP_COOLDOWN_MAX). */
export const PostLapGallery = memo(
  function PostLapGallery({ postT }) {
    const [cooldownSrc, podiumSrc] = postLapPhotos;
    const { cooldownOpacity, podiumOpacity } = useMemo(() => {
      const t = Math.min(1, Math.max(0, postT));
      if (t < POST_LAP_COOLDOWN_MAX) {
        return { cooldownOpacity: 1, podiumOpacity: 0 };
      }
      return { cooldownOpacity: 0, podiumOpacity: 1 };
    }, [postT]);

    return (
      <div className="post-lap-gallery" aria-label="После финиша">
        <div className="post-lap-gallery__slot">
          <div
            className="post-lap-gallery__slide"
            aria-hidden={cooldownOpacity < 0.01}
            style={{ opacity: cooldownOpacity }}
          >
            <img
              src={assetUrl(cooldownSrc)}
              alt=""
              loading="lazy"
              decoding="async"
              className="post-lap-gallery__img"
            />
          </div>
          <div
            className="post-lap-gallery__slide"
            aria-hidden={podiumOpacity < 0.01}
            style={{ opacity: podiumOpacity }}
          >
            <img
              src={assetUrl(podiumSrc)}
              alt=""
              loading="lazy"
              decoding="async"
              className="post-lap-gallery__img"
            />
          </div>
        </div>
      </div>
    );
  },
  (prev, next) =>
    (prev.postT < POST_LAP_COOLDOWN_MAX) === (next.postT < POST_LAP_COOLDOWN_MAX),
);
