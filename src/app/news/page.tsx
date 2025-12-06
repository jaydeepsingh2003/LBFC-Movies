
import { AppLayout } from '@/components/layout/app-layout';
import NewsFeedSection from '@/components/sections/news-feed-section';

export default function NewsPage() {
  return (
    <AppLayout>
      <div className="p-4 md:p-8">
        <NewsFeedSection />
      </div>
    </AppLayout>
  );
}
