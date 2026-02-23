'use client';

import { useEffect, useState } from 'react';
import { useUser, loginWithGoogle, signInWithEmail, signUpWithEmail, logout, resetPassword } from '@/firebase/auth/auth-client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ShieldCheck, Mail, Info, ArrowRight, Lock, User } from 'lucide-react';
import Image from 'next/image';
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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
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
        toast({ variant: 'destructive', title: "Fields Required", description: "Please fill in all fields." });
        return;
    }

    if (isSignUp) {
        if (!fullName) {
            toast({ variant: 'destructive', title: "Name Required", description: "Please enter your full name." });
            return;
        }
        if (password !== confirmPassword) {
            toast({ variant: 'destructive', title: "Passwords Mismatch", description: "Passwords do not match." });
            return;
        }
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, fullName);
        toast({ 
            title: "Account Created", 
            description: "Please check your email to verify your account." 
        });
      } else {
        await signInWithEmail(email, password);
        toast({ title: "Welcome Back", description: "Signed in successfully." });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: error.message || 'Please check your details and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        variant: 'destructive',
        title: "Email Required",
        description: "Please enter your email address to reset your password.",
      });
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(email);
      toast({
        title: "Email Sent",
        description: "Check your inbox for password reset instructions.",
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: "Error",
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
      toast({ title: "Success", description: "Signed in with Google." });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Google sign in was unsuccessful.',
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
        toast({ title: "Verified", description: "Account verified. Redirecting..." });
        router.push('/');
      } else {
        toast({ title: "Not Verified", description: "Please click the link in your email." });
      }
    } catch (error) {
      console.error("Reload failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex justify-center items-center h-svh bg-[#0B0B0F]">
        <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="absolute inset-0 blur-2xl bg-primary/20 rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  // Verification Screen
  if (user && !user.emailVerified) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-y-auto">
        <div className="fixed top-0 left-0 w-full h-[100lvh] z-0 pointer-events-none bg-[#0B0B0F]">
            <Image src={bgImageUrl} alt="Backdrop" fill className="object-cover blur-md opacity-40" priority unoptimized />
            <div className="absolute inset-0 bg-black/80" />
        </div>
        
        <Card className="w-full max-w-md z-20 bg-black/90 backdrop-blur-3xl border-white/10 text-white shadow-2xl rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden my-8 animate-in zoom-in-95 duration-500">
            <CardHeader className="text-center pt-10 sm:pt-12 pb-6 sm:pb-8 space-y-4 sm:space-y-6">
              <div className="mx-auto size-16 sm:size-20 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                <Mail className="size-8 sm:size-10 text-primary" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-xl sm:text-2xl font-headline font-black uppercase tracking-tight">Verify Your Email</CardTitle>
                <p className="text-muted-foreground text-[9px] sm:text-[10px] uppercase tracking-widest font-bold">Verification Pending</p>
              </div>
              <div className="space-y-3 px-2 sm:px-6">
                <p className="text-muted-foreground text-xs sm:text-sm font-medium">
                  We've sent a verification link to <br/><span className="text-white font-bold">{user.email}</span>.
                </p>
                <div className="flex items-center justify-center gap-2 text-yellow-500/80 bg-yellow-500/5 py-2.5 px-4 rounded-xl border border-yellow-500/10">
                    <Info className="size-3.5 shrink-0" />
                    <span className="text-[9px] font-bold uppercase tracking-wider leading-tight text-left">Check your spam folder if you don't see it.</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pb-10 sm:pb-12 px-6 sm:px-8">
              <Button onClick={handleReloadStatus} disabled={isLoading} className="w-full h-12 sm:h-14 bg-white text-black hover:bg-white/90 font-black uppercase tracking-widest text-[10px] sm:text-xs rounded-xl transition-all group">
                {isLoading ? <Loader2 className="size-5 animate-spin" /> : (
                    <>
                        I have verified <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                    </>
                )}
              </Button>
              
              <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-2">
                <Button onClick={() => sendEmailVerification(user)} variant="outline" disabled={isLoading} className="h-10 sm:h-12 border-white/5 bg-white/5 hover:bg-white/10 font-black uppercase text-[9px] sm:text-[10px] tracking-widest rounded-xl">
                  Resend Email
                </Button>
                <Button onClick={() => logout()} variant="outline" className="h-10 sm:h-12 border-white/5 bg-white/5 hover:bg-white/10 font-black uppercase text-[9px] sm:text-[10px] tracking-widest rounded-xl">
                  Sign Out
                </Button>
              </div>
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-8 overflow-x-hidden overflow-y-auto">
        {/* Fixed Backdrop System - Locked to Largest Viewport Height to prevent shifting */}
        <div className="fixed top-0 left-0 w-full h-[100lvh] z-0 pointer-events-none bg-[#0B0B0F]">
            <Image src={bgImageUrl} alt="Backdrop" fill className="object-cover opacity-50" priority unoptimized />
            <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-black/70 to-black/90" />
        </div>
        
        {/* Scrollable Content Container */}
        <div className="relative z-20 w-full max-w-md flex flex-col items-center py-12">
            {/* Top Branding Section */}
            <div className="text-center space-y-1 mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
                <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter uppercase">
                    CINE<span className="text-primary">V</span>EXIA
                </h1>
                <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-muted-foreground">
                    Where Movies Come Alive
                </p>
            </div>
            
            <Card className="w-full bg-black/80 backdrop-blur-2xl border-white/5 text-white shadow-[0_30px_60px_rgba(0,0,0,0.8)] rounded-[2.5rem] overflow-hidden animate-in zoom-in-95 duration-700 mb-12">
                <CardHeader className="text-center pt-8 sm:pt-10 pb-4 sm:pb-6 space-y-1">
                  <CardTitle className="text-2xl sm:text-3xl font-headline font-black tracking-tight uppercase">
                    {isSignUp ? 'Sign Up' : 'Sign In'}
                  </CardTitle>
                  <div className="flex items-center justify-center gap-2 text-primary/60">
                    <ShieldCheck className="size-3 sm:size-3.5" />
                    <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest">Secure Entry</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-5 sm:space-y-6 pb-8 sm:pb-10 px-6 sm:px-10">
                  <form onSubmit={handleAuthAction} className="space-y-3.5 sm:space-y-4">
                      {isSignUp && (
                        <div className="space-y-1 sm:space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-300">
                            <Label htmlFor="fullName" className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 size-3.5 sm:size-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                                <Input 
                                    id="fullName" 
                                    type="text" 
                                    placeholder="Enter your name" 
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    disabled={isLoading}
                                    className="bg-white/[0.03] border-white/5 h-11 sm:h-12 pl-11 sm:pl-12 rounded-xl focus:ring-primary/20 focus:border-primary/50 transition-all font-bold text-sm"
                                />
                            </div>
                        </div>
                      )}
                      <div className="space-y-1 sm:space-y-1.5">
                          <Label htmlFor="email" className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email</Label>
                          <div className="relative group">
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-3.5 sm:size-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                              <Input 
                                  id="email" 
                                  type="email" 
                                  placeholder="name@example.com" 
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  disabled={isLoading}
                                  className="bg-white/[0.03] border-white/5 h-11 sm:h-12 pl-11 sm:pl-12 rounded-xl focus:ring-primary/20 focus:border-primary/50 transition-all font-bold text-sm"
                              />
                          </div>
                      </div>
                      <div className="space-y-1 sm:space-y-1.5">
                          <div className="flex items-center justify-between ml-1">
                            <Label htmlFor="password" id="password-label" className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground">Password</Label>
                            {!isSignUp && (
                              <button 
                                type="button" 
                                onClick={handleForgotPassword}
                                className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-primary hover:underline transition-colors"
                                disabled={isLoading}
                              >
                                Forgot?
                              </button>
                            )}
                          </div>
                          <div className="relative group">
                              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-3.5 sm:size-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                              <Input 
                                  id="password" 
                                  type="password" 
                                  placeholder="••••••••"
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)} 
                                  disabled={isLoading}
                                  className="bg-white/[0.03] border-white/5 h-11 sm:h-12 pl-11 sm:pl-12 rounded-xl focus:ring-primary/20 focus:border-primary/50 transition-all font-bold text-sm"
                              />
                          </div>
                      </div>
                      {isSignUp && (
                        <div className="space-y-1 sm:space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-300">
                            <Label htmlFor="confirmPassword" className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Confirm Password</Label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-3.5 sm:size-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                                <Input 
                                    id="confirmPassword" 
                                    type="password" 
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)} 
                                    disabled={isLoading}
                                    className="bg-white/[0.03] border-white/5 h-11 sm:h-12 pl-11 sm:pl-12 rounded-xl focus:ring-primary/20 focus:border-primary/50 transition-all font-bold text-sm"
                                />
                            </div>
                        </div>
                      )}
                      <Button type="submit" className="w-full h-12 sm:h-14 bg-primary hover:bg-primary/90 text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-xl transition-all rounded-xl mt-3 sm:mt-4" disabled={isLoading}>
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (isSignUp ? 'Create Account' : 'Sign In')}
                      </Button>
                  </form>
                  
                  <div className="relative py-1.5 sm:py-2">
                      <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-white/5" />
                      </div>
                      <div className="relative flex justify-center text-[8px] sm:text-[9px] font-black uppercase tracking-widest">
                          <span className="bg-black px-4 py-1 text-muted-foreground rounded-full border border-white/5">
                              Or
                          </span>
                      </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                      <Button onClick={handleGoogleLogin} variant="outline" className="w-full h-11 sm:h-12 bg-white/[0.03] border-white/5 hover:bg-white/5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-xl transition-all" disabled={isLoading}>
                          <div className="flex items-center justify-center gap-3">
                            <svg className="size-3.5 sm:size-4" viewBox="0 0 24 24">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                          </div>
                      </Button>
                      
                      <div className="text-center pt-1.5 sm:pt-2">
                        <button 
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setPassword('');
                                setConfirmPassword('');
                                setFullName('');
                            }} 
                            className="text-[9px] sm:text-[10px] text-muted-foreground hover:text-white transition-colors font-bold uppercase tracking-widest flex items-center justify-center gap-2 mx-auto group"
                        >
                            {isSignUp ? (
                                <>Already have an account? <span className="text-primary font-black">Sign In</span></>
                            ) : (
                                <>New to CINEVEXIA? <span className="text-primary font-black">Sign Up</span></>
                            )}
                        </button>
                      </div>
                  </div>
                </CardContent>
            </Card>

            {/* Footer Section */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 opacity-30 text-[7px] sm:text-[8px] font-black uppercase tracking-widest pb-8">
                <span className="hover:opacity-100 transition-opacity cursor-pointer">Privacy</span>
                <span className="hover:opacity-100 transition-opacity cursor-pointer">Terms</span>
                <span className="hover:opacity-100 transition-opacity cursor-pointer">Support</span>
                <span className="hover:opacity-100 transition-opacity cursor-pointer">Cookie Policy</span>
            </div>
        </div>
    </div>
  );
}
