"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { getArticles, getTopLikedArticles } from "@/lib/articles";

interface Article {
  id: number;
  title: string;
  author: string;
  authorEmail: string;
  date: string;
  excerpt: string;
  content: string;
  likes: number;
  image: string;
}

export default function Articles() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [topArticles, setTopArticles] = useState<Article[]>([]);
  const [likedArticles, setLikedArticles] = useState<Set<number>>(new Set());
  const [notificationMessage, setNotificationMessage] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializePage = async () => {
      const supabase = getSupabaseClient();
      const { data } = await supabase.auth.getUser();

      if (!data?.user) {
        router.push("/login");
        return;
      }

      setUser(data.user);

      // Load articles and user's likes
      await loadArticles();
      await loadUserLikes();
      await loadTopArticles();

      setLoading(false);
    };

    initializePage();
  }, [router]);

  const loadArticles = async () => {
    const articlesData = await getArticles();
    setArticles(articlesData);
  };

  const loadTopArticles = async () => {
    const topData = await getTopLikedArticles(5);
    setTopArticles(topData);
  };

  const loadUserLikes = async () => {
    const supabase = getSupabaseClient();
    const { data: likesData } = await supabase
      .from('likes')
      .select('article_id')
      .eq('user_id', user?.id);

    const likedSet = new Set(likesData?.map(like => like.article_id) || []);
    setLikedArticles(likedSet);
  };

  const handleLike = async (articleId: number) => {
    if (!user) return;

    const supabase = getSupabaseClient();
    const isLiked = likedArticles.has(articleId);

    try {
      if (isLiked) {
        // Unlike
        await supabase
          .from('likes')
          .delete()
          .eq('article_id', articleId)
          .eq('user_id', user.id);

        setLikedArticles(prev => {
          const newSet = new Set(prev);
          newSet.delete(articleId);
          return newSet;
        });

        setArticles(prev => prev.map(article =>
          article.id === articleId
            ? { ...article, likes: article.likes - 1 }
            : article
        ));
      } else {
        // Like
        await supabase
          .from('likes')
          .insert({ article_id: articleId, user_id: user.id });

        setLikedArticles(prev => new Set([...prev, articleId]));

        setArticles(prev => prev.map(article =>
          article.id === articleId
            ? { ...article, likes: article.likes + 1 }
            : article
        ));

        // Send notification
        const article = articles.find(a => a.id === articleId);
        if (article) {
          await fetch("/api/send-notification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userEmail: article.authorEmail,
              articleTitle: article.title,
              articleId: articleId,
              likerName: user.email?.split("@")[0] || "Someone"
            }),
          });
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const shareArticle = async (article: Article) => {
    const shareUrl = `${window.location.origin}/articles/${article.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
        copyToClipboard(shareUrl, article.title);
      }
    } else {
      copyToClipboard(shareUrl, article.title);
    }
  };

  const copyToClipboard = (text: string, title: string) => {
    navigator.clipboard.writeText(text);
    showNotificationMessage(`Link to "${title}" copied to clipboard`);
  };

  const showNotificationMessage = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

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
                        likedArticles.has(article.id)
                          ? "bg-red-100 text-red-600 hover:bg-red-200 shadow-sm"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      title="Like this article"
                    >
                      <span>👍</span>
                      <span>{article.likes}</span>
                    </button>

                    <Link href={`/articles/${article.id}`}>
                      <button className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition duration-200">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>Comments</span>
                      </button>
                    </Link>

                    <button
                      onClick={() => shareArticle(article)}
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
