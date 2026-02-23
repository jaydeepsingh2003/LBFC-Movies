'use client';

import { useEffect, useState } from 'react';
import { useUser, loginWithGoogle, signInWithEmail, signUpWithEmail, logout, resetPassword } from '@/firebase/auth/auth-client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ShieldCheck, Mail, RefreshCcw, LogOut, Info, ArrowRight, Lock, UserPlus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getTrendingMovies, getBackdropUrl } from '@/lib/tmdb.client';
import { sendEmailVerification, getAuth } from 'firebase/auth';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [bgImageUrl, setBgImageUrl] = useState('https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg');

  useEffect(() => {
    if (user && user.emailVerified) {
      router.push('/');
    }
  }, [user, router]);

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
    if (!email || !password) {
        toast({ variant: 'destructive', title: "Fields Required", description: "Identity credentials must be complete." });
        return;
    }
    setIsLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
        toast({ 
            title: "Verification Dispatched", 
            description: "A link has been sent to activate your membership." 
        });
      } else {
        await signInWithEmail(email, password);
        toast({ title: "Welcome Back", description: "Secure link established." });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: error.message || 'Please verify your credentials.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        variant: 'destructive',
        title: "Email Missing",
        description: "Enter your registered address to reset your vault access.",
      });
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(email);
      toast({
        title: "Recovery Dispatched",
        description: "Check your inbox for the reset link.",
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: "Transmission Failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      toast({ title: "Authorized", description: "Access granted via Global Gateway." });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Auth Failed',
        description: 'Google authentication was interrupted.',
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
      const auth = getAuth();
      const updatedUser = auth.currentUser;
      
      if (updatedUser?.emailVerified) {
        toast({ title: "Identity Confirmed", description: "Redirecting to main studio." });
        router.push('/');
      } else {
        toast({ title: "Status: Pending", description: "Link not yet activated." });
      }
    } catch (error) {
      console.error("Reload failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#0B0B0F]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (user && !user.emailVerified) {
    return (
      <div className="relative h-screen w-screen flex items-center justify-center p-4">
        <Image src={bgImageUrl} alt="Cinematic Backdrop" fill className="object-cover z-0 blur-md opacity-40 scale-110" priority unoptimized />
        <div className="absolute inset-0 bg-black/80 z-10" />
        
        <Card className="w-full max-w-md z-20 bg-black/90 backdrop-blur-3xl border-white/10 text-white shadow-[0_0_100px_rgba(0,0,0,0.8)] rounded-[3rem] overflow-hidden">
            <CardHeader className="text-center pt-16 pb-10 space-y-6">
              <div className="mx-auto size-24 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 animate-pulse">
                <Mail className="size-12 text-primary" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-3xl font-headline font-black tracking-tighter uppercase">Activate Membership</CardTitle>
                <p className="text-muted-foreground text-xs uppercase tracking-widest font-bold">Verification Pending</p>
              </div>
              <div className="space-y-3 px-8">
                <p className="text-muted-foreground text-sm font-medium">
                  We've sent an encrypted link to <span className="text-white font-bold">{user.email}</span>.
                </p>
                <div className="flex items-center justify-center gap-2 text-yellow-500/80 bg-yellow-500/5 py-3 px-4 rounded-2xl border border-yellow-500/10">
                    <Info className="size-4 shrink-0" />
                    <span className="text-[10px] font-black uppercase tracking-wider leading-tight text-left">Check your Spam or Junk folder if the link doesn't arrive.</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pb-16 px-10">
              <Button onClick={handleReloadStatus} disabled={isLoading} className="w-full h-16 bg-white text-black hover:bg-white/90 font-black uppercase tracking-[0.2em] text-xs rounded-2xl transition-all shadow-2xl group">
                {isLoading ? <Loader2 className="size-5 animate-spin" /> : (
                    <>
                        Check Status <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                    </>
                )}
              </Button>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <Button onClick={() => sendEmailVerification(user)} variant="outline" disabled={isLoading} className="h-14 border-white/5 bg-white/5 hover:bg-white/10 font-black uppercase text-[10px] tracking-widest rounded-2xl">
                  Resend
                </Button>
                <Button onClick={() => logout()} variant="outline" className="h-14 border-white/5 bg-white/5 hover:bg-white/10 font-black uppercase text-[10px] tracking-widest rounded-2xl">
                  Sign Out
                </Button>
              </div>
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen flex items-center justify-center p-4 overflow-hidden">
        <Image src={bgImageUrl} alt="Cinematic Backdrop" fill className="object-cover z-0 transition-opacity duration-1000 animate-in fade-in zoom-in-105" priority unoptimized />
        <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-black/70 to-black/90 z-10" />
        
        {/* Top Branding */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-20 text-center space-y-2">
            <h1 className="font-headline text-4xl md:text-5xl font-black text-white tracking-tighter uppercase">
                CINE<span className="text-primary">V</span>EXIA
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground">
                Where Movies Come Alive
            </p>
        </div>
        
        <Card className="w-full max-w-md z-20 bg-black/80 backdrop-blur-2xl border-white/5 text-white shadow-[0_50px_100px_rgba(0,0,0,0.9)] rounded-[3.5rem] overflow-hidden">
            <CardHeader className="text-center pt-14 pb-8 space-y-2">
              <CardTitle className="text-4xl font-headline font-black tracking-tighter uppercase">
                {isSignUp ? 'Create Vault' : 'Sign In'}
              </CardTitle>
              <div className="flex items-center justify-center gap-2 text-primary/60">
                <ShieldCheck className="size-4" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em]">Encrypted Session</span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-8 pb-14 px-10">
              <form onSubmit={handleAuthAction} className="space-y-5">
                  <div className="space-y-2.5">
                      <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Archive Address</Label>
                      <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                          <Input 
                              id="email" 
                              type="email" 
                              placeholder="name@cinevexia.com" 
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              disabled={isLoading}
                              className="bg-white/[0.03] border-white/5 h-14 pl-12 rounded-2xl focus:ring-primary/20 focus:border-primary/50 transition-all font-bold"
                          />
                      </div>
                  </div>
                  <div className="space-y-2.5">
                      <div className="flex items-center justify-between ml-1">
                        <Label htmlFor="password" id="password-label" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Access Key</Label>
                        {!isSignUp && (
                          <button 
                            type="button" 
                            onClick={handleForgotPassword}
                            className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline hover:text-primary/80 transition-colors"
                            disabled={isLoading}
                          >
                            Reset?
                          </button>
                        )}
                      </div>
                      <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                          <Input 
                              id="password" 
                              type="password" 
                              placeholder="••••••••"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)} 
                              disabled={isLoading}
                              className="bg-white/[0.03] border-white/5 h-14 pl-12 rounded-2xl focus:ring-primary/20 focus:border-primary/50 transition-all font-bold"
                          />
                      </div>
                  </div>
                  <Button type="submit" className="w-full h-16 bg-primary hover:bg-primary/90 text-sm font-black uppercase tracking-[0.2em] shadow-[0_15px_30px_rgba(229,9,20,0.3)] transition-all hover:scale-[1.02] active:scale-95 rounded-2xl" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (isSignUp ? 'Activate Account' : 'Access Vault')}
                  </Button>
              </form>
              
              <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/5" />
                  </div>
                  <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.4em]">
                      <span className="bg-[#0a0a0a]/80 px-6 py-1 rounded-full text-muted-foreground backdrop-blur-md">
                          Global Gateway
                      </span>
                  </div>
              </div>

              <div className="space-y-6">
                  <Button onClick={handleGoogleLogin} variant="outline" className="w-full h-16 bg-white/[0.03] border-white/5 hover:bg-white/5 text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all" disabled={isLoading}>
                      <div className="flex items-center justify-center gap-4">
                        <svg className="size-5" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Sign in with Google
                      </div>
                  </Button>
                  
                  <div className="text-center">
                    <button 
                        onClick={() => setIsSignUp(!isSignUp)} 
                        className="text-[10px] text-muted-foreground hover:text-white transition-colors font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 mx-auto group"
                    >
                        {isSignUp ? (
                            <>Existing Member? <span className="text-primary group-hover:underline">Sign In</span></>
                        ) : (
                            <>New to CINEVEXIA? <span className="text-primary group-hover:underline">Join Now</span></>
                        )}
                    </button>
                  </div>
              </div>
            </CardContent>
        </Card>

        {/* Footer info */}
        <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center gap-8 opacity-30 text-[8px] font-black uppercase tracking-[0.3em]">
            <span className="cursor-help hover:opacity-100 transition-opacity">Privacy Shield</span>
            <span className="cursor-help hover:opacity-100 transition-opacity">Terms of Entry</span>
            <span className="cursor-help hover:opacity-100 transition-opacity">Node Status: Active</span>
        </div>
    </div>
  );
}
