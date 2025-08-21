
import { Suspense } from 'react';
import SuccessContent from './SuccessContent';

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto max-w-2xl px-4 py-12 flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">Loading payment confirmation...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
