export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Student Portal Demo</h1>

        {/* Description */}
        <p className="text-lg text-gray-600 mb-8">A simple integrated web app using Supabase and Vercel.</p>

        {/* Button */}
        <a href="/login">
          <button className="bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition duration-200 text-lg font-medium">
            Get Started
          </button>
        </a>
      </div>
    </div>
  );
}