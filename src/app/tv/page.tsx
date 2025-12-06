
import { AppLayout } from '@/components/layout/app-layout';

export default function TVPage() {
  return (
    <AppLayout>
      <div className="p-4 sm:p-6 md:p-8">
        <header className="space-y-2">
            <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">TV Shows</h1>
            <p className="text-muted-foreground">Browse and discover new TV series.</p>
        </header>
        <div className="mt-8 text-center">
            <p>TV show browsing functionality will be implemented soon.</p>
        </div>
      </div>
    </AppLayout>
  );
}
