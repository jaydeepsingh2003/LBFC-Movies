'use client';

/**
 * PremiumBackground component handles the high-fidelity cinematic atmosphere.
 * It is placed behind all other content using fixed positioning and a low z-index.
 * This component is critical for the "Architect" design language.
 */
export function PremiumBackground() {
  return (
    <>
      {/* The base layer containing mesh gradients and background color */}
      <div className="premium-bg" aria-hidden="true" />
      
      {/* The texture layer providing film-like noise */}
      <div className="film-grain" aria-hidden="true" />
      
      {/* Additional subtle focus overlay - ensuring no interference with interactions */}
      <div className="fixed inset-0 pointer-events-none z-[-2] bg-black/10" aria-hidden="true" />
    </>
  );
}