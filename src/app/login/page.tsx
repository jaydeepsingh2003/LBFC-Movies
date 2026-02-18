'use client';

import { useEffect, useState } from 'react';
import { useUser, loginWithGoogle, signInWithEmail, signUpWithEmail, logout } from '@/firebase/auth/auth-client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Film, ShieldCheck, Mail, RefreshCcw, LogOut } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getTrendingMovies, getBackdropUrl } from '@/lib/tmdb.client';
import { sendEmailVerification } from 'firebase/auth';

export default function LoginPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [bgImageUrl, setBgImageUrl] = useState('https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg');

  // Strict Redirect: Only if verified
  useEffect(() => {
    if (user && user.emailVerified) {
      router.push('/');
    }
  }, [user, router]);

  // Dynamic Backdrop Sync
  useEffect(() => {
    async function fetchBackdrop() {
      try {
        const trending = await getTrendingMovies('day');
        if (trending && trending.length > 0) {
          const randomIndex = Math.floor(Math.random() * Math.min(10, trending.length));
          const backdrop = getBackdropUrl(trending[randomIndex].backdrop_path);
          if (backdrop) setBgImageUrl(backdrop);
        }
      } catch (error) {
        console.error("Login backdrop fetch failed", error);
      }
    }
    fetchBackdrop();
  }, []);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
        toast({ 
            title: "Verification Sent", 
            description: "Check your inbox to activate your cinematic identity." 
        });
      } else {
        await signInWithEmail(email, password);
        toast({ title: "Authorized", description: "Secure link established." });
      }
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
      toast({ title: "Authorized", description: "Access granted via Google." });
    } catch (error: any) {
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

  const handleReloadStatus = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await user.reload();
      if (user.emailVerified) {
        toast({ title: "Identity Verified", description: "Welcome to the studio." });
        router.push('/');
      } else {
        toast({ title: "Verification Pending", description: "Please check your email and click the confirmation link." });
      }
    } catch (error) {
      console.error("Reload failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await sendEmailVerification(user);
      toast({ title: "Link Dispatched", description: "A new verification email has been sent." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Limit Exceeded", description: "Please wait a moment before requesting another link." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast({ title: "Session Terminated" });
  };

  if (isUserLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  // Verification Pending Screen
  if (user && !user.emailVerified) {
    return (
      <div className="relative h-screen w-screen flex items-center justify-center p-4">
        <Image src={bgImageUrl} alt="Background" fill className="object-cover z-0 blur-sm opacity-50" priority unoptimized />
        <div className="absolute inset-0 bg-black/80 z-10" />
        
        <Card className="w-full max-w-md z-20 bg-black/90 backdrop-blur-xl border-white/10 text-white shadow-2xl rounded-[2.5rem] overflow-hidden animate-in zoom-in-95 duration-500">
            <CardHeader className="text-center pt-12 pb-6 space-y-4">
              <div className="mx-auto size-20 bg-primary/10 rounded-full flex items-center justify-center border border-primary/30 animate-pulse">
                <Mail className="size-10 text-primary" />
              </div>
              <CardTitle className="text-3xl font-headline font-black tracking-tighter uppercase">Verification Required</CardTitle>
              <p className="text-muted-foreground text-sm font-medium px-6">
                A confirmation link has been sent to <span className="text-white font-bold">{user.email}</span>. Please verify your identity to access the studio.
              </p>
            </CardHeader>
            <CardContent className="space-y-4 pb-12 px-8">
              <Button onClick={handleReloadStatus} disabled={isLoading} className="w-full h-14 bg-white text-black hover:bg-white/90 font-black uppercase tracking-widest rounded-xl transition-all shadow-xl">
                {isLoading ? <Loader2 className="size-5 animate-spin" /> : <RefreshCcw className="mr-2 size-5" />}
                Check Verification Status
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={handleResendVerification} variant="outline" disabled={isLoading} className="h-12 border-white/5 bg-white/5 hover:bg-white/10 font-black uppercase text-[10px] tracking-widest rounded-xl">
                  Resend Link
                </Button>
                <Button onClick={handleLogout} variant="outline" className="h-12 border-white/5 bg-white/5 hover:bg-white/10 font-black uppercase text-[10px] tracking-widest rounded-xl">
                  <LogOut className="mr-2 size-4" /> Sign Out
                </Button>
              </div>

              <div className="pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-primary/60">
                <ShieldCheck className="size-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Secure Session: ID-{user.uid.slice(0, 8)}</span>
              </div>
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen flex items-center justify-center p-4">
        <Image src={bgImageUrl} alt="Background" fill className="object-cover z-0 transition-opacity duration-1000 animate-in fade-in" priority unoptimized />
        <div className="absolute inset-0 bg-black/75 z-10" />
        
        <Link href="/" className="absolute top-6 left-6 z-20 flex items-center gap-2 group">
            <div className="p-2 bg-primary rounded-xl group-hover:scale-110 transition-transform shadow-xl shadow-primary/20">
                <Film className="size-6 text-white" />
            </div>
            <h1 className="font-headline text-3xl font-black text-white tracking-tighter uppercase">LBFC</h1>
        </Link>
        
        <Card className="w-full max-w-md z-20 bg-black/80 backdrop-blur-md border-white/10 text-white shadow-2xl overflow-hidden rounded-[2.5rem]">
            <CardHeader className="text-center pt-10 pb-6">
              <CardTitle className="text-4xl font-headline font-black tracking-tighter uppercase">
                {isSignUp ? 'Create Account' : 'Sign In'}
              </CardTitle>
              <div className="flex items-center justify-center gap-2 text-primary/60 mt-2">
                <ShieldCheck className="size-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Secure Entry Required</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pb-10">
              <form onSubmit={handleAuthAction} className="space-y-4">
                  <div className="space-y-2">
                      <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
                      <Input 
                          id="email" 
                          type="email" 
                          placeholder="name@example.com" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isLoading}
                          className="bg-white/5 border-white/5 h-12 rounded-xl focus:ring-primary/20 focus:border-primary/50 transition-all"
                      />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="password" id="password-label" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Password</Label>
                      <Input 
                          id="password" 
                          type="password" 
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)} 
                          disabled={isLoading}
                          className="bg-white/5 border-white/5 h-12 rounded-xl focus:ring-primary/20 focus:border-primary/50 transition-all"
                      />
                  </div>
                  <Button type="submit" className="w-full h-14 bg-primary hover:bg-primary/90 text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 rounded-xl" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (isSignUp ? 'Join the Vault' : 'Enter the Vault')}
                  </Button>
              </form>
              
              <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/5" />
                  </div>
                  <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                      <span className="bg-[#0a0a0a] px-4 text-muted-foreground">
                          Global Gateway
                      </span>
                  </div>
              </div>

              <Button onClick={handleGoogleLogin} variant="outline" className="w-full h-14 bg-transparent border-white/5 hover:bg-white/5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all" disabled={isLoading}>
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
              
              <p className="text-[10px] text-muted-foreground text-center font-black uppercase tracking-[0.2em]">
                {isSignUp ? "Already a Member?" : "New to the Studio?"}{' '}
                <button onClick={() => setIsSignUp(!isSignUp)} className="text-primary hover:underline ml-1">
                  {isSignUp ? "Sign in." : "Join Now."}
                </button>
              </p>
            </CardContent>
        </Card>
    </div>
  );
}
