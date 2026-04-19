"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { SAMPLE_ARTICLES } from "@/lib/articles";

export default function Articles() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [articles, setArticles] = useState(SAMPLE_ARTICLES.slice(0, 5));
  const [liked, setLiked] = useState<{ [key: number]: boolean }>({});
  const [likes, setLikes] = useState<{ [key: number]: number }>({});
  const [notificationMessage, setNotificationMessage] = useState("");
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const supabase = getSupabaseClient();
      const { data } = await supabase.auth.getUser();
      
      if (!data?.user) {
        router.push("/login");
      } else {
        setUser(data.user);
      }
    };
    getUser();

    // Initialize likes from localStorage (all start at 0)
    const savedLikes = localStorage.getItem("articleLikes");
    const savedLikedArticles = localStorage.getItem("likedArticles");
    
    if (savedLikes) setLikes(JSON.parse(savedLikes));
    if (savedLikedArticles) setLiked(JSON.parse(savedLikedArticles));
  }, [router]);

  const handleLike = async (articleId: number) => {
    const article = articles.find((a) => a.id === articleId);
    
    setLiked((prev) => ({
      ...prev,
      [articleId]: !prev[articleId],
    }));

    setLikes((prev) => {
      const newLikes = {
        ...prev,
        [articleId]: (prev[articleId] || 0) + (liked[articleId] ? -1 : 1),
      };
      localStorage.setItem("articleLikes", JSON.stringify(newLikes));
      return newLikes;
    });

    // Save liked articles
    setLiked((prev) => {
      localStorage.setItem("likedArticles", JSON.stringify(prev));
      return prev;
    });

    // Send notification email when article is liked
    if (!liked[articleId] && user?.email) {
      try {
        await fetch("/api/send-notification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userEmail: user.email,
            articleTitle: article?.title,
            articleId: articleId,
            likerName: user.email.split("@")[0]
          }),
        });

        showNotificationMessage(`Notification email sent about "${article?.title}"`);
      } catch (error) {
        console.error("Error sending notification:", error);
      }
    }
  };

  const showNotificationMessage = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const getShareLink = (articleId: number) => {
    return `${window.location.origin}/articles/${articleId}`;
  };

  const copyToClipboard = (text: string, articleTitle: string) => {
    navigator.clipboard.writeText(text);
    showNotificationMessage(`Link to "${articleTitle}" copied to clipboard`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed top-24 right-4 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-fade border border-gray-700">
          {notificationMessage}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-3">Latest Articles</h1>
          <p className="text-blue-100 text-xl">Explore our curated collection of top articles</p>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="space-y-8">
          {articles.map((article, index) => (
            <article
              key={article.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 group border border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
                {/* Image */}
                <div className="md:col-span-1 h-64 md:h-auto bg-gray-200 overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                </div>

                {/* Content */}
                <div className="md:col-span-3 p-8 flex flex-col justify-between">
                  <div>
                    {/* Article Number */}
                    <span className="inline-block bg-blue-100 text-blue-600 px-4 py-1 rounded-full text-sm font-bold mb-4 uppercase tracking-wide">
                      Featured #{index + 1}
                    </span>

                    {/* Title */}
                    <Link href={`/articles/${article.id}`}>
                      <h2 className="text-3xl font-bold text-gray-900 hover:text-blue-600 transition mb-3 cursor-pointer leading-tight">
                        {article.title}
                      </h2>
                    </Link>

                    {/* Meta Information */}
                    <div className="flex items-center gap-4 mb-5 text-sm text-gray-600">
                      <span className="font-semibold">{article.author}</span>
                      <span className="text-gray-400">•</span>
                      <span>{new Date(article.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>

                    {/* Excerpt */}
                    <p className="text-gray-700 leading-relaxed mb-6 line-clamp-2">{article.excerpt}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 items-center border-t border-gray-200 pt-5">
                    <button
                      onClick={() => handleLike(article.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition duration-200 ${
                        liked[article.id]
                          ? "bg-red-100 text-red-600 hover:bg-red-200 shadow-sm"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      title="Like this article"
                    >
                      <svg className="w-5 h-5" fill={liked[article.id] ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>{likes[article.id] || article.likes}</span>
                    </button>

                    <Link href={`/articles/${article.id}`}>
                      <button className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition duration-200">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>{article.comments}</span>
                      </button>
                    </Link>

                    <button
                      onClick={() => copyToClipboard(getShareLink(article.id), article.title)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition duration-200"
                      title="Copy shareable link"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <span>Share</span>
                    </button>

                    <Link href={`/articles/${article.id}`}>
                      <button className="ml-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg transition duration-200 shadow-md hover:shadow-lg transform hover:scale-105">
                        Read Article
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-12 text-center border-2 border-blue-200 hover:border-blue-300 transition">
          <h3 className="text-3xl font-bold text-gray-900 mb-3">Want More Content?</h3>
          <p className="text-gray-700 mb-8 text-lg">Subscribe to our newsletter and get notified when new articles are published</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-3 rounded-lg transition duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
            Subscribe Now
          </button>
        </div>
      </div>
    </div>
  );
}
