// app/layout.tsx
import "./globals.css";
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/Header';
import GoogleAnalytics from "@/components/GoogleAnalytics";
import Footer from '@/components/Footer';
import TrackPageView from "@/components/TrackPageView";
import { UserProvider } from "@/context/UserContext";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ED-Library',
  description: 'Academic notes and study guides',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
    <html lang="en"> 
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6904837010680652"
          crossOrigin="anonymous">

     </script>
      </head>
      <body className={`${inter.className} bg-[#F8F9FB] min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-grow w-full">
          <GoogleAnalytics />
          <TrackPageView />

            {children}

          
        </main>
        <Footer />
      </body>
    </html>
    </UserProvider>
  );
}