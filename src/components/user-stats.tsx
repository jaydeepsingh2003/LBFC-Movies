'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFirestore } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { getMovieDetails } from '@/lib/tmdb.client';
import type { MovieDetails } from '@/lib/tmdb';
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, TrendingUp, History, PieChart } from 'lucide-react';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

interface UserStatsProps {
  userId: string;
}

interface RatedMovie {
  id: number;
  rating: number;
  details?: MovieDetails;
}

const chartConfig = {
  count: {
    label: "Movies",
    color: "hsl(var(--primary))",
  },
  averageRating: {
    label: "Avg. Rating",
    color: "hsl(var(--primary))",
  }
} satisfies ChartConfig;

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
        .map(([rating, count]) => ({ rating: `${rating} ★`, count }))
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
        <Card className="text-center py-20 bg-secondary/10 border-white/5 rounded-[2rem]">
            <CardContent>
                <PieChart className="mx-auto size-12 text-muted-foreground/20 mb-4" />
                <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">No rating intelligence available.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pb-20">
        <Card className="glass-panel border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-8">
                <div className="space-y-1">
                    <CardTitle className="text-xl font-black uppercase tracking-tight text-white">Genre Affinity</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold tracking-widest">Distribution of cinematic categories</CardDescription>
                </div>
                <div className="p-2 bg-primary/10 rounded-xl"><PieChart className="size-5 text-primary" /></div>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                    <BarChart accessibilityLayer data={stats.genreData} layout="vertical" margin={{ left: 20 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} width={80} />
                        <Tooltip
                            cursor={{ fill: 'hsl(var(--secondary))', opacity: 0.4 }}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={24} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>

        <div className="space-y-8">
            <Card className="glass-panel border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <CardHeader className="flex flex-row items-center justify-between pb-8">
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-black uppercase tracking-tight text-white">Legacy Pulse</CardTitle>
                        <CardDescription className="text-[10px] uppercase font-bold tracking-widest">Average ratings by release decade</CardDescription>
                    </div>
                    <div className="p-2 bg-blue-400/10 rounded-xl"><History className="size-5 text-blue-400" /></div>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                        <LineChart accessibilityLayer data={stats.decadeData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.1} />
                            <XAxis dataKey="decade" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} domain={[0, 10]} />
                            <Tooltip content={<ChartTooltipContent hideLabel />} />
                            <Line type="monotone" dataKey="averageRating" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#fff' }} />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card className="glass-panel border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <CardHeader className="flex flex-row items-center justify-between pb-8">
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-black uppercase tracking-tight text-white">Verdict Spread</CardTitle>
                        <CardDescription className="text-[10px] uppercase font-bold tracking-widest">Global rating distribution</CardDescription>
                    </div>
                    <div className="p-2 bg-yellow-400/10 rounded-xl"><TrendingUp className="size-5 text-yellow-400" /></div>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                        <BarChart accessibilityLayer data={stats.ratingData}>
                            <XAxis dataKey="rating" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip
                                cursor={{ fill: 'hsl(var(--secondary))', opacity: 0.4 }}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Bar dataKey="count" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
