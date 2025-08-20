import type {Metadata} from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { Poppins, PT_Sans } from 'next/font/google';
import RootClientLayout from '@/components/root-client-layout';
import { cn } from '@/lib/utils';


export const metadata: Metadata = {
  title: 'FunB',
  description: 'Upskill with AI-powered course recommendations.',
};

const fontHeadline = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-headline',
});

const fontBody = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("font-body antialiased", fontHeadline.variable, fontBody.variable)}>
        <RootClientLayout>{children}</RootClientLayout>
        <Toaster />
      </body>
    </html>
  );
}
