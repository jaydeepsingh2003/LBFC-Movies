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
  const textLeftRef = useRef<HTMLSpanElement>(null);
  const textRightRef = useRef<HTMLSpanElement>(null);
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

      // Initial state - Invisible and positioned for reveal
      gsap.set(logoRef.current, { scale: 0.4, opacity: 0 });
      gsap.set(textLeftRef.current, { x: 80, opacity: 0 });
      gsap.set(textRightRef.current, { x: -80, opacity: 0 });
      gsap.set(taglineRef.current, { opacity: 0, y: 15 });
      gsap.set(glowRef.current, { scale: 0.2, opacity: 0 });

      // Phase 1: The Core Reveal (V Logo)
      tl.to(glowRef.current, {
        scale: 1,
        opacity: 0.7,
        duration: 1.2,
        ease: 'power4.out'
      })
      .to(logoRef.current, {
        scale: 1,
        opacity: 1,
        duration: 0.8,
        ease: 'back.out(1.7)'
      }, '-=0.8')
      
      // Phase 2: The Horizon Expansion (CINE - V - EXIA)
      .to(textLeftRef.current, {
        x: 0,
        opacity: 1,
        duration: 0.7,
        ease: 'expo.out'
      }, '+=0.1')
      .to(textRightRef.current, {
        x: 0,
        opacity: 1,
        duration: 0.7,
        ease: 'expo.out'
      }, '<')
      
      // Phase 3: The Narrative Signature & Atmosphere Pulse
      .to(taglineRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out'
      }, '-=0.3')
      .to(glowRef.current, {
        scale: 1.4,
        opacity: 0.4,
        duration: 1.5,
        ease: 'sine.inOut'
      }, '-=0.5')
      
      // Phase 4: Cinematic Exit (Blur into App)
      .to(containerRef.current, {
        filter: 'blur(30px)',
        scale: 1.15,
        opacity: 0,
        duration: 0.7,
        ease: 'power4.in',
        delay: 0.6
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
      
      <div className="relative flex flex-col items-center gap-10 z-10 w-full px-4 text-center">
        {/* Main Branding Architecture */}
        <div className="flex items-center justify-center gap-2 md:gap-6 h-24 md:h-40">
          <span 
            ref={textLeftRef}
            className="font-headline text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black text-white uppercase tracking-tighter select-none"
          >
            CINE
          </span>
          
          {/* The Anchor: V Logo */}
          <div ref={logoRef} className="size-16 sm:size-24 md:size-32 lg:size-40 shrink-0 drop-shadow-[0_0_30px_rgba(229,9,20,0.5)]">
            <CinevexiaLogo />
          </div>
          
          <span 
            ref={textRightRef}
            className="font-headline text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black text-white uppercase tracking-tighter select-none"
          >
            EXIA
          </span>
        </div>

        {/* Narrative Tagline */}
        <div className="overflow-hidden py-2">
            <p 
              ref={taglineRef}
              className="text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-[0.6em] text-muted-foreground opacity-80"
            >
              Where Movies Come Alive
            </p>
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
