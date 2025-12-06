'use client';

import { ReactNode } from 'react';

export function AppLayout({ children }: { children: ReactNode }) {
  // This component is being intentionally left empty to remove previous layout structures.
  // The layout will be managed by individual page components for now.
  return <>{children}</>;
}
