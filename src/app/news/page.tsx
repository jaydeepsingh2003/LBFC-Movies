
import { AppLayout } from '@/components/layout/app-layout';
import NewsFeedSection from '@/components/sections/news-feed-section';

export default function NewsPage() {
  return (
    <AppLayout>
      <div className="px-4 py-8 md:px-8">
        <NewsFeedSection />
      </div>
    </AppLayout>
  );
}
