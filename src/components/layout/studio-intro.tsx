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
            duration: 0.25, // Accelerated cleanup
            ease: 'power2.inOut',
            onComplete: onComplete
          });
        }
      });

      // Rapid Setup
      gsap.set(logoRef.current, { 
        scale: 0.4, 
        opacity: 0, 
        z: -1000, 
        rotationY: -10, 
        filter: 'blur(15px)',
        force3D: true 
      });
      gsap.set(textRef.current, { 
        opacity: 0, 
        y: 40, 
        letterSpacing: '1.5em', 
        scale: 0.8,
        force3D: true 
      });
      gsap.set(glowRef.current, { opacity: 0, scale: 0.2 });
      gsap.set(lineRef.current, { width: 0, opacity: 0 });

      // Accelerated Netflix-Style Sequence
      tl.to(logoRef.current, {
        opacity: 1,
        scale: 1,
        z: 0,
        rotationY: 0,
        filter: 'blur(0px)',
        duration: 0.5,
        ease: 'expo.out'
      })
      .to(glowRef.current, {
        opacity: 1,
        scale: 2.2,
        duration: 0.6,
        ease: 'power3.out'
      }, '-=0.35')
      .to(lineRef.current, {
        width: '280px',
        opacity: 1,
        duration: 0.4,
        ease: 'power4.out'
      }, '-=0.5')
      .to(textRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        letterSpacing: '0.12em',
        duration: 0.5,
        ease: 'power4.out'
      }, '-=0.5')
      .to(logoRef.current, {
        scale: 1.03,
        duration: 0.4,
        ease: 'none'
      }, '-=0.1')
      // High-Velocity Punch-Through
      .to([logoRef.current, textRef.current, lineRef.current], {
        scale: 30,
        opacity: 0,
        z: 4000,
        filter: 'blur(30px)',
        duration: 0.5,
        ease: 'power4.in',
        delay: 0.05
      })
      .to(glowRef.current, {
        scale: 7,
        opacity: 0,
        duration: 0.4,
        ease: 'power4.in'
      }, '-=0.4');
    }, containerRef);

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505] overflow-hidden will-change-opacity"
      style={{ perspective: '1500px' }}
    >
      <div ref={glowRef} className="absolute size-[500px] bg-primary/30 rounded-full blur-[150px] pointer-events-none" />
      
      <div ref={logoRef} className="relative mb-8 preserve-3d will-change-transform">
        <div className="p-7 md:p-10 bg-primary rounded-[2.2rem] md:rounded-[3rem] shadow-[0_0_80px_rgba(225,29,72,0.6)] border border-white/10">
          <Film className="size-20 md:size-32 text-white" />
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 relative z-10 w-full px-4">
        <h1 
          ref={textRef}
          className="font-headline text-4xl sm:text-6xl md:text-8xl font-black text-white tracking-tighter uppercase drop-shadow-[0_0_40px_rgba(225,29,72,0.3)] whitespace-nowrap will-change-transform"
        >
          LBFC <span className="text-primary">STUDIO</span>
        </h1>
        <div ref={lineRef} className="h-[2.5px] bg-primary shadow-[0_0_25px_rgba(225,29,72,0.8)] rounded-full will-change-[width]" />
      </div>

      <div className="absolute bottom-10">
        <span className="text-[9px] font-black uppercase tracking-[0.5em] text-muted-foreground animate-pulse opacity-40">
          Ready Master Transmission
        </span>
      </div>
    </div>
  );
}