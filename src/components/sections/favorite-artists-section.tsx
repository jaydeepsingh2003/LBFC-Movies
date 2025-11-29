
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { getFavoriteArtistsDirectorsRecommendations } from "@/ai/flows/favorite-artists-directors"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Film } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function FavoriteArtistsSection() {
  const [favoriteActors, setFavoriteActors] = useState("");
  const [favoriteDirectors, setFavoriteDirectors] = useState("");
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGetRecommendations = async () => {
    if (!favoriteActors && !favoriteDirectors) {
      toast({
        variant: "destructive",
        title: "Input Required",
        description: "Please enter at least one actor or director.",
      });
      return;
    }

    setIsLoading(true);
    setRecommendations([]);
    try {
      const actors = favoriteActors.split(',').map(s => s.trim()).filter(Boolean);
      const directors = favoriteDirectors.split(',').map(s => s.trim()).filter(Boolean);

      const result = await getFavoriteArtistsDirectorsRecommendations({ 
        favoriteActors: actors,
        favoriteDirectors: directors 
      });
      
      setRecommendations(result.recommendations);

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get recommendations. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-headline text-2xl font-bold tracking-tight">From Your Favorites</h2>
        <p className="text-muted-foreground">Get recommendations based on actors and directors you love.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Find Movies by Artists</CardTitle>
          <CardDescription>Enter your favorite actors or directors, separated by commas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="actors" className="text-sm font-medium">Favorite Actors</label>
              <Input 
                id="actors" 
                value={favoriteActors} 
                onChange={e => setFavoriteActors(e.target.value)} 
                placeholder="e.g., Tom Hanks, Meryl Streep" 
                className="mt-1" 
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="directors" className="text-sm font-medium">Favorite Directors</label>
              <Input 
                id="directors" 
                value={favoriteDirectors} 
                onChange={e => setFavoriteDirectors(e.target.value)} 
                placeholder="e.g., Christopher Nolan, Greta Gerwig" 
                className="mt-1" 
                disabled={isLoading}
              />
            </div>
          </div>
          <Button onClick={handleGetRecommendations} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Film className="mr-2 h-4 w-4" />}
            Get Recommendations
          </Button>
        </CardContent>
      </Card>
      
      {isLoading && (
        <Card className="animate-pulse">
            <CardHeader>
                <div className="h-6 w-2/5 bg-secondary rounded"></div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {[...Array(5)].map((_, i) => <div key={i} className="h-5 w-1/2 bg-secondary rounded"></div>)}
                </div>
            </CardContent>
        </Card>
      )}

      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1">
              {recommendations.map((movie, index) => (
                <li key={index} className="text-foreground">{movie}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </section>
  )
}
