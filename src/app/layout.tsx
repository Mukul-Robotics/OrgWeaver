import type {Metadata} from 'next';
import { Geist, Geist_Mono } from 'next/font/google'; // Assuming Geist is correctly configured
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Added Toaster

// If Geist and Geist_Mono are from @vercel/geist, the import might look like:
// import { GeistSans } from 'geist/font/sans';
// import { GeistMono } from 'geist/font/mono';
// For now, assuming the provided setup is functional.

const geistSans = Geist({ // Or GeistSans if using @vercel/geist
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({ // Or GeistMono
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'OrgWeaver',
  description: 'Visualize, reorganize, and optimize your organizational structure.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
