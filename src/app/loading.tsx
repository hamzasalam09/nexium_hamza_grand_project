import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Loading - Neural Network Initializing | Resume Tailor',
  description: 'Connecting to the neural network...',
}

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-400/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 text-center">
        {/* Main Loading Animation */}
        <div className="mb-8">
          <div className="relative">
            {/* Outer Ring */}
            <div className="w-32 h-32 rounded-full border-4 border-cyan-400/20 relative mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin"></div>
            </div>
            
            {/* Inner Ring */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-24 h-24 rounded-full border-4 border-pink-500/20">
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-pink-500 animate-spin" style={{animationDuration: '0.8s', animationDirection: 'reverse'}}></div>
            </div>
            
            {/* Core */}
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-r from-cyan-400/20 to-pink-500/20 border-2 border-purple-400/30 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-4">
          <h2 className="cyber-title text-3xl font-bold">
            <span className="text-cyan-400">INITIALIZING</span>
            <span className="text-pink-500"> NEURAL</span>
            <span className="text-purple-400"> NETWORK</span>
          </h2>
          
          <div className="text-gray-300 text-lg">
            <div className="flex items-center justify-center space-x-2">
              <span>Establishing secure connection</span>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{animationDelay: '0s'}}></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-8 max-w-md mx-auto">
          <div className="cyber-progress h-2 rounded-full">
            <div className="cyber-progress-bar h-full rounded-full" style={{width: '60%'}}></div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 cyber-card inline-block p-4 border border-cyan-400/30 bg-black/50 rounded-lg">
          <div className="font-mono text-sm text-gray-400 space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>AI Integration: ACTIVE</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>n8n Workflows: READY</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span>Neural Processing: LOADING</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="fixed top-20 right-10 w-1 h-1 bg-cyan-400 rounded-full opacity-60 cyber-float" style={{animationDelay: '0s'}}></div>
      <div className="fixed top-40 left-20 w-2 h-2 bg-pink-500 rounded-full opacity-40 cyber-float" style={{animationDelay: '1s'}}></div>
      <div className="fixed bottom-20 right-20 w-1 h-1 bg-purple-400 rounded-full opacity-50 cyber-float" style={{animationDelay: '2s'}}></div>
    </div>
  )
}
