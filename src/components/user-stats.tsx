'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFirestore } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { getMovieDetails } from '@/lib/tmdb.client';
import type { MovieDetails } from '@/lib/tmdb';
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { ChartTooltipContent } from '@/components/ui/chart';

interface UserStatsProps {
  userId: string;
}

interface RatedMovie {
  id: number;
  rating: number;
  details?: MovieDetails;
}

export function UserStats({ userId }: UserStatsProps) {
  const firestore = useFirestore();
  const [ratedMovies, setRatedMovies] = useState<RatedMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firestore || !userId) return;

    async function fetchUserRatings() {
      setIsLoading(true);
      try {
        const ratingsCollectionRef = collection(firestore, `users/${userId}/ratings`);
        const ratingsSnapshot = await getDocs(ratingsCollectionRef);
        
        const ratingsData = ratingsSnapshot.docs.map(doc => ({
          id: parseInt(doc.id),
          rating: doc.data().rating as number,
        }));

        const detailedMoviesPromises = ratingsData.map(async (ratedMovie) => {
            try {
                const details = await getMovieDetails(ratedMovie.id);
                return { ...ratedMovie, details };
            } catch (error) {
                console.warn(`Could not fetch details for movie ID ${ratedMovie.id}`, error);
                return { ...ratedMovie, details: undefined };
            }
        });

        const settledMovies = await Promise.all(detailedMoviesPromises);
        const validMovies = settledMovies.filter(m => m.details !== undefined) as Required<RatedMovie>[];
        
        setRatedMovies(validMovies);

      } catch (error) {
        console.error("Error fetching user ratings:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserRatings();
  }, [firestore, userId]);
  
  const stats = useMemo(() => {
    if (ratedMovies.length === 0) return null;

    const genreCounts: { [key: string]: number } = {};
    const decadeRatings: { [key: string]: { totalRating: number; count: number } } = {};
    const ratingDistribution: { [key: number]: number } = {};

    ratedMovies.forEach(movie => {
        if (!movie.details) return;

        // Genre counts
        movie.details.genres.forEach(genre => {
            genreCounts[genre.name] = (genreCounts[genre.name] || 0) + 1;
        });

        // Decade ratings
        if (movie.details.release_date) {
            const year = new Date(movie.details.release_date).getFullYear();
            const decade = Math.floor(year / 10) * 10;
            if (!decadeRatings[decade]) {
                decadeRatings[decade] = { totalRating: 0, count: 0 };
            }
            decadeRatings[decade].totalRating += movie.rating;
            decadeRatings[decade].count += 1;
        }

        // Rating distribution
        const userRating = Math.round(movie.rating);
        ratingDistribution[userRating] = (ratingDistribution[userRating] || 0) + 1;
    });
    
    const genreData = Object.entries(genreCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const decadeData = Object.entries(decadeRatings)
      .map(([decade, { totalRating, count }]) => ({
        decade: `${decade}s`,
        averageRating: parseFloat((totalRating / count).toFixed(2)),
      }))
      .sort((a, b) => parseInt(a.decade) - parseInt(b.decade));

    const ratingData = Object.entries(ratingDistribution)
        .map(([rating, count]) => ({ rating: `${rating} Star`, count }))
        .sort((a, b) => parseInt(a.rating) - parseInt(b.rating));


    return { genreData, decadeData, ratingData };
  }, [ratedMovies]);


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) {
    return (
        <Card className="text-center py-12">
            <CardContent>
                <p className="text-muted-foreground">No rating data available to generate stats.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <div className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>Favorite Genres</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.genreData}>
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            cursor={{ fill: 'hsl(var(--secondary))' }}
                            content={<ChartTooltipContent />}
                        />
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Ratings by Decade</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stats.decadeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="decade" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={[0, 10]} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="averageRating" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Rating Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                 <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.ratingData}>
                        <XAxis dataKey="rating" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            cursor={{ fill: 'hsl(var(--secondary))' }}
                            content={<ChartTooltipContent />}
                        />
                        <Bar dataKey="count" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    </div>
  );
}
