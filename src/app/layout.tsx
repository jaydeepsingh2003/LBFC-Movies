
// src/app/layout.tsx
'use client';

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AiChatbotWidget } from '@/components/ai-chatbot-widget';
import { VideoPlayerProvider } from '@/context/video-provider';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AppLayout } from '@/components/layout/app-layout';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

// export const metadata: Metadata = {
//   title: 'LBFC',
//   description: 'AI-Powered Movie Recommendations',
// };

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
        <title>LBFC</title>
        <meta name="description" content="AI-Powered Movie Recommendations" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
          <FirebaseClientProvider>
            <VideoPlayerProvider>
              <SidebarProvider>
                <LayoutWrapper>{children}</LayoutWrapper>
              </SidebarProvider>
              <AiChatbotWidget />
              <Toaster />
            </VideoPlayerProvider>
          </FirebaseClientProvider>
      </body>
    </html>
  );
}
