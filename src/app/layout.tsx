'use client';

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { VideoPlayerProvider } from '@/context/video-provider';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AppLayout } from '@/components/layout/app-layout';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { PremiumBackground } from '@/components/layout/premium-background';

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
  return (
    <html lang="en" className="dark">
      <head>
        <title>LBFC | AI Movie Hub</title>
        <meta name="description" content="AI-Powered Movie Recommendations & Discovery" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased selection:bg-primary/30">
          <PremiumBackground />
          <FirebaseClientProvider>
            <VideoPlayerProvider>
                <LayoutWrapper>{children}</LayoutWrapper>
                <Toaster />
            </VideoPlayerProvider>
          </FirebaseClientProvider>
      </body>
    </html>
  );
}