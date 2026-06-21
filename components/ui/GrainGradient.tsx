type Props = {
  variant?: 'dark' | 'light';
  muted?: boolean;
  className?: string;
  contentClassName?: string;
  children?: React.ReactNode;
};

// Procedural grain gradient — Mappa brand signature.
// Adjust opacity (0.35–0.6) and baseFrequency (finer grain = higher value) to
// match brand-book images once available. mix-blend-mode overlay on the noise
// layer preserves gradient luminosity; swap to soft-light for a subtler result.
export function GrainGradient({ variant = 'dark', muted = false, className = '', contentClassName = '', children }: Props) {
  const gradient =
    variant === 'dark'
      ? muted
        ? 'radial-gradient(125% 85% at 50% 115%, rgba(252,166,94,0.08) 0%, rgba(255,121,131,0.06) 18%, rgba(4,18,130,0.22) 52%, #000 100%)'
        : 'radial-gradient(125% 85% at 50% 115%, #fca65e 0%, #ff7983 18%, #041282 52%, #000 100%)'
      : 'radial-gradient(125% 90% at 50% 120%, #fca65e 0%, #ff7983 16%, #041282 48%, #fff 100%)';

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: gradient }}>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-45 mix-blend-overlay"
      >
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
      <div className={`relative z-10 ${contentClassName}`}>{children}</div>
    </div>
  );
}
