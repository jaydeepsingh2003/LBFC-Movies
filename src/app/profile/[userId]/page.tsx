'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useFirestore } from '@/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { Loader2, Film, Users, UserCheck, Activity, LayoutGrid, BarChart3, ChevronLeft, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MovieCard } from '@/components/movie-card';
import { getPosterUrl, getBackdropUrl, getTrendingMovies } from '@/lib/tmdb.client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserStats } from '@/components/user-stats';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { cn } from '@/lib/utils';

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
  const firestore = useFirestore();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [savedMovies, setSavedMovies] = useState<SavedMovie[]>([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [headerBackdrop, setHeaderBackdrop] = useState<string | null>(null);

  useEffect(() => {
    if (!firestore || !userId) return;

    async function fetchProfileData() {
      setIsLoading(true);
      try {
        const userDocRef = doc(firestore, 'users', userId);
        const [userDoc, followersSnapshot, followingSnapshot, trending] = await Promise.all([
          getDoc(userDocRef),
          getDocs(collection(firestore, `users/${userId}/followers`)),
          getDocs(collection(firestore, `users/${userId}/following`)),
          getTrendingMovies('week')
        ]);
        
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
        }

        if (trending && trending.length > 0) {
            setHeaderBackdrop(getBackdropUrl(trending[0].backdrop_path));
        }

        setFollowers(followersSnapshot.size);
        setFollowing(followingSnapshot.size);

        const moviesCollectionRef = collection(firestore, `users/${userId}/savedMovies`);
        const movieSnapshot = await getDocs(moviesCollectionRef);
        const moviesList = movieSnapshot.docs.map(doc => doc.data() as SavedMovie);
        setSavedMovies(moviesList);
        
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfileData();
  }, [firestore, userId]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-svh gap-6 bg-background">
        <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <div className="absolute inset-0 blur-2xl bg-primary/20 rounded-full animate-pulse" />
        </div>
        <p className="text-muted-foreground font-black tracking-widest uppercase text-xs animate-pulse">Decrypting Identity Vault...</p>
      </div>
    );
  }

  if (!userProfile) return <div className="text-center py-20 font-headline text-2xl font-bold">Profile signal lost.</div>;

  return (
    <div className="min-h-screen bg-background space-y-0">
      {/* Premium Cinematic Header */}
      <div className="relative h-[45vh] w-full overflow-hidden">
        {headerBackdrop && (
            <Image 
                src={headerBackdrop} 
                alt="Backdrop" 
                fill 
                className="object-cover opacity-40 blur-sm scale-105" 
                priority 
                unoptimized
            />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        <div className="content-container relative h-full flex flex-col items-center justify-center pt-12">
            <div className="relative group mb-6">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                <Avatar className="h-32 w-32 md:h-44 md:w-44 border-4 border-primary shadow-2xl relative z-10">
                    <AvatarImage src={userProfile.photoURL} alt={userProfile.displayName} className="object-cover" />
                    <AvatarFallback className="bg-secondary text-primary font-black text-4xl">{userProfile.displayName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 right-4 z-20">
                    <Badge className="bg-primary text-white font-black uppercase text-[10px] px-3 py-1 shadow-xl">Architect</Badge>
                </div>
            </div>

            <div className="text-center space-y-2 relative z-10">
                <h1 className="font-headline text-4xl md:text-6xl font-black tracking-tighter text-white uppercase drop-shadow-2xl">
                    {userProfile.displayName || 'Cinema Enthusiast'}
                </h1>
                <div className="flex items-center justify-center gap-3">
                    <Badge variant="outline" className="border-white/10 text-muted-foreground text-[10px] font-black uppercase tracking-widest px-4 py-1 backdrop-blur-md">
                        {userProfile.email}
                    </Badge>
                </div>
            </div>
        </div>
      </div>

      {/* Metric Pod Tier */}
      <div className="content-container -mt-16 relative z-30 pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {[
                  { label: 'Followers', value: followers, icon: Users, color: 'text-blue-400' },
                  { label: 'Following', value: following, icon: UserCheck, color: 'text-purple-400' },
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
                  <TabsList className="bg-secondary/40 p-1 rounded-2xl h-14 w-full md:w-[500px]">
                      <TabsTrigger value="archive" className="rounded-xl h-full flex-1 data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest transition-all">
                        <LayoutGrid className="mr-2 size-4"/>Personal Archive
                      </TabsTrigger>
                      <TabsTrigger value="intelligence" className="rounded-xl h-full flex-1 data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest transition-all">
                        <BarChart3 className="mr-2 size-4"/>Cinematic Intelligence
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
          </Tabs>
      </div>
    </div>
  );
}
