"use client";

import { useMemo } from "react";
import { useFirestore } from "@/firebase";
import { useUser } from "@/firebase/auth/auth-client";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { History as HistoryIcon, X, Loader2 } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { MovieCard } from "@/components/movie-card";
import { TVShowCard } from "@/components/tv-show-card";
import { getPosterUrl } from "@/lib/tmdb.client";
import { Skeleton } from "@/components/ui/skeleton";
import { deleteFromHistory, type HistoryItem } from "@/firebase/firestore/history";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function ContinueWatchingSection() {
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();

    const historyQuery = useMemo(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, `users/${user.uid}/history`),
            orderBy('lastPlayed', 'desc'),
            limit(12)
        );
    }, [user, firestore]);

    const [historyItems, loading] = useCollectionData(historyQuery);

    const handleRemove = async (e: React.MouseEvent, mediaId: string | number) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user || !firestore) return;

        try {
            await deleteFromHistory(firestore, user.uid, mediaId);
            toast({ title: "History Updated", description: "Title removed from your recent streams." });
        } catch (err) {
            toast({ variant: "destructive", title: "Action Failed", description: "Could not remove title from vault." });
        }
    };

    if (loading) {
        return (
            <section className="py-4 space-y-8 border-b border-white/5">
                <Skeleton className="h-8 w-48" />
                <div className="flex gap-4 overflow-hidden">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="aspect-[2/3] w-40 md:w-56 flex-shrink-0 rounded-2xl" />
                    ))}
                </div>
            </section>
        );
    }

    if (!historyItems || historyItems.length === 0) return null;

    return (
        <section className="py-4 space-y-8 border-b border-white/5">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <HistoryIcon className="text-blue-500 size-6 md:size-7" />
                </div>
                <div className="space-y-1">
                    <h2 className="font-headline text-2xl md:text-3xl font-black tracking-tighter uppercase text-white mb-0">
                        Continue <span className="text-blue-500">Streaming</span>
                    </h2>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Pick up exactly where you left off in the vault.</p>
                </div>
            </div>

            <Carousel opts={{ align: 'start', loop: false, dragFree: true }} className="w-full">
                <CarouselContent className="-ml-4 md:-ml-6">
                    {historyItems.map((item: any) => {
                        const hItem = item as HistoryItem;
                        return (
                            <CarouselItem key={hItem.id} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 2xl:basis-1/7 pl-4 md:pl-6 relative group/history">
                                <div className="relative h-full">
                                    {/* Precise History Removal Control */}
                                    <button 
                                        onClick={(e) => handleRemove(e, hItem.id)}
                                        className="absolute top-2 left-2 z-30 p-1.5 bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-destructive hover:border-destructive transition-all rounded-lg opacity-0 group-hover/history:opacity-100 scale-90 group-hover/history:scale-100"
                                        title="Remove from history"
                                    >
                                        <X className="size-3.5" />
                                    </button>

                                    {hItem.type === 'movie' ? (
                                        <MovieCard 
                                            id={Number(hItem.id)} 
                                            title={hItem.title} 
                                            posterUrl={getPosterUrl(hItem.posterPath)} 
                                            poster_path={hItem.posterPath}
                                        />
                                    ) : (
                                        <TVShowCard 
                                            id={Number(hItem.id)} 
                                            title={hItem.title} 
                                            posterUrl={getPosterUrl(hItem.posterPath)} 
                                            poster_path={hItem.posterPath}
                                        />
                                    )}
                                </div>
                            </CarouselItem>
                        );
                    })}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex -left-12 h-12 w-12 glass-panel border-none hover:bg-primary shadow-2xl" />
                <CarouselNext className="hidden md:flex -right-12 h-12 w-12 glass-panel border-none hover:bg-primary shadow-2xl" />
            </Carousel>
        </section>
    );
}
