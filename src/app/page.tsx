import { AppLayout } from '@/components/layout/app-layout';
import ForYouSection from '@/components/sections/for-you-section';
import MoodSection from '@/components/sections/mood-section';
import TrendingSection from '@/components/sections/trending-section';
import SmartPlaylistSection from '@/components/sections/smart-playlist-section';
import NewsFeedSection from '@/components/sections/news-feed-section';
import FavoriteArtistsSection from '@/components/sections/favorite-artists-section';
import LanguagePicksSection from '@/components/sections/language-picks-section';

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-16">
        <ForYouSection />
        <TrendingSection />
        <MoodSection />
        <FavoriteArtistsSection />
        <LanguagePicksSection />
        <SmartPlaylistSection />
        <NewsFeedSection />
      </div>
    </AppLayout>
  );
}
