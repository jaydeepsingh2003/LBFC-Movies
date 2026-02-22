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
            duration: 0.8,
            ease: 'power4.inOut',
            onComplete: onComplete
          });
        }
      });

      // Netflix-style vanishing point setup - slightly faster for navigation
      gsap.set(logoRef.current, { scale: 0.2, opacity: 0, z: -2000, rotationY: -15, filter: 'blur(20px)' });
      gsap.set(textRef.current, { opacity: 0, y: 100, letterSpacing: '2em', scale: 0.5 });
      gsap.set(glowRef.current, { opacity: 0, scale: 0.1 });
      gsap.set(lineRef.current, { width: 0, opacity: 0 });

      // The 3D Explosion Sequence
      tl.to(logoRef.current, {
        opacity: 1,
        scale: 1,
        z: 0,
        rotationY: 0,
        filter: 'blur(0px)',
        duration: 1.2,
        ease: 'expo.out'
      })
      .to(glowRef.current, {
        opacity: 1,
        scale: 2.5,
        duration: 1.5,
        ease: 'power2.out'
      }, '-=1.0')
      .to(lineRef.current, {
        width: '300px',
        opacity: 1,
        duration: 1.0,
        ease: 'power4.out'
      }, '-=1.2')
      .to(textRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        letterSpacing: '0.3em',
        duration: 1.5,
        ease: 'power4.out'
      }, '-=1.2')
      .to(logoRef.current, {
        scale: 1.05,
        duration: 1.5,
        ease: 'linear'
      }, '-=0.3')
      // Final Netflix-style Zoom-Through
      .to([logoRef.current, textRef.current, lineRef.current], {
        scale: 15,
        opacity: 0,
        z: 3000,
        filter: 'blur(40px)',
        duration: 1.2,
        ease: 'power4.in',
        delay: 0.2
      })
      .to(glowRef.current, {
        scale: 8,
        opacity: 0,
        duration: 1.0,
        ease: 'power4.in'
      }, '-=1.0');
    }, containerRef);

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505] overflow-hidden"
      style={{ perspective: '2000px' }}
    >
      {/* Background Deep Glow */}
      <div ref={glowRef} className="absolute size-[600px] bg-primary/40 rounded-full blur-[180px] pointer-events-none" />
      
      <div ref={logoRef} className="relative mb-12 preserve-3d">
        <div className="p-8 md:p-12 bg-primary rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_0_100px_rgba(225,29,72,0.8)] border border-white/20 transform-gpu transition-all">
          <Film className="size-28 md:size-48 text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]" />
        </div>
        {/* Shimmer Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 blur-xl animate-pulse rounded-full" />
      </div>

      <div className="flex flex-col items-center gap-8 relative z-10">
        <h1 
          ref={textRef}
          className="font-headline text-5xl md:text-9xl font-black text-white tracking-tighter uppercase drop-shadow-[0_0_50px_rgba(225,29,72,0.4)]"
        >
          LBFC <span className="text-primary">STUDIO</span>
        </h1>
        
        {/* Netflix-style horizontal pulse line */}
        <div ref={lineRef} className="h-[3px] bg-primary shadow-[0_0_25px_rgba(225,29,72,1)] rounded-full" />
      </div>

      <div className="absolute bottom-16 flex flex-col items-center gap-4">
        <span className="text-[10px] font-black uppercase tracking-[0.6em] text-muted-foreground animate-pulse opacity-50">
          Syncing Cinematic Stream
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
