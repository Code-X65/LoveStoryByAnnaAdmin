import React from 'react'

const Analytics = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        <div className="inline-block">
          <div className="w-20 h-20 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-pink-500">
          Coming Soon
        </h1>
        
        <p className="text-gray-400 text-lg md:text-xl max-w-md mx-auto">
          Analytics dashboard is under construction. Stay tuned for powerful insights!
        </p>
        
        <div className="flex gap-2 justify-center mt-8">
          <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  )
}

export default Analytics