
'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase/auth/auth-client';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { setMovieRating, getMovieRating } from '@/firebase/firestore/ratings';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { doc } from 'firebase/firestore';

interface MovieRatingProps {
  movieId: number;
}

export function MovieRating({ movieId }: MovieRatingProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const ratingRef = user && firestore ? doc(firestore, `users/${user.uid}/ratings/${movieId}`) : null;
  const [ratingDoc, loading] = useDocumentData(ratingRef);
  
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  
  const userRating = ratingDoc?.rating;

  const handleRating = async (rating: number) => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Please log in',
        description: 'You need to be logged in to rate movies.',
      });
      return;
    }
    try {
      await setMovieRating(firestore, user.uid, movieId, rating);
      toast({
        title: 'Rating Saved!',
        description: `You rated this movie ${rating} out of 10.`,
      });
    } catch (error) {
      console.error('Error setting rating:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not save your rating. Please try again.',
      });
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[...Array(10)].map((_, i) => {
        const ratingValue = i + 1;
        return (
          <Star
            key={ratingValue}
            className={cn(
              'w-5 h-5 cursor-pointer transition-colors',
              ratingValue <= (hoverRating || userRating || 0)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-400/50'
            )}
            onClick={() => handleRating(ratingValue)}
            onMouseEnter={() => setHoverRating(ratingValue)}
            onMouseLeave={() => setHoverRating(null)}
          />
        );
      })}
    </div>
  );
}
