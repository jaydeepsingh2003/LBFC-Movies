import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { VideoPlayerProvider } from '@/context/video-provider';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Metadata, Viewport } from 'next';
import { ClientShell } from '@/components/layout/client-shell';

export const metadata: Metadata = {
  title: "CINEVEXIA | Where Movies Come Alive",
  description: "Stream the latest and greatest films anytime, anywhere with CINEVEXIA. The ultimate premium OTT experience.",
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect x="16" y="16" width="480" height="480" rx="110" fill="%230B0B0F"/><g filter="url(%23glow)"><path d="M170 150 L230 360 L260 360 L210 150 Z" fill="%23FF2A2A"/><path d="M302 150 L242 360 L272 360 L332 150 Z" fill="%23FF2A2A"/></g><polygon points="250,230 285,255 250,280" fill="%230B0B0F"/></svg>',
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased selection:bg-primary/30 overflow-x-hidden bg-[#0B0B0F]">
          <FirebaseClientProvider>
            <VideoPlayerProvider>
                <ClientShell>{children}</ClientShell>
                <Toaster />
            </VideoPlayerProvider>
          </FirebaseClientProvider>
      </body>
    </html>
  );
}
