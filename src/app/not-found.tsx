import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 - Neural Path Not Found | Resume Tailor',
  description: 'Page not found - Return to the neural network',
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto px-6">
        {/* 404 Error */}
        <div className="mb-8">
          <h1 className="cyber-title text-8xl md:text-9xl font-black mb-4 cyber-glitch">
            <span className="text-pink-500">4</span>
            <span className="text-cyan-400">0</span>
            <span className="text-purple-400">4</span>
          </h1>
          <div className="text-2xl md:text-3xl text-gray-300 mb-4 uppercase tracking-wider">
            Neural Path Not Found
          </div>
          <p className="text-gray-400 text-lg max-w-lg mx-auto leading-relaxed">
            The requested data stream has been disconnected from the neural network. 
            Initializing reroute protocols...
          </p>
        </div>

        {/* Glitch Effect Visual */}
        <div className="mb-8">
          <div className="cyber-card p-6 border-2 border-pink-500/30 bg-black/50 inline-block rounded-lg">
            <div className="font-mono text-pink-500 text-sm">
              <div>ERROR_CODE: NEURAL_404</div>
              <div>STATUS: DISCONNECTED</div>
              <div>TIMESTAMP: {new Date().toISOString()}</div>
            </div>
          </div>
        </div>

        {/* Navigation Options */}
        <div className="space-y-4">
          <Link 
            href="/" 
            className="cyber-button inline-block bg-gradient-to-r from-cyan-400/20 to-pink-500/20 text-white py-4 px-8 rounded-lg border-2 border-cyan-400/50 font-bold uppercase tracking-wider relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Return to Base
            </span>
          </Link>
          
          <div className="text-center">
            <Link 
              href="/dashboard" 
              className="cyber-button inline-block bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white py-3 px-6 rounded-lg border-2 border-purple-400/50 font-medium uppercase tracking-wider text-sm"
            >
              Access Neural Archive
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-gray-500 text-sm">
          <p>If this error persists, contact system administrators</p>
          <p className="mt-2">
            Powered by 
            <span className="text-cyan-400"> Next.js</span> •
            <span className="text-pink-500"> AI Integration</span> •
            <span className="text-purple-400"> n8n Automation</span>
          </p>
        </div>
      </div>

      {/* Floating Error Particles */}
      <div className="fixed top-20 right-10 w-2 h-2 bg-pink-500 rounded-full opacity-60 cyber-float" style={{animationDelay: '0s'}}></div>
      <div className="fixed top-40 left-20 w-1 h-1 bg-cyan-400 rounded-full opacity-40 cyber-float" style={{animationDelay: '1s'}}></div>
      <div className="fixed bottom-20 right-20 w-3 h-3 bg-purple-400 rounded-full opacity-30 cyber-float" style={{animationDelay: '2s'}}></div>
    </div>
  )
}
