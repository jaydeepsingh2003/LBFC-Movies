
'use client';

import { useState } from 'react';
import { useUser } from '@/firebase/auth/auth-client';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';
import { addMovieReview } from '@/firebase/firestore/reviews';
import { MovieRating } from './movie-rating';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { doc } from 'firebase/firestore';

interface ReviewFormProps {
  movieId: number;
  onReviewSubmit: () => void;
}

export function ReviewForm({ movieId, onReviewSubmit }: ReviewFormProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const ratingRef = user && firestore ? doc(firestore, `users/${user.uid}/ratings/${movieId}`) : null;
  const [ratingDoc] = useDocumentData(ratingRef);
  
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const userRating = ratingDoc?.rating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'You must be logged in to post a review.' });
      return;
    }
    if (!content.trim()) {
      toast({ variant: 'destructive', title: 'Review cannot be empty.' });
      return;
    }
    if (!userRating) {
        toast({ variant: 'destructive', title: 'Please select a rating first.' });
        return;
    }

    setIsLoading(true);
    try {
      await addMovieReview(firestore, movieId, {
        userId: user.uid,
        displayName: user.displayName || 'Anonymous',
        photoURL: user.photoURL || '',
        content: content,
        rating: userRating
      });
      setContent('');
      toast({ title: 'Review posted!', description: 'Thank you for your feedback.' });
      onReviewSubmit();
    } catch (error) {
      console.error('Failed to post review', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not post your review.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center text-muted-foreground p-4 bg-secondary rounded-lg">
        Please log in to write a review.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h4 className="text-sm font-medium mb-2">Your Rating</h4>
        <MovieRating movieId={movieId} />
      </div>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share your thoughts on the movie..."
        className="min-h-[100px]"
        disabled={isLoading}
      />
      <Button type="submit" disabled={isLoading || !content.trim() || !userRating}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
        Post Review
      </Button>
    </form>
  );
}
