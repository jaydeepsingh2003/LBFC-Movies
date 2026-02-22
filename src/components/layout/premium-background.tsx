'use client';

/**
 * PremiumBackground component handles the high-fidelity cinematic atmosphere.
 * It is placed behind all other content using fixed positioning and a low z-index.
 */
export function PremiumBackground() {
  return (
    <>
      {/* Base mesh gradient layer */}
      <div className="premium-bg pointer-events-none" aria-hidden="true" />
      
      {/* Texture noise layer */}
      <div className="film-grain pointer-events-none" aria-hidden="true" />
      
      {/* Master vignette overlay */}
      <div className="fixed inset-0 pointer-events-none z-[-2] bg-gradient-to-b from-black/20 via-transparent to-black/40" aria-hidden="true" />
    </>
  );
}