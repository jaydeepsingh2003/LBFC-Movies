
'use client';

import { useEffect } from 'react';
import { useUser, loginWithGoogle } from '@/firebase/auth/auth-client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Film } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  if (isLoading || user) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen flex items-center justify-center">
        <Image
            src="https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg"
            alt="Background"
            fill
            className="object-cover z-0"
            data-ai-hint="dark cinematic background"
        />
        <div className="absolute inset-0 bg-black/60 z-10" />

        <Link href="/" className="absolute top-6 left-6 z-20 flex items-center gap-2">
            <Film className="size-10 text-primary" />
            <h1 className="font-headline text-3xl font-bold text-primary tracking-wider">LBFC</h1>
        </Link>
        
        <Card className="w-full max-w-md z-20 bg-black/75 backdrop-blur-sm border-white/20 text-white">
            <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline">Sign In</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <Button onClick={handleLogin} className="w-full h-12 bg-primary hover:bg-primary/90 text-lg font-semibold" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Sign in with Google'}
                </Button>
                <p className="text-xs text-neutral-400 text-center">
                    This page is protected by Google reCAPTCHA to ensure you're not a bot.
                </p>
            </CardContent>
        </Card>
    </div>
  );
}
