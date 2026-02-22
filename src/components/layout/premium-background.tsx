'use client';

export function PremiumBackground() {
  return (
    <>
      <div className="premium-bg" aria-hidden="true" />
      <div className="film-grain" aria-hidden="true" />
      <div className="fixed inset-0 pointer-events-none z-[-1] bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" aria-hidden="true" />
    </>
  );
}