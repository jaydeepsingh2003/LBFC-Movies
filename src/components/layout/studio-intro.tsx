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

      // Initial State: Netflix-style depth
      gsap.set(logoRef.current, { scale: 0.5, opacity: 0, z: -1000, rotationY: -45 });
      gsap.set(textRef.current, { opacity: 0, y: 40, letterSpacing: '1em' });
      gsap.set(glowRef.current, { opacity: 0, scale: 0 });

      // The Sequence
      tl.to(logoRef.current, {
        opacity: 1,
        scale: 1,
        z: 0,
        rotationY: 0,
        duration: 2.5,
        ease: 'expo.out'
      })
      .to(glowRef.current, {
        opacity: 0.8,
        scale: 2,
        duration: 2,
        ease: 'power2.out'
      }, '-=2')
      .to(textRef.current, {
        opacity: 1,
        y: 0,
        letterSpacing: '0.2em',
        duration: 1.5,
        ease: 'power3.out'
      }, '-=1.2')
      .to(logoRef.current, {
        rotationY: 360,
        duration: 2,
        ease: 'power2.inOut'
      }, '-=0.5')
      .to([logoRef.current, textRef.current], {
        scale: 15,
        opacity: 0,
        z: 1000,
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
      style={{ perspective: '1500px' }}
    >
      <div ref={glowRef} className="absolute size-[500px] bg-primary/30 rounded-full blur-[150px] pointer-events-none" />
      
      <div ref={logoRef} className="relative mb-12 preserve-3d">
        <div className="p-8 bg-primary rounded-[2.5rem] shadow-[0_0_80px_rgba(225,29,72,0.6)] border border-white/10">
          <Film className="size-24 md:size-40 text-white" />
        </div>
        <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full animate-pulse" />
      </div>

      <h1 
        ref={textRef}
        className="font-headline text-6xl md:text-9xl font-black text-white tracking-tighter uppercase drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
      >
        LBFC <span className="text-primary">STUDIO</span>
      </h1>
      
      <div className="absolute bottom-16 flex flex-col items-center gap-4">
        <div className="w-64 h-[2px] bg-white/10 relative overflow-hidden rounded-full">
          <div className="absolute inset-0 bg-primary w-1/2 animate-[shimmer_2.5s_infinite] shadow-[0_0_15px_rgba(225,29,72,1)]" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground animate-pulse">Initializing Cinematic Interface</span>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}