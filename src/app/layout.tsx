'use client';

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { VideoPlayerProvider } from '@/context/video-provider';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AppLayout } from '@/components/layout/app-layout';
import { usePathname } from 'next/navigation';
import { ReactNode, useState, useEffect } from 'react';
import { PremiumBackground } from '@/components/layout/premium-background';
import { StudioIntro } from '@/components/layout/studio-intro';
import { gsap } from 'gsap';

function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return <AppLayout>{children}</AppLayout>;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [showIntro, setShowIntro] = useState(true);
  const pathname = usePathname();

  // Trigger intro on every navigation to maintain cinematic feel
  useEffect(() => {
    setShowIntro(true);
  }, [pathname]);

  const handleIntroComplete = () => {
    setShowIntro(false);
    
    // Entrance 3D Animation for main content
    gsap.fromTo('.main-content-layer', 
      { perspective: '1000px', rotationX: 15, scale: 0.8, opacity: 0, z: -500 },
      { rotationX: 0, scale: 1, opacity: 1, z: 0, duration: 1.5, ease: 'expo.out' }
    );
  };

  return (
    <html lang="en" className="dark">
      <head>
        <title>LBFC | AI Movie Hub</title>
        <meta name="description" content="AI-Powered Movie Recommendations & Discovery" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased selection:bg-primary/30 overflow-x-hidden bg-transparent">
          {showIntro && <StudioIntro onComplete={handleIntroComplete} />}
          <div className={`${showIntro ? 'invisible h-0 overflow-hidden' : 'visible opacity-100'} transition-opacity duration-500`}>
            <PremiumBackground />
            <FirebaseClientProvider>
              <VideoPlayerProvider>
                  <div className="main-content-layer">
                    <LayoutWrapper>{children}</LayoutWrapper>
                  </div>
                  <Toaster />
              </VideoPlayerProvider>
            </FirebaseClientProvider>
          </div>
      </body>
    </html>
  );
}
