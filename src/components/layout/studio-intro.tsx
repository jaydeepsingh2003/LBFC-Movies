
'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Film } from 'lucide-react';

interface StudioIntroProps {
  onComplete: () => void;
}

export function StudioIntro({ onComplete }: StudioIntroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.to(containerRef.current, {
            opacity: 0,
            duration: 0.3,
            ease: 'power4.inOut',
            onComplete: onComplete
          });
        }
      });

      // High-Velocity Setup
      gsap.set(logoRef.current, { 
        scale: 0.3, 
        opacity: 0, 
        z: -1200, 
        rotationY: -15, 
        filter: 'blur(20px)',
        force3D: true 
      });
      gsap.set(textRef.current, { 
        opacity: 0, 
        y: 60, 
        letterSpacing: '2em', 
        scale: 0.7,
        force3D: true 
      });
      gsap.set(glowRef.current, { opacity: 0, scale: 0.1 });
      gsap.set(lineRef.current, { width: 0, opacity: 0 });

      // Visceral 3D Reveal Sequence
      tl.to(logoRef.current, {
        opacity: 1,
        scale: 1,
        z: 0,
        rotationY: 0,
        filter: 'blur(0px)',
        duration: 0.6,
        ease: 'expo.out'
      })
      .to(glowRef.current, {
        opacity: 1,
        scale: 2.5,
        duration: 0.7,
        ease: 'power2.out'
      }, '-=0.4')
      .to(lineRef.current, {
        width: '300px',
        opacity: 1,
        duration: 0.5,
        ease: 'power4.out'
      }, '-=0.6')
      .to(textRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        letterSpacing: '0.15em',
        duration: 0.6,
        ease: 'power4.out'
      }, '-=0.6')
      .to(logoRef.current, {
        scale: 1.05,
        duration: 0.6,
        ease: 'linear'
      }, '-=0.1')
      // Aggressive 3D Zoom-Through
      .to([logoRef.current, textRef.current, lineRef.current], {
        scale: 25,
        opacity: 0,
        z: 5000,
        filter: 'blur(40px)',
        duration: 0.6,
        ease: 'power4.in',
        delay: 0.05
      })
      .to(glowRef.current, {
        scale: 8,
        opacity: 0,
        duration: 0.5,
        ease: 'power4.in'
      }, '-=0.5');
    }, containerRef);

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505] overflow-hidden will-change-opacity"
      style={{ perspective: '2000px' }}
    >
      {/* Background Deep Glow */}
      <div ref={glowRef} className="absolute size-[600px] bg-primary/40 rounded-full blur-[180px] pointer-events-none" />
      
      <div ref={logoRef} className="relative mb-10 preserve-3d will-change-transform">
        <div className="p-8 md:p-12 bg-primary rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_0_100px_rgba(225,29,72,0.7)] border border-white/20 transform-gpu">
          <Film className="size-24 md:size-36 text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 blur-2xl animate-pulse rounded-full" />
      </div>

      <div className="flex flex-col items-center gap-8 relative z-10 w-full px-4">
        <h1 
          ref={textRef}
          className="font-headline text-4xl sm:text-6xl md:text-9xl font-black text-white tracking-tighter uppercase drop-shadow-[0_0_50px_rgba(225,29,72,0.4)] whitespace-nowrap will-change-transform"
        >
          LBFC <span className="text-primary">STUDIO</span>
        </h1>
        
        {/* Rapid high-energy pulse line */}
        <div ref={lineRef} className="h-[3px] bg-primary shadow-[0_0_30px_rgba(225,29,72,1)] rounded-full will-change-[width]" />
      </div>

      <div className="absolute bottom-12 flex flex-col items-center gap-3">
        <span className="text-[10px] font-black uppercase tracking-[0.6em] text-muted-foreground animate-pulse opacity-50">
          Syncing Master Feed
        </span>
      </div>

      <style jsx global>{`
        .preserve-3d {
          transform-style: preserve-3d;
        }
      `}</style>
    </div>
  );
}
