import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NEXIUM - Cosmic AI Resume Builder",
  description: "Create, tailor, and manage your resumes with AI. Stand out with a futuristic, professional look—powered by the latest tech and cosmic inspiration.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen relative`}>
        {/* Cyber Nav */}
        <nav className="cyber-nav fixed top-0 left-0 right-0 z-50 border-b border-cyan-400/30">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              {/* Logo */}
              <Link href="/" className="text-2xl font-bold holographic hover:animate-glow-pulse transition-all duration-300">
                NEXIUM
              </Link>
              
              {/* Navigation Links */}
              <div className="flex items-center space-x-6">
                <Link 
                  href="/" 
                  className="cyber-button px-4 py-2 rounded-lg text-cyan-400 hover:text-white transition-all duration-300 font-medium relative overflow-hidden border border-cyan-400/30"
                >
                  <span className="relative z-10">Home</span>
                </Link>
                <Link 
                  href="/dashboard" 
                  className="cyber-button px-4 py-2 rounded-lg text-pink-500 hover:text-white transition-all duration-300 font-medium relative overflow-hidden border border-pink-500/30"
                >
                  <span className="relative z-10">Dashboard</span>
                </Link>
                
                
              </div>
            </div>
          </div>
          
          {/* Cyber line effect */}
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60"></div>
        </nav>

        {/* Main Content */}
        <main className="pt-20">
          {children}
        </main>

        {/* Floating Cyber Elements */}
        <div className="fixed top-20 right-10 w-4 h-4 bg-cyan-400 rounded-full opacity-20 cyber-float" style={{animationDelay: '0s'}}></div>
        <div className="fixed top-40 right-20 w-2 h-2 bg-pink-500 rounded-full opacity-30 cyber-float" style={{animationDelay: '1s'}}></div>
        <div className="fixed bottom-20 left-10 w-3 h-3 bg-purple-400 rounded-full opacity-25 cyber-float" style={{animationDelay: '2s'}}></div>
        
        {/* Cyber Corner Decorations */}
        <div className="fixed top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-cyan-400/20 pointer-events-none"></div>
        <div className="fixed bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-pink-500/20 pointer-events-none"></div>
      </body>
    </html>
  );
}
