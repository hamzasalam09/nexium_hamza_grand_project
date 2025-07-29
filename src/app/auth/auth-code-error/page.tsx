'use client';

export default function AuthCodeError() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-gradient-to-br from-red-900/20 to-red-800/10 backdrop-blur-xl border border-red-500/30 rounded-2xl p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4 text-red-400">Authentication Error</h1>
          <p className="text-gray-300 mb-6">
            There was an issue with your magic link. This usually happens when the link is expired or invalid.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-gradient-to-r from-cyan-500 to-pink-500 text-white font-medium py-3 px-6 rounded-lg hover:from-cyan-600 hover:to-pink-600 transition-all duration-200"
            >
              Try Again
            </button>
            <p className="text-sm text-gray-400">
              If the problem persists, please request a new magic link.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
