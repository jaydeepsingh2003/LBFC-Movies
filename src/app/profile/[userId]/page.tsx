
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useFirestore } from '@/firebase';
import { doc, getDoc, collection, getDocs, onSnapshot } from 'firebase/firestore';
import { useUser } from '@/firebase/auth/auth-client';
import { Loader2, Film, Users, UserCheck, Activity, LayoutGrid, BarChart3, ChevronLeft, Globe, UserPlus, ShieldCheck } from 'lucide-react';
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

      // Real-time listener for following/followers to update metrics instantly
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
      <div className="flex flex-col justify-center items-center h-svh gap-6 bg-background">
        <div className="relative">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="absolute inset-0 blur-2xl bg-primary/20 rounded-full animate-pulse" />
        </div>
        <p className="text-muted-foreground font-black tracking-[0.4em] uppercase text-[10px] animate-pulse">Decrypting Identity Vault...</p>
      </div>
    );
  }

  if (!userProfile) return <div className="text-center py-20 font-headline text-2xl font-bold">Profile signal lost.</div>;

  return (
    <div className="min-h-screen bg-background space-y-0">
      {/* Premium Cinematic Header */}
      <div className="relative h-[55vh] w-full overflow-hidden">
        {headerBackdrop && (
            <Image 
                src={headerBackdrop} 
                alt="Backdrop" 
                fill 
                className="object-cover opacity-40 blur-[2px] scale-105" 
                priority 
                unoptimized
            />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        <div className="content-container relative h-full flex flex-col items-center justify-center pt-12">
            <div className="relative group mb-6">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                <Avatar className="h-32 w-32 md:h-44 md:w-44 border-4 border-primary shadow-2xl relative z-10 transition-transform group-hover:scale-105">
                    <AvatarImage src={userProfile.photoURL} alt={userProfile.displayName} className="object-cover" />
                    <AvatarFallback className="bg-secondary text-primary font-black text-4xl">{userProfile.displayName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 right-4 z-20">
                    <Badge className="bg-primary text-white font-black uppercase text-[10px] px-3 py-1 shadow-xl">Architect</Badge>
                </div>
            </div>

            <div className="text-center space-y-4 relative z-10">
                <h1 className="font-headline text-4xl md:text-6xl font-black tracking-tighter text-white uppercase drop-shadow-2xl">
                    {userProfile.displayName || 'Cinema Enthusiast'}
                </h1>
                <div className="flex flex-col items-center gap-4">
                    <Badge variant="outline" className="border-white/10 text-muted-foreground text-[10px] font-black uppercase tracking-widest px-4 py-1 backdrop-blur-md">
                        {userProfile.email}
                    </Badge>
                    
                    {!isOwnProfile && (
                        <Button 
                            onClick={handleFollowToggle}
                            variant={isFollowing ? "secondary" : "default"}
                            className={cn(
                                "h-14 px-10 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] transition-all",
                                !isFollowing && "bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30"
                            )}
                        >
                            {isFollowing ? <UserCheck className="mr-2 size-4" /> : <UserPlus className="mr-2 size-4" />}
                            {isFollowing ? "Linked" : "Establish Connection"}
                        </Button>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* Metric Pod Tier */}
      <div className="content-container -mt-16 relative z-30 pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {[
                  { label: 'Followers', value: followers.length, icon: Users, color: 'text-blue-400' },
                  { label: 'Following', value: following.length, icon: UserCheck, color: 'text-purple-400' },
                  { label: 'Saved Cinema', value: savedMovies.length, icon: Film, color: 'text-primary' }
              ].map((stat) => (
                  <div key={stat.label} className="glass-panel p-6 rounded-[2rem] border-white/5 flex items-center justify-between group hover:border-white/20 transition-all hover:-translate-y-1 shadow-2xl">
                      <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">{stat.label}</p>
                          <p className="text-3xl font-black text-white">{stat.value}</p>
                      </div>
                      <div className={cn("p-3 rounded-2xl bg-white/5", stat.color)}>
                          <stat.icon className="size-6" />
                      </div>
                  </div>
              ))}
          </div>
      </div>

      {/* Content Tabs Tier */}
      <div className="content-container">
          <Tabs defaultValue="archive" className="w-full space-y-12">
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 border-b border-white/5 pb-8">
                  <TabsList className="bg-secondary/40 p-1 rounded-2xl h-14 w-full md:w-[700px]">
                      <TabsTrigger value="archive" className="rounded-xl h-full flex-1 data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest transition-all">
                        <LayoutGrid className="mr-2 size-4"/>Personal Archive
                      </TabsTrigger>
                      <TabsTrigger value="intelligence" className="rounded-xl h-full flex-1 data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest transition-all">
                        <BarChart3 className="mr-2 size-4"/>Cinematic Intelligence
                      </TabsTrigger>
                      <TabsTrigger value="network" className="rounded-xl h-full flex-1 data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest transition-all">
                        <Globe className="mr-2 size-4"/>Social Network
                      </TabsTrigger>
                  </TabsList>
              </div>

              <TabsContent value="archive" className="mt-0">
                  <div className="space-y-8">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                              <Film className="size-6 text-primary" />
                          </div>
                          <h2 className="font-headline text-3xl font-black tracking-tighter uppercase text-white">Vault <span className="text-primary">Selections</span></h2>
                      </div>
                      
                      {savedMovies.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-6">
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
                        <div className="text-center py-32 glass-panel rounded-[3rem] border-2 border-dashed border-white/5">
                            <Film className="mx-auto size-16 text-muted-foreground/20 mb-6" />
                            <h3 className="text-2xl font-bold text-white tracking-tight uppercase">Archive Empty</h3>
                            <p className="mt-2 text-muted-foreground font-medium uppercase text-[10px] tracking-widest">No saved transmissions detected in this vault.</p>
                        </div>
                      )}
                  </div>
              </TabsContent>

              <TabsContent value="intelligence" className="mt-0">
                  <div className="space-y-12">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-400/10 rounded-lg border border-blue-400/20">
                              <Activity className="size-6 text-blue-400" />
                          </div>
                          <h2 className="font-headline text-3xl font-black tracking-tighter uppercase text-white">Viewing <span className="text-blue-400">Metrics</span></h2>
                      </div>
                      <UserStats userId={userId} />
                  </div>
              </TabsContent>

              <TabsContent value="network" className="mt-0">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                      {/* Following Column */}
                      <section className="space-y-8">
                          <div className="flex items-center justify-between border-b border-white/5 pb-4">
                              <div className="flex items-center gap-3">
                                  <div className="p-2 bg-purple-500/10 rounded-lg"><UserCheck className="size-5 text-purple-500" /></div>
                                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Following ({following.length})</h3>
                              </div>
                          </div>
                          <div className="space-y-4">
                              {following.length > 0 ? following.map(person => (
                                  <Link href={`/profile/${person.uid}`} key={person.uid} className="flex items-center justify-between p-4 glass-panel rounded-2xl hover:bg-white/5 transition-all group">
                                      <div className="flex items-center gap-4">
                                          <Avatar className="size-12 border border-white/10 group-hover:border-purple-500/50 transition-all">
                                              <AvatarImage src={person.photoURL} alt={person.displayName} className="object-cover" />
                                              <AvatarFallback className="bg-secondary text-primary font-bold">{person.displayName?.charAt(0)}</AvatarFallback>
                                          </Avatar>
                                          <div>
                                              <p className="font-bold text-white group-hover:text-purple-400 transition-colors leading-none uppercase tracking-tighter">{person.displayName}</p>
                                              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1.5">Architect</p>
                                          </div>
                                      </div>
                                      <ChevronLeft className="size-4 text-muted-foreground/30 rotate-180" />
                                  </Link>
                              )) : (
                                  <div className="p-10 text-center glass-panel rounded-2xl border border-dashed border-white/5">
                                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Not tracking any architects.</p>
                                  </div>
                              )}
                          </div>
                      </section>

                      {/* Followers Column */}
                      <section className="space-y-8">
                          <div className="flex items-center justify-between border-b border-white/5 pb-4">
                              <div className="flex items-center gap-3">
                                  <div className="p-2 bg-blue-400/10 rounded-lg"><Users className="size-5 text-blue-400" /></div>
                                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Followers ({followers.length})</h3>
                              </div>
                          </div>
                          <div className="space-y-4">
                              {followers.length > 0 ? followers.map(person => (
                                  <Link href={`/profile/${person.uid}`} key={person.uid} className="flex items-center justify-between p-4 glass-panel rounded-2xl hover:bg-white/5 transition-all group">
                                      <div className="flex items-center gap-4">
                                          <Avatar className="size-12 border border-white/10 group-hover:border-blue-400/50 transition-all">
                                              <AvatarImage src={person.photoURL} alt={person.displayName} className="object-cover" />
                                              <AvatarFallback className="bg-secondary text-primary font-bold">{person.displayName?.charAt(0)}</AvatarFallback>
                                          </Avatar>
                                          <div>
                                              <p className="font-bold text-white group-hover:text-blue-400 transition-colors leading-none uppercase tracking-tighter">{person.displayName}</p>
                                              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1.5">Architect</p>
                                          </div>
                                      </div>
                                      <ChevronLeft className="size-4 text-muted-foreground/30 rotate-180" />
                                  </Link>
                              )) : (
                                  <div className="p-10 text-center glass-panel rounded-2xl border border-dashed border-white/5">
                                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No nodes tracking this vault.</p>
                                  </div>
                              )}
                          </div>
                      </section>
                  </div>
              </TabsContent>
          </Tabs>
      </div>
    </div>
  );
}
