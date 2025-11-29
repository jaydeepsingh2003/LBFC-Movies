import { AppLayout } from '@/components/layout/app-layout';
import HeroSection from '@/components/sections/hero-section';
import ForYouSection from '@/components/sections/for-you-section';
import MoodSection from '@/components/sections/mood-section';
import TrendingSection from '@/components/sections/trending-section';
import SmartPlaylistSection from '@/components/sections/smart-playlist-section';
import NewsFeedSection from '@/components/sections/news-feed-section';
import FavoriteArtistsSection from '@/components/sections/favorite-artists-section';
import LanguagePicksSection from '@/components/sections/language-picks-section';
import FranchiseFocusSection from '@/components/sections/franchise-focus-section';

export default function DashboardPage() {
  return (
    <AppLayout showSidebar={false}>
      <div className="flex flex-col">
        <HeroSection />
        <div className="p-4 sm:p-6 md:p-8 space-y-12">
            <FranchiseFocusSection />
            <ForYouSection />
            <TrendingSection />
            <MoodSection />
            <FavoriteArtistsSection />
            <LanguagePicksSection />
            <SmartPlaylistSection />
            <NewsFeedSection />
        </div>
      </div>
    </AppLayout>
  );
}
