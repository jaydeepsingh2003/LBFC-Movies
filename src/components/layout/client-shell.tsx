'use client';

import { ReactNode, useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { StudioIntro } from '@/components/layout/studio-intro';
import { PremiumBackground } from '@/components/layout/premium-background';

export function ClientShell({ children }: { children: ReactNode }) {
  const [showIntro, setShowIntro] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="bg-[#0B0B0F] min-h-screen" />;

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  return (
    <>
      {showIntro && <StudioIntro onComplete={handleIntroComplete} />}
      <div className={`${showIntro ? 'invisible h-0' : 'visible opacity-100'} transition-opacity duration-500`}>
        <PremiumBackground />
        <AppLayout>{children}</AppLayout>
      </div>
    </>
  );
}