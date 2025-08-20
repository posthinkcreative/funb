
import { Suspense } from 'react';
import { SuccessView } from './_components/success-view';

// This is the main Page, which is a Server Component by default.
// It uses Suspense to handle the loading of search parameters in the client component.
export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading success message...</div>}>
      <SuccessView />
    </Suspense>
  );
}
