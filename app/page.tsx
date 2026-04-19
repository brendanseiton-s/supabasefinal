export default function Home() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-black mb-8">ArticleHub</h1>
        <a href="/login">
          <button className="bg-black text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-800 transition duration-200">
            Sign In to Get Started
          </button>
        </a>
      </div>
    </div>
  );
}