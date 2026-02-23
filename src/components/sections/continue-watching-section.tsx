"use client";

import { useMemo } from "react";
import { useFirestore } from "@/firebase";
import { useUser } from "@/firebase/auth/auth-client";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { History as HistoryIcon, X, MonitorPlay } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { MovieCard } from "@/components/movie-card";
import { TVShowCard } from "@/components/tv-show-card";
import { getPosterUrl } from "@/lib/tmdb.client";
import { Skeleton } from "@/components/ui/skeleton";
import { deleteFromHistory, type HistoryItem } from "@/firebase/firestore/history";
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
            <section className="py-12 space-y-8 border-t border-white/5">
                <Skeleton className="h-10 w-64 rounded-full bg-blue-500/10" />
                <div className="flex gap-6 overflow-hidden">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="aspect-[2/3] w-48 md:w-64 flex-shrink-0 rounded-[2rem] bg-secondary/20" />
                    ))}
                </div>
            </section>
        );
    }

    if (!historyItems || historyItems.length === 0) return null;

    return (
        <section className="py-12 space-y-10 border-t border-white/5">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 shadow-2xl shadow-blue-500/10">
                    <MonitorPlay className="text-blue-500 size-7 md:size-8" />
                </div>
                <div className="space-y-1">
                    <h2 className="font-headline text-3xl md:text-4xl font-black tracking-tighter uppercase text-white mb-0 leading-none">
                        Active <span className="text-blue-500">Transmissions</span>
                    </h2>
                    <p className="text-[10px] md:text-xs font-black text-muted-foreground uppercase tracking-[0.3em] opacity-60">Continue precisely where you left off in the vault.</p>
                </div>
            </div>

            <Carousel opts={{ align: 'start', loop: false, dragFree: true }} className="w-full">
                <CarouselContent className="-ml-4 md:-ml-8">
                    {historyItems.map((item: any) => {
                        const hItem = item as HistoryItem;
                        return (
                            <CarouselItem key={hItem.id} className="basis-[70%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 2xl:basis-1/6 pl-4 md:pl-8 relative group/history">
                                <div className="relative h-full transition-transform duration-500 hover:-translate-y-2">
                                    <button 
                                        onClick={(e) => handleRemove(e, hItem.id)}
                                        className="absolute top-4 left-4 z-30 p-2 bg-black/80 backdrop-blur-xl border border-white/10 text-white hover:bg-destructive hover:border-destructive transition-all rounded-xl opacity-0 group-hover/history:opacity-100 scale-90 group-hover/history:scale-100 shadow-2xl"
                                        title="Remove from history"
                                    >
                                        <X className="size-4" />
                                    </button>

                                    {hItem.type === 'movie' ? (
                                        <MovieCard 
                                            id={Number(hItem.id)} 
                                            title={hItem.title} 
                                            posterUrl={getPosterUrl(hItem.posterPath)} 
                                            poster_path={hItem.posterPath}
                                            className="shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                                        />
                                    ) : (
                                        <TVShowCard 
                                            id={Number(hItem.id)} 
                                            title={hItem.title} 
                                            posterUrl={getPosterUrl(hItem.posterPath)} 
                                            poster_path={hItem.posterPath}
                                            className="shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                                        />
                                    )}
                                </div>
                            </CarouselItem>
                        );
                    })}
                </CarouselContent>
                <CarouselPrevious className="hidden xl:flex -left-16 size-14 glass-panel border-white/10 hover:bg-primary shadow-2xl hover:text-white" />
                <CarouselNext className="hidden xl:flex -right-16 size-14 glass-panel border-white/10 hover:bg-primary shadow-2xl hover:text-white" />
            </Carousel>
        </section>
    );
}