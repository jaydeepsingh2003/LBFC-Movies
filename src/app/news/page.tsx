
import { AppLayout } from '@/components/layout/app-layout';
import NewsFeedSection from '@/components/sections/news-feed-section';

export default function NewsPage() {
  return (
    <AppLayout showSidebar={false}>
      <div className="p-4 sm:p-6 md:p-8">
        <NewsFeedSection />
      </div>
    </AppLayout>
  );
}
