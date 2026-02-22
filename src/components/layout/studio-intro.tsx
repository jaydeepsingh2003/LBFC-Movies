
'use client';

import { useEffect, useRef, useState } from 'react';
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

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.to(containerRef.current, {
            opacity: 0,
            duration: 1,
            ease: 'power2.inOut',
            onComplete: onComplete
          });
        }
      });

      // Initial State
      gsap.set(logoRef.current, { scale: 0.5, opacity: 0, z: -500 });
      gsap.set(textRef.current, { opacity: 0, y: 20 });
      gsap.set(glowRef.current, { opacity: 0, scale: 0 });

      // Sequence
      tl.to(logoRef.current, {
        opacity: 1,
        scale: 1,
        z: 0,
        duration: 2,
        ease: 'expo.out'
      })
      .to(glowRef.current, {
        opacity: 0.6,
        scale: 1.5,
        duration: 1.5,
        ease: 'power2.out'
      }, '-=1.5')
      .to(textRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out'
      }, '-=0.8')
      .to(logoRef.current, {
        rotationY: 360,
        duration: 2,
        ease: 'power2.inOut'
      }, '-=0.5')
      .to([logoRef.current, textRef.current], {
        scale: 1.2,
        opacity: 0,
        z: 200,
        duration: 1.5,
        ease: 'power4.in',
        delay: 0.5
      });
    }, containerRef);

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505] overflow-hidden"
      style={{ perspective: '1000px' }}
    >
      <div ref={glowRef} className="absolute size-[400px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div ref={logoRef} className="relative mb-8">
        <div className="p-6 bg-primary rounded-[2rem] shadow-[0_0_50px_rgba(225,29,72,0.5)]">
          <Film className="size-20 md:size-32 text-white" />
        </div>
        <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full animate-pulse" />
      </div>

      <h1 
        ref={textRef}
        className="font-headline text-5xl md:text-8xl font-black text-white tracking-tighter uppercase"
      >
        LBFC <span className="text-primary">STUDIO</span>
      </h1>
      
      <div className="absolute bottom-12 flex flex-col items-center gap-2">
        <div className="w-48 h-[1px] bg-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary w-1/2 animate-[shimmer_2s_infinite]" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground animate-pulse">Initializing Interface</span>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
