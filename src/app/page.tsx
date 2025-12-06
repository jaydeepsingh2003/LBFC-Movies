
'use client';

import { useEffect } from 'react';
import { useUser } from '@/firebase/auth/auth-client';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
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
import MovieMatchmakerSection from '@/components/movie-matchmaker-section';
import NowPlayingSection from '@/components/sections/now-playing-section';
import UpcomingSection from '@/components/sections/upcoming-section';
import EnglishTvSection from '@/components/sections/english-tv-section';
import HindiTvSection from '@/components/sections/hindi-tv-section';
import KannadaTvSection from '@/components/sections/kannada-tv-section';

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
      <AppLayout>
        <div className="flex justify-center items-center h-screen bg-background">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col">
        <HeroSection />
        <div className="space-y-12 px-4 py-8 md:px-8">
            <NowPlayingSection />
            <UpcomingSection />
            <FranchiseFocusSection />
            <ForYouSection />
            <TrendingSection />
            <EnglishTvSection />
            <HindiTvSection />
            <KannadaTvSection />
            <HindiMoviesSection />
            <KannadaMoviesSection />
            <TamilMoviesSection />
            <MoodSection />
            <FavoriteArtistsSection />
            <LanguagePicksSection />
            <MovieMatchmakerSection />
        </div>
      </div>
    </AppLayout>
  );
}
