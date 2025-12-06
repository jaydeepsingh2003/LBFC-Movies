
import { AppLayout } from '@/components/layout/app-layout';
import NewsFeedSection from '@/components/sections/news-feed-section';

export default function NewsPage() {
  return (
    <AppLayout>
      <div>
        <NewsFeedSection />
      </div>
    </AppLayout>
  );
}
