import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { VideoPlayerProvider } from '@/context/video-provider';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Metadata, Viewport } from 'next';
import { ClientShell } from '@/components/layout/client-shell';

export const metadata: Metadata = {
  title: "CINEVEXIA | Where Movies Come Alive",
  description: "Stream the latest and greatest films anytime, anywhere with CINEVEXIA. The ultimate premium OTT experience.",
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
