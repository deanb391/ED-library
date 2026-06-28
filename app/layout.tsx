// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import Footer from "@/components/Footer";
import TrackPageView from "@/components/TrackPageView";
import { UserProvider } from "@/context/UserContext";
import Script from "next/script";
import { PHProvider } from "@/app/providers";
import AppProgressBar from "@/components/ProgressBar";
import ContributorChatFAB from "@/components/chats/ContributorChatFAB";
import ReferralTracker from "@/components/ReferralTracker";

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
    <html lang="en">
      <head>
        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6904837010680652"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        {/* Adsterra
          <Script
            src="https://pl28536403.effectivegatecpm.com/5d/f2/b5/5df2b541a3eac4751ebd6c025764badb.js"
            strategy="afterInteractive"
          />
*/}
      </head>

      <body
        className={`${inter.className} bg-[#F8F9FB] min-h-screen flex flex-col`}
      >
        <AppProgressBar />
        <PHProvider>
          <UserProvider>
            <Header />

            <main className="flex-grow w-full">
              <GoogleAnalytics />
              <TrackPageView />
              <ReferralTracker />
              {children}
            </main>

            <Footer />
            <ContributorChatFAB />
          </UserProvider>
        </PHProvider>
      </body>
    </html>
  );
}
