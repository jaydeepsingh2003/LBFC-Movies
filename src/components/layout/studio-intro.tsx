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
            duration: 0.4,
            ease: 'power4.inOut',
            onComplete: onComplete
          });
        }
      });

      // Netflix-style high-velocity setup
      gsap.set(logoRef.current, { 
        scale: 0.4, 
        opacity: 0, 
        z: -1000, 
        rotationY: -10, 
        filter: 'blur(10px)',
        force3D: true 
      });
      gsap.set(textRef.current, { 
        opacity: 0, 
        y: 40, 
        letterSpacing: '1.5em', 
        scale: 0.8,
        force3D: true 
      });
      gsap.set(glowRef.current, { opacity: 0, scale: 0.1 });
      gsap.set(lineRef.current, { width: 0, opacity: 0 });

      // The 3D Explosion Sequence - ACCELERATED
      tl.to(logoRef.current, {
        opacity: 1,
        scale: 1,
        z: 0,
        rotationY: 0,
        filter: 'blur(0px)',
        duration: 0.7,
        ease: 'expo.out'
      })
      .to(glowRef.current, {
        opacity: 1,
        scale: 2,
        duration: 0.8,
        ease: 'power2.out'
      }, '-=0.5')
      .to(lineRef.current, {
        width: '240px',
        opacity: 1,
        duration: 0.6,
        ease: 'power4.out'
      }, '-=0.7')
      .to(textRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        letterSpacing: '0.2em',
        duration: 0.8,
        ease: 'power4.out'
      }, '-=0.7')
      .to(logoRef.current, {
        scale: 1.02,
        duration: 0.8,
        ease: 'linear'
      }, '-=0.2')
      // Final High-Speed Zoom-Through
      .to([logoRef.current, textRef.current, lineRef.current], {
        scale: 20,
        opacity: 0,
        z: 4000,
        filter: 'blur(30px)',
        duration: 0.7,
        ease: 'power4.in',
        delay: 0.1
      })
      .to(glowRef.current, {
        scale: 6,
        opacity: 0,
        duration: 0.6,
        ease: 'power4.in'
      }, '-=0.6');
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
      <div ref={glowRef} className="absolute size-[500px] bg-primary/30 rounded-full blur-[150px] pointer-events-none" />
      
      <div ref={logoRef} className="relative mb-8 preserve-3d will-change-transform">
        <div className="p-6 md:p-10 bg-primary rounded-[2rem] md:rounded-[3rem] shadow-[0_0_80px_rgba(225,29,72,0.6)] border border-white/20 transform-gpu">
          <Film className="size-20 md:size-32 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 blur-xl animate-pulse rounded-full" />
      </div>

      <div className="flex flex-col items-center gap-6 relative z-10 w-full px-4">
        <h1 
          ref={textRef}
          className="font-headline text-3xl sm:text-5xl md:text-8xl font-black text-white tracking-tighter uppercase drop-shadow-[0_0_40px_rgba(225,29,72,0.3)] whitespace-nowrap will-change-transform"
        >
          LBFC <span className="text-primary">STUDIO</span>
        </h1>
        
        {/* Rapid pulse line */}
        <div ref={lineRef} className="h-[2px] bg-primary shadow-[0_0_20px_rgba(225,29,72,1)] rounded-full will-change-[width]" />
      </div>

      <div className="absolute bottom-12 flex flex-col items-center gap-2">
        <span className="text-[9px] font-black uppercase tracking-[0.5em] text-muted-foreground animate-pulse opacity-40">
          Initializing Stream
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
