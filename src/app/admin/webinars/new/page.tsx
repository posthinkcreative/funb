import React from 'react';
import { CreateCourseForm } from './_components/create-form';

export default function NewWebinarPage() {
  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold font-headline">Add New Webinar</h2>
        <p className="text-muted-foreground">Fill out the details for the new webinar.</p>
      </div>
      <CreateCourseForm />
    </div>
  );
}
