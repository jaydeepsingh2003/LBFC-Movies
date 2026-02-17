'use client';

import { useEffect, useState, useRef } from 'react';
import { useUser, loginWithGoogle, signInWithEmail, signUpWithEmail, syncUserProfile } from '@/firebase/auth/auth-client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Film, ShieldCheck, Smartphone } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getAuth, RecaptchaVerifier, PhoneAuthProvider, PhoneMultiFactorGenerator, getMultiFactorResolver } from 'firebase/auth';

export default function LoginPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // MFA States
  const [showMfa, setShowMfa] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [resolver, setResolver] = useState<any>(null);
  const [verificationId, setVerificationId] = useState('');
  const recaptchaRef = useRef<any>(null);

  useEffect(() => {
    if (user && !showMfa) {
      router.push('/');
    }
  }, [user, router, showMfa]);

  const handleMfaFlow = async (error: any) => {
    if (error.code === 'auth/multi-factor-auth-required') {
      setIsLoading(true);
      try {
        const auth = getAuth();
        const mfaResolver = getMultiFactorResolver(auth, error);
        const phoneHint = mfaResolver.hints[0];

        if (!recaptchaRef.current) {
          recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
          });
        }

        const phoneAuthProvider = new PhoneAuthProvider(auth);
        const vId = await phoneAuthProvider.verifyPhoneNumber(phoneHint, recaptchaRef.current);
        
        setVerificationId(vId);
        setResolver(mfaResolver);
        setShowMfa(true);
        toast({ title: "MFA Required", description: "A verification code has been sent to your registered phone." });
      } catch (mfaError: any) {
        console.error("MFA Initialization failed", mfaError);
        toast({ variant: "destructive", title: "MFA Error", description: "Could not initialize multi-factor verification." });
      } finally {
        setIsLoading(false);
      }
    } else {
      throw error;
    }
  };

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
        toast({ title: "Account created!", description: "You've been signed in to the Vault." });
      } else {
        await signInWithEmail(email, password);
      }
    } catch (error: any) {
      if (error.code === 'auth/multi-factor-auth-required') {
        await handleMfaFlow(error);
      } else {
        console.error('Authentication failed', error);
        toast({
          variant: 'destructive',
          title: 'Authentication Failed',
          description: error.message || 'Please check your credentials and try again.',
        });
      }
    } finally {
      if (!showMfa) setIsLoading(false);
    }
  };

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const cred = PhoneAuthProvider.credential(verificationId, mfaCode);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
      const result = await resolver.resolveSignIn(multiFactorAssertion);
      
      if (result.user) {
        await syncUserProfile(result.user);
        toast({ title: "Identity Verified", description: "Welcome back to the Vault." });
        router.push('/');
      }
    } catch (error: any) {
      console.error("MFA verification failed", error);
      toast({ variant: 'destructive', title: "Verification Failed", description: "Invalid code. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch (error: any) {
      if (error.code === 'auth/multi-factor-auth-required') {
        await handleMfaFlow(error);
      } else {
        console.error('Login failed', error);
        toast({
          variant: 'destructive',
          title: 'Google Sign-In Failed',
          description: 'Could not sign in with Google. Please try again.',
        });
      }
    } finally {
      if (!showMfa) setIsLoading(false);
    }
  };

  if (isUserLoading || (user && !showMfa)) {
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
        
        {/* Necessary for Firebase Phone Auth */}
        <div id="recaptcha-container"></div>

        <Link href="/" className="absolute top-6 left-6 z-20 flex items-center gap-2">
            <Film className="size-10 text-primary" />
            <h1 className="font-headline text-3xl font-bold text-primary tracking-wider uppercase">LBFC</h1>
        </Link>
        
        <Card className="w-full max-w-md z-20 bg-black/80 backdrop-blur-md border-white/20 text-white shadow-2xl overflow-hidden rounded-[2rem]">
            <CardHeader className="text-center pt-10">
              <CardTitle className="text-3xl font-headline tracking-tighter uppercase">
                {showMfa ? 'Secure Access' : (isSignUp ? 'Create Account' : 'Sign In')}
              </CardTitle>
              {showMfa && (
                <div className="flex items-center justify-center gap-2 text-primary mt-2">
                  <ShieldCheck className="size-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Double Verification Active</span>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6 pb-10">
              {showMfa ? (
                <form onSubmit={handleMfaVerify} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex flex-col items-center justify-center p-6 bg-primary/5 rounded-2xl border border-primary/20 border-dashed mb-4">
                    <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <Smartphone className="size-6 text-primary" />
                    </div>
                    <p className="text-xs text-center text-muted-foreground font-medium">Enter the 6-digit verification code sent via SMS to verify your identity.</p>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="mfaCode">Verification Code</Label>
                      <Input 
                          id="mfaCode" 
                          type="text" 
                          placeholder="000000" 
                          value={mfaCode}
                          onChange={(e) => setMfaCode(e.target.value)}
                          disabled={isLoading}
                          className="bg-neutral-800 border-neutral-700 h-14 text-center text-2xl font-black tracking-[0.5em] focus:ring-primary/20"
                          maxLength={6}
                      />
                  </div>
                  <Button type="submit" className="w-full h-14 bg-primary hover:bg-primary/90 text-lg font-black uppercase tracking-widest" disabled={isLoading || mfaCode.length < 6}>
                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Verify & Enter Vault'}
                  </Button>
                  <Button variant="ghost" className="w-full text-xs text-muted-foreground hover:text-white" onClick={() => setShowMfa(false)} disabled={isLoading}>
                    Cancel Verification
                  </Button>
                </form>
              ) : (
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
                            className="bg-neutral-800/50 border-white/10 h-12"
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
                            className="bg-neutral-800/50 border-white/10 h-12"
                        />
                    </div>
                    <Button type="submit" className="w-full h-14 bg-primary hover:bg-primary/90 text-lg font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]" disabled={isLoading}>
                      {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (isSignUp ? 'Join the Vault' : 'Sign In')}
                    </Button>
                </form>
              )}
              
              {!isSignUp && !showMfa && (
                <>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-neutral-700" />
                        </div>
                        <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                            <span className="bg-black px-4 text-neutral-500">
                                Global Gateway
                            </span>
                        </div>
                    </div>

                    <Button onClick={handleGoogleLogin} variant="outline" className="w-full h-14 bg-transparent border-white/10 hover:bg-neutral-800 text-sm font-bold tracking-tight rounded-xl" disabled={isLoading}>
                        <div className="flex items-center justify-center gap-3">
                          <svg className="size-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                          </svg>
                          Sign in with Google
                        </div>
                    </Button>
                </>
              )}
              
              {!showMfa && (
                <p className="text-xs text-neutral-500 text-center font-bold uppercase tracking-widest">
                  {isSignUp ? "Already a Member?" : "New to the Studio?"}{' '}
                  <button onClick={() => setIsSignUp(!isSignUp)} className="text-primary hover:underline ml-1">
                    {isSignUp ? "Sign in." : "Join Now."}
                  </button>
                </p>
              )}
            </CardContent>
        </Card>
    </div>
  );
}
