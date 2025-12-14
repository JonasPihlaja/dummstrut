import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LoginModalProvider } from "@/components/LoginModalProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Dummstrut",
  description: "Vem tar den i år?",
};



export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <LoginModalProvider>
        <Navbar />     {/* ← This appears on every page */}
        <main className="max-w-7xl mx-auto">
          {children}
        </main>
        </LoginModalProvider>
      </body>
    </html>
  );
}
