import { memo } from 'react';

export const StartLights = memo(function StartLights({ active }) {
  const color = active ? 'var(--light-green)' : 'var(--light-red)';
  const glow = active ? 'var(--light-green-glow)' : 'var(--light-red-glow)';

  return (
    <div className="start-lights" role="presentation" aria-hidden>
      <div className="start-lights__bar">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className="start-lights__lamp"
            style={{
              background: color,
              boxShadow: `0 0 14px ${glow}, inset 0 -2px 6px rgba(0,0,0,0.45)`,
              transition: 'background 0.12s ease-out, box-shadow 0.12s ease-out, transform 0.12s ease-out',
              transform: active ? 'scale(1.02)' : 'scale(1)',
              transitionDelay: active ? `${i * 12}ms` : '0ms',
            }}
          />
        ))}
      </div>
    </div>
  );
});
