'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface StudioIntroProps {
  onComplete: () => void;
}

export function StudioIntro({ onComplete }: StudioIntroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.to(containerRef.current, {
            opacity: 0,
            duration: 0.3, 
            ease: 'power2.inOut',
            onComplete: onComplete
          });
        }
      });

      gsap.set(textRef.current, { 
        opacity: 0, 
        scale: 0.8,
        letterSpacing: '1.5em',
        force3D: true 
      });
      gsap.set(glowRef.current, { opacity: 0, scale: 0.1 });
      gsap.set(lineRef.current, { width: 0, opacity: 0 });
      gsap.set(taglineRef.current, { opacity: 0, y: 20 });

      tl.to(glowRef.current, {
        opacity: 1,
        scale: 2,
        duration: 0.6,
        ease: 'expo.out'
      })
      .to(textRef.current, {
        opacity: 1,
        scale: 1,
        letterSpacing: '0.2em',
        duration: 0.8,
        ease: 'expo.out'
      }, '-=0.4')
      .to(lineRef.current, {
        width: '300px',
        opacity: 1,
        duration: 0.5,
        ease: 'power4.out'
      }, '-=0.6')
      .to(taglineRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'back.out(1.7)'
      }, '-=0.2')
      .to([textRef.current, lineRef.current, taglineRef.current], {
        scale: 1.05,
        duration: 1.5,
        ease: 'none'
      })
      .to(containerRef.current, {
        filter: 'blur(20px)',
        scale: 1.5,
        opacity: 0,
        duration: 0.5,
        ease: 'power4.in'
      });
    }, containerRef);

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0B0B0F] overflow-hidden"
    >
      <div ref={glowRef} className="absolute size-[500px] bg-primary/20 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="flex flex-col items-center gap-6 relative z-10 w-full px-4 text-center">
        <h1 
          ref={textRef}
          className="font-headline text-4xl sm:text-6xl md:text-8xl font-black text-white tracking-widest uppercase whitespace-nowrap will-change-transform"
        >
          CINE<span className="text-primary">V</span>EXIA
        </h1>
        <div ref={lineRef} className="h-[2px] bg-primary shadow-[0_0_20px_rgba(229,9,20,0.8)] rounded-full will-change-[width]" />
        <p 
          ref={taglineRef}
          className="text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-[0.5em] text-muted-foreground mt-2"
        >
          Where Movies Come Alive
        </p>
      </div>

      <div className="absolute bottom-12">
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 animate-pulse">
          Premium Streaming Hub
        </span>
      </div>
    </div>
  );
}
