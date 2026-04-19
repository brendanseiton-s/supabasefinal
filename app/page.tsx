export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 bg-white z-30">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-blue-600">ArticleHub</h1>
          <p className="text-gray-600 mt-1">Discover, Read, and Engage with Quality Content</p>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-32">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Welcome to Your Learning Hub
          </h2>
          <p className="text-xl text-gray-300 mb-12 leading-relaxed max-w-2xl mx-auto">
            Stay informed with expertly curated articles on technology, development, and digital trends.
            Join thousands of readers exploring the latest insights and best practices.
          </p>
          <a href="/login">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 text-lg shadow-lg hover:shadow-2xl hover:scale-105 transform">
              Sign In to Start Reading
            </button>
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-4xl font-bold text-gray-900 mb-16 text-center">Why ArticleHub?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-10 rounded-xl shadow-md hover:shadow-xl transition duration-300 transform hover:-translate-y-2 border border-gray-200">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Quality Content</h4>
              <p className="text-gray-700 leading-relaxed">Carefully selected articles from industry experts and thought leaders delivering real value.</p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-10 rounded-xl shadow-md hover:shadow-xl transition duration-300 transform hover:-translate-y-2 border border-gray-200">
              <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20a3 3 0 003-3v-2a3 3 0 00-3-3H3a3 3 0 00-3 3v2a3 3 0 003 3z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Community Engagement</h4>
              <p className="text-gray-700 leading-relaxed">Share your thoughts, discuss ideas, and connect with fellow readers in a supportive environment.</p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-10 rounded-xl shadow-md hover:shadow-xl transition duration-300 transform hover:-translate-y-2 border border-gray-200">
              <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Stay Updated</h4>
              <p className="text-gray-700 leading-relaxed">Get notifications when new articles matching your interests are published in real-time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition">
              <p className="text-5xl font-bold text-blue-600 mb-2">10K+</p>
              <p className="text-gray-700 font-semibold">Active Readers</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition">
              <p className="text-5xl font-bold text-blue-600 mb-2">500+</p>
              <p className="text-gray-700 font-semibold">Quality Articles</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition">
              <p className="text-5xl font-bold text-blue-600 mb-2">50K+</p>
              <p className="text-gray-700 font-semibold">Monthly Views</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-4xl font-bold text-gray-900 mb-6">Ready to Explore?</h3>
          <p className="text-xl text-gray-600 mb-12">Start reading insightful articles curated just for you</p>
          <a href="/login">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-12 rounded-lg transition duration-200 text-lg shadow-lg hover:shadow-2xl hover:scale-105 transform">
              Get Started Now
            </button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>&copy; 2024 ArticleHub. All rights reserved. Your trusted source for quality technical articles.</p>
        </div>
      </footer>
    </div>
  );
}