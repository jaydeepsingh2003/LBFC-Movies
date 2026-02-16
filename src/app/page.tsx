'use client';

import { useEffect } from 'react';
import { useUser } from '@/firebase/auth/auth-client';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import HeroSection from '@/components/sections/hero-section';
import ForYouSection from '@/components/sections/for-you-section';
import MoodSection from '@/components/sections/mood-section';
import TrendingSection from '@/components/sections/trending-section';
import FavoriteArtistsSection from '@/components/sections/favorite-artists-section';
import LanguagePicksSection from '@/components/sections/language-picks-section';
import FranchiseFocusSection from '@/components/sections/franchise-focus-section';
import HindiMoviesSection from '@/components/sections/hindi-movies-section';
import KannadaMoviesSection from '@/components/sections/kannada-movies-section';
import TamilMoviesSection from '@/components/sections/tamil-movies-section';
import TeluguMoviesSection from '@/components/sections/telugu-movies-section';
import MovieMatchmakerSection from '@/components/movie-matchmaker-section';
import NowPlayingSection from '@/components/sections/now-playing-section';
import UpcomingSection from '@/components/sections/upcoming-section';
import TrendingOttsSection from '@/components/sections/trending-otts-section';

export default function DashboardPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center h-svh bg-background">
        <Loader2 className="size-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full overflow-x-hidden -mt-24 md:-mt-28">
      <HeroSection />
      <div className="space-y-16 py-12 px-4 md:px-8 lg:px-12 max-w-[2000px] mx-auto w-full">
          <TrendingOttsSection />
          <NowPlayingSection />
          <UpcomingSection />
          <FranchiseFocusSection />
          <div className="grid grid-cols-1 gap-16">
            <ForYouSection />
            <TrendingSection />
          </div>
          <div className="space-y-16">
            <HindiMoviesSection />
            <KannadaMoviesSection />
            <TamilMoviesSection />
            <TeluguMoviesSection />
          </div>
          <MoodSection />
          <FavoriteArtistsSection />
          <LanguagePicksSection />
          <div className="pt-8 border-t border-primary/10">
            <MovieMatchmakerSection />
          </div>
      </div>
    </div>
  );
}
