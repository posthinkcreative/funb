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
  slug: string;
  title: string;
  category: string;
  description: string;
  longDescription: string;
  price: number;
  discountType?: 'none' | 'percentage' | 'nominal';
  discountValue?: number;
  imageUrl: string;
  videoUrl?: string;
  rating: number;
  reviewCount: number;
  instructorId?: string;
  instructor: Instructor;
  reviews: Review[];
  modules: Module[];
  features: string[];
  courseDate?: Date;
  courseTime?: string;
  level?: string;
  schedule?: string;
  enrollmentCount?: number;
  status: 'Published' | 'Draft' | 'Archived';
  createdAt?: any;
};

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  role: 'admin' | 'customer';
};

export type PractitionerCategory = 'Business' | 'Data Science' | 'Development' | 'Marketing' | 'Design';

export type Speaker = {
  id: string;
  name: string;
  title: string;
  imageUrl: string;
  categoryName: PractitionerCategory;
  sortOrder: number;
};

export type AlumniTestimonial = {
  id: string;
  name: string;
  batch: string;
  avatarUrl: string;
  bgColor: string;
  before: {
    role: string;
    university: string;
  };
  after: {
    role: string;
    company: string;
    companyLogoUrl: string;
  };
  sortOrder: number;
};

export interface HeroCarouselItem {
  title: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  sortOrder: number;
}

export interface SponsorLogo {
  name: string;
  imageUrl: string;
  sortOrder: number;
  ctaText: string;
  ctaLink: string;
}
