'use client';

import { useUser } from '@/firebase/auth/auth-client';
import { Loader2 } from 'lucide-react';
import HeroSection from '@/components/sections/hero-section';
import ForYouSection from '@/components/sections/for-you-section';
import MoodSection from '@/components/sections/mood-section';
import TrendingSection from '@/components/sections/trending-section';
import FranchiseFocusSection from '@/components/sections/franchise-focus-section';
import HindiMoviesSection from '@/components/sections/hindi-movies-section';
import KannadaMoviesSection from '@/components/sections/kannada-movies-section';
import TamilMoviesSection from '@/components/sections/tamil-movies-section';
import TeluguMoviesSection from '@/components/sections/telugu-movies-section';
import NowPlayingSection from '@/components/sections/now-playing-section';
import UpcomingSection from '@/components/sections/upcoming-section';
import TrendingOttsSection from '@/components/sections/trending-otts-section';
import Top10MoviesSection from '@/components/sections/top-10-movies-section';
import RegionalTop10Section from '@/components/sections/regional-top-10-section';

export default function DashboardPage() {
  const { user, isLoading } = useUser();

  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center h-svh bg-background">
        <Loader2 className="size-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full overflow-x-hidden">
      <HeroSection />
      
      {/* Zero Gap Cinematic Gallery */}
      <div className="space-y-0 px-4 md:px-8 lg:px-12 max-w-[2000px] mx-auto w-full">
          <Top10MoviesSection />
          <RegionalTop10Section />
          <TrendingOttsSection />
          <NowPlayingSection />
          <UpcomingSection />
          <ForYouSection />
          <MoodSection />
          <TrendingSection />
          <FranchiseFocusSection />
          
          <HindiMoviesSection />
          <KannadaMoviesSection />
          <TamilMoviesSection />
          <TeluguMoviesSection />
      </div>
    </div>
  );
}