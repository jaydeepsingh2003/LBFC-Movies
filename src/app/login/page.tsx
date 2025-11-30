
'use client';

import { useEffect, useState } from 'react';
import { useUser, loginWithGoogle, signInWithEmail, signUpWithEmail } from '@/firebase/auth/auth-client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Film } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

export default function LoginPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);


  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
        toast({ title: "Account created!", description: "You've been signed in." });
      } else {
        await signInWithEmail(email, password);
      }
      // The useEffect will handle the redirect on user state change.
    } catch (error: any) {
      console.error('Authentication failed', error);
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: error.message || 'Please check your credentials and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Login failed', error);
      toast({
        variant: 'destructive',
        title: 'Google Sign-In Failed',
        description: 'Could not sign in with Google. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isUserLoading || user) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen flex items-center justify-center p-4">
        <Image
            src="https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg"
            alt="Background"
            fill
            className="object-cover z-0"
            data-ai-hint="dark cinematic background"
        />
        <div className="absolute inset-0 bg-black/70 z-10" />

        <Link href="/" className="absolute top-6 left-6 z-20 flex items-center gap-2">
            <Film className="size-10 text-primary" />
            <h1 className="font-headline text-3xl font-bold text-primary tracking-wider">LBFC</h1>
        </Link>
        
        <Card className="w-full max-w-md z-20 bg-black/80 backdrop-blur-sm border-white/20 text-white">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-headline">{isSignUp ? 'Create an Account' : 'Sign In'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleAuthAction} className="space-y-4">
                  <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                          id="email" 
                          type="email" 
                          placeholder="name@example.com" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isLoading}
                          className="bg-neutral-700 border-neutral-600 placeholder:text-neutral-400"
                      />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input 
                          id="password" 
                          type="password" 
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)} 
                          disabled={isLoading}
                          className="bg-neutral-700 border-neutral-600 placeholder:text-neutral-400"
                      />
                  </div>
                  <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 text-lg font-semibold" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (isSignUp ? 'Sign Up' : 'Sign In')}
                  </Button>
              </form>
              
              {!isSignUp && (
                <>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-neutral-600" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-black/80 px-2 text-neutral-400">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <Button onClick={handleGoogleLogin} variant="outline" className="w-full h-12 bg-transparent border-neutral-600 hover:bg-neutral-800 text-base font-semibold" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Sign in with Google'}
                    </Button>
                </>
              )}
              
              <p className="text-sm text-neutral-400 text-center">
                {isSignUp ? "Already have an account?" : "New to LBFC?"}{' '}
                <button onClick={() => setIsSignUp(!isSignUp)} className="font-semibold text-white hover:underline">
                  {isSignUp ? "Sign in now." : "Sign up now."}
                </button>
              </p>
            </CardContent>
        </Card>
    </div>
  );
}
