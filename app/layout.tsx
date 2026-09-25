// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import Footer from "@/components/Footer";
import TrackPageView from "@/components/TrackPageView";
import { UserProvider } from "@/context/UserContext";
import { HomeProvider } from "@/context/HomeContext";
import Script from "next/script";
import { PHProvider } from "@/app/providers";
import AppProgressBar from "@/components/ProgressBar";
import ContributorChatFAB from "@/components/chats/ContributorChatFAB";
import ReferralTracker from "@/components/ReferralTracker";
import WhatsappChannel from "@/components/WhatsappChannel";
import { ThemeProvider } from "next-themes";
import Sidebar from "@/components/Sidebar";
import SearchResultsOverlay from "@/components/SearchResultsOverlay";
import NetworkStatusBanner from "@/components/NetworkStatusBanner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ED-Library",
  description: "Share. Discover. Learn",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6904837010680652"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>

      <body
        className={`${inter.className} bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col transition-colors duration-200`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AppProgressBar />
          <PHProvider>
            <UserProvider>
              <NetworkStatusBanner />
              <HomeProvider>
                <Header />
                <div className="flex w-full">
                  <Sidebar />
                  <main className="grow w-full min-w-0 relative">
                    <GoogleAnalytics />
                    <TrackPageView />
                    <ReferralTracker />
                    <SearchResultsOverlay />
                    {children}
                  </main>
                </div>

              <Footer />
              <div className="fixed bottom-4 left-4 z-100">
                <WhatsappChannel />
              </div>
                <ContributorChatFAB />
              </HomeProvider>
            </UserProvider>
          </PHProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
