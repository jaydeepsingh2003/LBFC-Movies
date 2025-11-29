'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { useFirestore } from '@/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { Loader2, Film } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MovieCard } from '@/components/movie-card';
import { getPosterUrl } from '@/lib/tmdb.client';
import { Separator } from '@/components/ui/separator';

interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
}

interface SavedMovie {
  id: number;
  title: string;
  poster_path: string | null;
  overview: string;
}

export default function ProfilePage({ params }: { params: { userId: string } }) {
  const firestore = useFirestore();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [savedMovies, setSavedMovies] = useState<SavedMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userId } = params;

  useEffect(() => {
    if (!firestore || !userId) return;

    async function fetchProfileData() {
      setIsLoading(true);
      try {
        // Fetch user profile
        const userDocRef = doc(firestore, 'users', userId as string);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
        } else {
          console.error("No such user!");
        }

        // Fetch saved movies
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
      <AppLayout>
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-32 w-32 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!userProfile) {
    return (
      <AppLayout>
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold">User not found</h2>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showSidebar={false}>
      <div className="p-4 sm:p-6 md:p-8 space-y-8">
        <header className="flex flex-col items-center text-center space-y-4">
          <Avatar className="h-24 w-24 border-4 border-primary">
            <AvatarImage src={userProfile.photoURL} alt={userProfile.displayName} />
            <AvatarFallback>{userProfile.displayName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">{userProfile.displayName}</h1>
            <p className="text-muted-foreground">{userProfile.email}</p>
          </div>
        </header>

        <Separator />

        <section>
          <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground mb-6">Saved Movies</h2>
          {savedMovies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
            <div className="text-center py-16 border-2 border-dashed border-secondary rounded-lg">
                <Film className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">No Saved Movies</h3>
                <p className="mt-2 text-sm text-muted-foreground">This user hasn't saved any movies yet.</p>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
