
import { notFound } from 'next/navigation';
import { courses } from '@/lib/mock-data';
import { CheckoutView } from './_components/checkout-view';
import type { Course } from '@/types';
import { Suspense } from 'react';

function getCourse(id: string): Course | undefined {
    return courses.find(c => c.id === id);
}

// Suspense Boundary Wrapper for the client component
function CheckoutViewWrapper({ course }: { course: Course }) {
  return (
    <Suspense fallback={<div>Loading checkout details...</div>}>
      <CheckoutView course={course} />
    </Suspense>
  )
}

// This is the main Page, which is a Server Component by default.
// It fetches data and passes it to the Client Component.
export default function CheckoutPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const course = getCourse(id);

  if (!course) {
    notFound();
  }

  // We render the wrapper which contains the Suspense boundary.
  // This allows the page to be server-rendered initially,
  // and the client-side logic in CheckoutView loads in the browser.
  return <CheckoutViewWrapper course={course} />;
}
