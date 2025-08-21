export type Instructor = {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatarUrl: string;
};

export type Review = {
  id: string;
  user: {
    name: string;
    avatarUrl: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
};

export type Module = {
  id: string;
  title: string;
  lessons: {
    id: string;
    title:string;
    duration: string;
  }[];
};

export type Course = {
  id: string;
  title: string;
  category: string;
  description: string;
  longDescription: string;
  price: number;
  imageUrl: string;
  videoUrl?: string;
  rating: number;
  reviewCount: number;
  instructor: Instructor;
  reviews: Review[];
  modules: Module[];
  features: string[];
  courseDate?: Date;
  courseTime?: string;
  level?: string;
  schedule?: string;
  status: 'Published' | 'Draft';
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
};

export type Speaker = {
  id: string;
  name: string;
  title: string;
  imageUrl: string;
  category: {
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  };
};

export type AlumniTestimonial = {
  id: string;
  name: string;
  batch: string;
  avatarUrl: string;
  bgColor: string; // Changed from className to a color value
  before: {
    role: string;
    university: string;
  };
  after: {
    role: string;
    company: string;
    companyLogoUrl: string;
  };
};
