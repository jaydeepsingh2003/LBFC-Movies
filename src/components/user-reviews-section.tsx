
'use client';

import { useFirestore } from '@/firebase';
import { useUser } from '@/firebase/auth/auth-client';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { Loader2, Star, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ReviewForm } from './review-form';
import type { UserReview } from '@/firebase/firestore/reviews';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


export function UserReviewsSection({ movieId }: { movieId: number }) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const reviewsRef = firestore ? collection(firestore, `movies/${movieId}/reviews`) : null;
  const reviewsQuery = reviewsRef ? query(reviewsRef, orderBy('createdAt', 'desc')) : null;
  const [reviewsSnapshot, loading, error] = useCollection(reviewsQuery);

  const handleDelete = async (reviewId: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, `movies/${movieId}/reviews`, reviewId));
      toast({ title: "Review deleted successfully."});
    } catch (err) {
      console.error("Error deleting review: ", err);
      toast({ variant: "destructive", title: "Failed to delete review."});
    }
  }

  const renderReviews = () => {
    if (loading) {
      return (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }

    if (error) {
      return <p className="text-destructive">Error loading reviews: {error.message}</p>;
    }

    if (reviewsSnapshot?.empty) {
      return <p className="text-muted-foreground text-center py-8">Be the first to write a review!</p>;
    }

    return (
      <div className="space-y-4">
        {reviewsSnapshot?.docs.map((doc) => {
          const review = { id: doc.id, ...doc.data() } as UserReview & { id: string };
          const isOwner = user?.uid === review.userId;
          
          return (
            <Card key={review.id} className="bg-secondary/50">
              <CardHeader className="flex-row justify-between items-start">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={review.photoURL} alt={review.displayName} />
                    <AvatarFallback>{review.displayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{review.displayName}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <span>{review.rating}/10</span>
                        </div>
                        <span>&bull;</span>
                        <span>
                            {review.createdAt ? formatDistanceToNow(review.createdAt.toDate(), { addSuffix: true }) : 'just now'}
                        </span>
                    </div>
                  </div>
                </div>
                {isOwner && (
                   <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your review.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(review.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-foreground/90">{review.content}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <section className="space-y-6 pt-8">
      <h2 className="font-headline text-2xl font-bold">User Reviews</h2>
      <ReviewForm movieId={movieId} onReviewSubmit={() => {}} />
      <div className="pt-4">{renderReviews()}</div>
    </section>
  );
}
