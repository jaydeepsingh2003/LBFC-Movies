"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MovieCarousel } from "@/components/movie-carousel"
import { getFavoriteArtistsDirectorsRecommendations } from "@/ai/flows/favorite-artists-directors"
import type { FavoriteArtistsDirectorsOutput } from "@/ai/flows/favorite-artists-directors"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Wand2 } from "lucide-react"

export default function FavoriteArtistsSection() {
  const [actors, setActors] = useState("Tom Hanks, Meryl Streep")
  const [directors, setDirectors] = useState("Christopher Nolan")
  const [recommendations, setRecommendations] = useState<FavoriteArtistsDirectorsOutput["recommendations"]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleGetRecommendations = async () => {
    setIsLoading(true)
    setRecommendations([])
    try {
      const result = await getFavoriteArtistsDirectorsRecommendations({
        favoriteActors: actors.split(",").map(s => s.trim()).filter(Boolean),
        favoriteDirectors: directors.split(",").map(s => s.trim()).filter(Boolean),
      })
      setRecommendations(result.recommendations)
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get recommendations. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const movies = recommendations.map((title, index) => ({
    title,
    posterId: `movie-poster-${(index % 10) + 1}`,
  }))

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-headline text-2xl font-bold tracking-tight">From Your Favorites</h2>
        <p className="text-muted-foreground">Get recommendations based on actors and directors you love.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="actors" className="text-sm font-medium">Favorite Actors</label>
          <Input
            id="actors"
            value={actors}
            onChange={(e) => setActors(e.target.value)}
            placeholder="e.g., Tom Hanks, Meryl Streep"
            className="mt-1"
          />
        </div>
        <div>
          <label htmlFor="directors" className="text-sm font-medium">Favorite Directors</label>
          <Input
            id="directors"
            value={directors}
            onChange={(e) => setDirectors(e.target.value)}
            placeholder="e.g., Christopher Nolan"
            className="mt-1"
          />
        </div>
      </div>
      <Button onClick={handleGetRecommendations} disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
        Get Recommendations
      </Button>
      
      {isLoading && (
         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[2/3] w-full bg-secondary rounded-lg animate-pulse"></div>
            ))}
        </div>
      )}

      {recommendations.length > 0 && (
        <MovieCarousel title="Based on Your Favorites" movies={movies} />
      )}
    </section>
  )
}
