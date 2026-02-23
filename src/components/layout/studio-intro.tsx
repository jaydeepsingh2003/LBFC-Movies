'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { CinevexiaLogo } from '@/components/icons/cinevexia-logo';

interface StudioIntroProps {
  onComplete: () => void;
}

export function StudioIntro({ onComplete }: StudioIntroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.to(containerRef.current, {
            opacity: 0,
            duration: 0.4,
            ease: 'power2.inOut',
            onComplete: onComplete
          });
        }
      });

      // Initial state - Everything invisible or pre-positioned
      gsap.set(logoRef.current, { scale: 0.5, opacity: 0 });
      gsap.set(nameRef.current, { opacity: 0, y: 10, letterSpacing: '0.5em' });
      gsap.set(taglineRef.current, { opacity: 0, y: 15 });
      gsap.set(glowRef.current, { scale: 0.3, opacity: 0 });

      // Stage 1: The V Logo reveal
      tl.to(glowRef.current, {
        scale: 1,
        opacity: 0.6,
        duration: 1,
        ease: 'power3.out'
      })
      .to(logoRef.current, {
        scale: 1,
        opacity: 1,
        duration: 0.8,
        ease: 'back.out(1.7)'
      }, '-=0.7')
      
      // Stage 2: Logo exits to make room for the name
      .to(logoRef.current, {
        scale: 0.8,
        opacity: 0,
        duration: 0.5,
        ease: 'power4.in',
        delay: 0.8
      })
      .to(glowRef.current, {
        scale: 1.2,
        opacity: 0.3,
        duration: 0.5
      }, '<')

      // Stage 3: The Full Name reveal
      .to(nameRef.current, {
        opacity: 1,
        y: 0,
        letterSpacing: '0.1em',
        duration: 0.8,
        ease: 'expo.out'
      })
      
      // Stage 4: Tagline and Exit preparation
      .to(taglineRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out'
      }, '-=0.3')
      .to(glowRef.current, {
        scale: 1.5,
        opacity: 0.2,
        duration: 1.2,
        ease: 'sine.inOut'
      }, '-=0.5')
      
      // Cinematic Exit
      .to(containerRef.current, {
        filter: 'blur(40px)',
        scale: 1.1,
        opacity: 0,
        duration: 0.6,
        ease: 'power4.in',
        delay: 0.5
      });

    }, containerRef);

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0B0B0F] overflow-hidden"
    >
      {/* Dynamic Background Atmosphere */}
      <div ref={glowRef} className="absolute size-[600px] bg-primary/30 rounded-full blur-[140px] pointer-events-none" />
      
      <div className="relative flex flex-col items-center justify-center z-10 w-full px-4 text-center min-h-[300px]">
        {/* Stage 1 Container: The Logo */}
        <div ref={logoRef} className="absolute size-24 sm:size-32 md:size-40 shrink-0 drop-shadow-[0_0_40px_rgba(229,9,20,0.6)]">
          <CinevexiaLogo />
        </div>

        {/* Stage 2 Container: The Full Name */}
        <div className="flex flex-col items-center gap-6">
          <h1 
            ref={nameRef}
            className="font-headline text-4xl sm:text-6xl md:text-8xl font-black text-white uppercase tracking-tighter select-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
          >
            CINE<span className="text-primary">V</span>EXIA
          </h1>
          
          <div className="overflow-hidden py-2">
              <p 
                ref={taglineRef}
                className="text-[9px] sm:text-xs font-black uppercase tracking-[0.6em] text-muted-foreground opacity-80"
              >
                Where Movies Come Alive
              </p>
          </div>
        </div>
      </div>

      {/* Security Protocol Note */}
      <div className="absolute bottom-12 opacity-10">
        <span className="text-[8px] font-black uppercase tracking-[0.5em] text-white">
          Transmission Established // Secure Node
        </span>
      </div>
    </div>
  );
}
