
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useFirestore } from '@/firebase';
import { doc, getDoc, collection, getDocs, onSnapshot } from 'firebase/firestore';
import { useUser } from '@/firebase/auth/auth-client';
import { Loader2, Film, Users, UserCheck, Activity, LayoutGrid, BarChart3, ChevronLeft, Globe, UserPlus, ShieldCheck, Mail } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MovieCard } from '@/components/movie-card';
import { getPosterUrl, getBackdropUrl, getTrendingMovies } from '@/lib/tmdb.client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserStats } from '@/components/user-stats';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { followUser, unfollowUser } from '@/firebase/firestore/social';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  lastLogin?: any;
}

interface SavedMovie {
  id: number;
  title: string;
  poster_path: string | null;
  overview: string;
}

export default function ProfilePage(props: { params: Promise<{ userId: string }> }) {
  const { userId } = React.use(props.params);
  const { user: currentUser } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [savedMovies, setSavedMovies] = useState<SavedMovie[]>([]);
  const [followers, setFollowers] = useState<UserProfile[]>([]);
  const [following, setFollowing] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [headerBackdrop, setHeaderBackdrop] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  const isOwnProfile = currentUser?.uid === userId;

  const fetchProfileData = useCallback(async () => {
    if (!firestore || !userId) return;

    setIsLoading(true);
    try {
      const userDocRef = doc(firestore, 'users', userId);
      const [userDoc, trending] = await Promise.all([
        getDoc(userDocRef),
        getTrendingMovies('week')
      ]);
      
      if (userDoc.exists()) {
        setUserProfile(userDoc.data() as UserProfile);
      }

      if (trending && trending.length > 0) {
          setHeaderBackdrop(getBackdropUrl(trending[Math.floor(Math.random() * 5)].backdrop_path));
      }

      // Fetch saved movies
      const moviesCollectionRef = collection(firestore, `users/${userId}/savedMovies`);
      const movieSnapshot = await getDocs(moviesCollectionRef);
      setSavedMovies(movieSnapshot.docs.map(doc => doc.data() as SavedMovie));

      // Real-time listener for following/followers
      const followersRef = collection(firestore, `users/${userId}/followers`);
      const followingRef = collection(firestore, `users/${userId}/following`);

      onSnapshot(followersRef, async (snapshot) => {
          const list = await Promise.all(snapshot.docs.map(async (d) => {
              const uDoc = await getDoc(doc(firestore, 'users', d.id));
              return uDoc.data() as UserProfile;
          }));
          setFollowers(list.filter(Boolean));
          if (currentUser) {
              setIsFollowing(snapshot.docs.some(d => d.id === currentUser.uid));
          }
      });

      onSnapshot(followingRef, async (snapshot) => {
          const list = await Promise.all(snapshot.docs.map(async (d) => {
              const uDoc = await getDoc(doc(firestore, 'users', d.id));
              return uDoc.data() as UserProfile;
          }));
          setFollowing(list.filter(Boolean));
      });
      
    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [firestore, userId, currentUser]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleFollowToggle = async () => {
    if (!currentUser || !firestore || isOwnProfile) return;
    try {
        if (isFollowing) {
            await unfollowUser(firestore, currentUser.uid, userId);
            toast({ title: "Secure Link Severed" });
        } else {
            await followUser(firestore, currentUser.uid, userId);
            toast({ title: "Connection Established" });
        }
    } catch (error) {
        console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-svh gap-6 bg-transparent">
        <div className="relative">
            <div className="h-10 w-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-0 blur-2xl bg-primary/20 rounded-full animate-pulse" />
        </div>
        <p className="text-muted-foreground font-black tracking-[0.4em] uppercase text-[10px] animate-pulse">Decrypting Identity Vault...</p>
      </div>
    );
  }

  if (!userProfile) return <div className="text-center py-20 font-headline text-2xl font-black uppercase text-white">Identity Lost</div>;

  return (
    <div className="min-h-screen bg-transparent pb-20 overflow-x-hidden">
      {/* Dynamic Master Backdrop Tier */}
      <div className="relative h-[45vh] md:h-[65vh] w-full overflow-hidden">
        {headerBackdrop && (
            <Image 
                src={headerBackdrop} 
                alt="Backdrop" 
                fill 
                className="object-cover opacity-40 blur-[1px] scale-105 transition-transform duration-[2000ms]" 
                priority 
                unoptimized
            />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-black/40" />
        
        <div className="relative h-full flex flex-col items-center justify-center pt-16 px-4">
            <div className="relative group mb-6">
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-3xl animate-pulse group-hover:bg-primary/50 transition-all" />
                <Avatar className="h-28 w-28 md:h-44 md:w-44 border-4 border-primary shadow-[0_0_50px_rgba(225,29,72,0.4)] relative z-10 transition-all duration-500 group-hover:scale-105 active:scale-95">
                    <AvatarImage src={userProfile.photoURL} alt={userProfile.displayName} className="object-cover" />
                    <AvatarFallback className="bg-secondary text-primary font-black text-3xl md:text-5xl">{userProfile.displayName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 right-2 md:right-4 z-20">
                    <Badge className="bg-primary text-white font-black uppercase text-[8px] md:text-[10px] px-3 py-1 shadow-2xl border border-white/10">Architect</Badge>
                </div>
            </div>

            <div className="text-center space-y-4 relative z-10 w-full max-w-2xl">
                <div className="space-y-1">
                    <h1 className="font-headline text-3xl md:text-7xl font-black tracking-tighter text-white uppercase drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)] leading-none truncate px-4">
                        {userProfile.displayName || 'Cinema Architect'}
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground/60">
                        <Mail className="size-3" />
                        <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em]">{userProfile.email}</span>
                    </div>
                </div>
                
                {!isOwnProfile && (
                    <Button 
                        onClick={handleFollowToggle}
                        variant={isFollowing ? "secondary" : "default"}
                        className={cn(
                            "h-12 md:h-14 px-8 md:px-12 rounded-xl font-black uppercase tracking-[0.2em] text-[9px] md:text-[10px] transition-all active:scale-95",
                            !isFollowing && "bg-primary hover:bg-primary/90 shadow-[0_15px_30px_rgba(225,29,72,0.3)]"
                        )}
                    >
                        {isFollowing ? <UserCheck className="mr-2 size-4" /> : <UserPlus className="mr-2 size-4" />}
                        {isFollowing ? "Secure Link Active" : "Establish Connection"}
                    </Button>
                )}
            </div>
        </div>
      </div>

      <div className="max-w-[2000px] mx-auto px-4 md:px-8 lg:px-12">
          {/* Architectural Intelligence Pods */}
          <div className="-mt-12 md:-mt-20 relative z-30 mb-12">
              <div className="grid grid-cols-3 gap-2 md:gap-6 max-w-4xl mx-auto">
                  {[
                      { label: 'Followers', value: followers.length, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                      { label: 'Following', value: following.length, icon: UserCheck, color: 'text-purple-400', bg: 'bg-purple-400/10' },
                      { label: 'Saved', value: savedMovies.length, icon: Film, color: 'text-primary', bg: 'bg-primary/10' }
                  ].map((stat) => (
                      <div key={stat.label} className="glass-panel p-3 md:p-8 rounded-2xl md:rounded-[2.5rem] border-white/5 flex flex-col md:flex-row items-center md:justify-between gap-3 group hover:border-white/20 transition-all hover:-translate-y-1 shadow-2xl">
                          <div className="text-center md:text-left space-y-0.5 md:space-y-1">
                              <p className="text-[7px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-muted-foreground group-hover:text-white transition-colors">{stat.label}</p>
                              <p className="text-xl md:text-4xl font-black text-white leading-none">{stat.value}</p>
                          </div>
                          <div className={cn("p-2 md:p-4 rounded-xl md:rounded-2xl transition-all group-hover:scale-110 shadow-inner", stat.bg, stat.color)}>
                              <stat.icon className="size-4 md:size-7" />
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          {/* Master Content Tabs */}
          <Tabs defaultValue="archive" className="w-full space-y-10 md:space-y-16">
              <div className="flex items-center justify-center border-b border-white/5 pb-6 md:pb-10">
                  <TabsList className="bg-secondary/40 p-1.5 rounded-2xl h-14 md:h-18 w-full md:w-[800px] border border-white/5 backdrop-blur-xl shadow-2xl">
                      <TabsTrigger value="archive" className="rounded-xl h-full flex-1 data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[8px] md:text-[11px] uppercase tracking-widest transition-all">
                        <LayoutGrid className="mr-2 size-3 md:size-4"/>Archive
                      </TabsTrigger>
                      <TabsTrigger value="intelligence" className="rounded-xl h-full flex-1 data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[8px] md:text-[11px] uppercase tracking-widest transition-all">
                        <BarChart3 className="mr-2 size-3 md:size-4"/>Intelligence
                      </TabsTrigger>
                      <TabsTrigger value="network" className="rounded-xl h-full flex-1 data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[8px] md:text-[11px] uppercase tracking-widest transition-all">
                        <Globe className="mr-2 size-3 md:size-4"/>Network
                      </TabsTrigger>
                  </TabsList>
              </div>

              <TabsContent value="archive" className="mt-0 animate-in fade-in duration-700 outline-none">
                  <div className="space-y-10">
                      <div className="flex items-center gap-4">
                          <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 shadow-2xl">
                              <Film className="size-6 md:size-8 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <h2 className="font-headline text-2xl md:text-5xl font-black tracking-tighter uppercase text-white mb-0">Vault <span className="text-primary">Selections</span></h2>
                            <p className="text-[9px] md:text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-60">Verified cinematic transmissions saved to this node.</p>
                          </div>
                      </div>
                      
                      {savedMovies.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 md:gap-8">
                          {savedMovies.map(movie => (
                            <MovieCard
                              key={movie.id}
                              id={movie.id}
                              title={movie.title}
                              posterUrl={getPosterUrl(movie.poster_path)}
                              overview={movie.overview}
                              poster_path={movie.poster_path}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-32 md:py-48 glass-panel rounded-[3rem] border-2 border-dashed border-white/5 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity blur-3xl" />
                            <Film className="mx-auto size-16 md:size-24 text-muted-foreground/10 mb-8 group-hover:text-primary transition-all duration-700" />
                            <h3 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase">Vault Empty</h3>
                            <p className="mt-4 text-muted-foreground font-medium uppercase text-[10px] md:text-xs tracking-[0.4em] opacity-60">No cinematic data found in this archive.</p>
                        </div>
                      )}
                  </div>
              </TabsContent>

              <TabsContent value="intelligence" className="mt-0 animate-in fade-in duration-700 outline-none">
                  <div className="space-y-12">
                      <div className="flex items-center gap-4">
                          <div className="p-3 bg-blue-400/10 rounded-2xl border border-blue-400/20 shadow-2xl">
                              <Activity className="size-6 md:size-8 text-blue-400" />
                          </div>
                          <div className="space-y-1">
                            <h2 className="font-headline text-2xl md:text-5xl font-black tracking-tighter uppercase text-white mb-0">Viewing <span className="text-blue-400">Metrics</span></h2>
                            <p className="text-[9px] md:text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-60">Architectural analysis of your cinematic viewing patterns.</p>
                          </div>
                      </div>
                      <div className="glass-panel p-4 md:p-12 rounded-[2rem] md:rounded-[4rem] border-white/5 shadow-2xl">
                        <UserStats userId={userId} />
                      </div>
                  </div>
              </TabsContent>

              <TabsContent value="network" className="mt-0 animate-in fade-in duration-700 outline-none">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 md:gap-12">
                      {/* Following Column */}
                      <section className="space-y-8">
                          <div className="flex items-center justify-between border-b border-white/5 pb-6">
                              <div className="flex items-center gap-4">
                                  <div className="p-3 bg-purple-500/10 rounded-2xl"><UserCheck className="size-6 text-purple-500" /></div>
                                  <h3 className="text-sm md:text-lg font-black uppercase tracking-widest text-white">Following ({following.length})</h3>
                              </div>
                          </div>
                          <div className="space-y-4">
                              {following.length > 0 ? following.map(person => (
                                  <Link href={`/profile/${person.uid}`} key={person.uid} className="flex items-center justify-between p-4 md:p-6 glass-panel rounded-2xl md:rounded-3xl hover:bg-white/5 transition-all group border border-transparent hover:border-purple-500/20 active:scale-98">
                                      <div className="flex items-center gap-4">
                                          <Avatar className="size-12 md:size-16 border-2 border-white/10 group-hover:border-purple-500/50 transition-all shadow-xl">
                                              <AvatarImage src={person.photoURL} alt={person.displayName} className="object-cover" />
                                              <AvatarFallback className="bg-secondary text-primary font-bold">{person.displayName?.charAt(0)}</AvatarFallback>
                                          </Avatar>
                                          <div className="space-y-1">
                                              <p className="font-black text-sm md:text-xl text-white group-hover:text-purple-400 transition-colors leading-none uppercase tracking-tighter">{person.displayName || 'Architect'}</p>
                                              <p className="text-[8px] md:text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Verified curator</p>
                                          </div>
                                      </div>
                                      <div className="p-2 bg-white/5 rounded-xl group-hover:bg-purple-500 transition-all">
                                        <ChevronLeft className="size-4 text-white rotate-180" />
                                      </div>
                                  </Link>
                              )) : (
                                  <div className="p-12 text-center glass-panel rounded-3xl border-2 border-dashed border-white/5">
                                      <Users className="mx-auto size-10 text-muted-foreground/10 mb-4" />
                                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Not tracking any curators.</p>
                                  </div>
                              )}
                          </div>
                      </section>

                      {/* Followers Column */}
                      <section className="space-y-8">
                          <div className="flex items-center justify-between border-b border-white/5 pb-6">
                              <div className="flex items-center gap-4">
                                  <div className="p-3 bg-blue-400/10 rounded-2xl"><Users className="size-6 text-blue-400" /></div>
                                  <h3 className="text-sm md:text-lg font-black uppercase tracking-widest text-white">Followers ({followers.length})</h3>
                              </div>
                          </div>
                          <div className="space-y-4">
                              {followers.length > 0 ? followers.map(person => (
                                  <Link href={`/profile/${person.uid}`} key={person.uid} className="flex items-center justify-between p-4 md:p-6 glass-panel rounded-2xl md:rounded-3xl hover:bg-white/5 transition-all group border border-transparent hover:border-blue-400/20 active:scale-98">
                                      <div className="flex items-center gap-4">
                                          <Avatar className="size-12 md:size-16 border-2 border-white/10 group-hover:border-blue-400/50 transition-all shadow-xl">
                                              <AvatarImage src={person.photoURL} alt={person.displayName} className="object-cover" />
                                              <AvatarFallback className="bg-secondary text-primary font-bold">{person.displayName?.charAt(0)}</AvatarFallback>
                                          </Avatar>
                                          <div className="space-y-1">
                                              <p className="font-black text-sm md:text-xl text-white group-hover:text-blue-400 transition-colors leading-none uppercase tracking-tighter">{person.displayName || 'Architect'}</p>
                                              <p className="text-[8px] md:text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Verified curator</p>
                                          </div>
                                      </div>
                                      <div className="p-2 bg-white/5 rounded-xl group-hover:bg-blue-400 transition-all">
                                        <ChevronLeft className="size-4 text-white rotate-180" />
                                      </div>
                                  </Link>
                              )) : (
                                  <div className="p-12 text-center glass-panel rounded-3xl border-2 border-dashed border-white/5">
                                      <Users className="mx-auto size-10 text-muted-foreground/10 mb-4" />
                                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">No nodes tracking this vault.</p>
                                  </div>
                              )}
                          </div>
                      </section>
                  </div>
              </TabsContent>
          </Tabs>
      </div>

      <footer className="mt-20 pt-12 border-t border-white/5 flex flex-col items-center gap-4 opacity-30">
          <div className="flex items-center gap-3">
              <ShieldCheck className="size-4 text-primary" />
              <span className="text-[8px] font-black uppercase tracking-[0.5em] text-white">Identity Dossier End-to-End Encrypted</span>
          </div>
      </footer>
    </div>
  );
}
