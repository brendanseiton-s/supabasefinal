"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Navigation from "@/components/Navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { SAMPLE_ARTICLES } from "@/lib/articles";

interface Comment {
  id: number;
  author: string;
  text: string;
  likes: number;
  replies: any[];
}

export default function ArticleDetail() {
  const router = useRouter();
  const params = useParams();
  const articleId = parseInt(params.id as string);

  const [user, setUser] = useState<any>(null);
  const [article, setArticle] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [totalLikes, setTotalLikes] = useState(0);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
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

    // Find article
    const foundArticle = SAMPLE_ARTICLES.find((a) => a.id === articleId);
    if (foundArticle) {
      setArticle(foundArticle);
      setTotalLikes(foundArticle.likes);

      // Initialize comments
      const initialComments: Comment[] = [
        { id: 1, author: "Alex", text: "Great article! Very helpful.", likes: 5, replies: [] },
        { id: 2, author: "Jordan", text: "Love the examples!", likes: 3, replies: [] },
      ];
      setComments(initialComments);
    }

    // Check if already liked
    const savedLiked = localStorage.getItem(`liked-${articleId}`);
    if (savedLiked) setLiked(true);
  }, [router, articleId]);

  const showNotificationMessage = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleLike = async () => {
    setLiked(!liked);
    setTotalLikes((prev) => (liked ? prev - 1 : prev + 1));
    localStorage.setItem(`liked-${articleId}`, JSON.stringify(!liked));

    // Send notification email when article is liked
    if (!liked && user?.email && article) {
      try {
        await fetch("/api/send-notification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userEmail: user.email,
            articleTitle: article.title,
            articleId: articleId,
            likerName: user.email.split("@")[0]
          }),
        });

        showNotificationMessage(`📧 Notification email sent to ${user.email}`);
      } catch (error) {
        console.error("Error sending notification:", error);
      }
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: comments.length + 1,
        author: user?.email?.split("@")[0] || "Anonymous",
        text: newComment,
        likes: 0,
        replies: [],
      };
      setComments([...comments, comment]);
      setNewComment("");
      showNotificationMessage("✓ Comment posted successfully");
    }
  };

  const handleAddReply = (commentId: number) => {
    if (replyText.trim()) {
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                replies: [
                  ...comment.replies,
                  {
                    id: comment.replies.length + 1,
                    author: user?.email?.split("@")[0] || "Anonymous",
                    text: replyText,
                  },
                ],
              }
            : comment
        )
      );
      setReplyText("");
      setReplyingTo(null);
      showNotificationMessage("✓ Reply posted successfully");
    }
  };

  const getShareLink = () => {
    return `${window.location.origin}/articles/${articleId}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getShareLink());
    showNotificationMessage("Link copied to clipboard!");
  };

  if (!article) {
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
        <div className="fixed top-24 right-4 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-lg z-50 border border-gray-700">
          {notificationMessage}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Article Container */}
        <article className="bg-white rounded-xl shadow-lg overflow-hidden mb-12 border border-gray-200">
          {/* Hero Image */}
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-96 object-cover hover:opacity-95 transition duration-300"
          />

          {/* Article Content */}
          <div className="p-12">
            {/* Metadata */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <div className="flex items-center gap-3 text-sm text-gray-600 mb-5">
                <span className="font-semibold">{article.author}</span>
                <span className="text-gray-400">•</span>
                <span>{new Date(article.date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-5">
                {article.title}
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">{article.excerpt}</p>
            </div>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none text-gray-700 mb-12 leading-loose">
              <p className="mb-6">{article.content}</p>
              <p className="text-gray-600 mt-8 italic">
                This article provides valuable insights and practical examples. Feel free to share your thoughts in the comments below or engage with the community.
              </p>
            </div>

            {/* Article Actions */}
            <div className="flex flex-wrap gap-4 items-center border-t border-gray-200 pt-8">
              <button
                onClick={handleLike}
                className={`flex items-center gap-3 px-6 py-3 rounded-lg font-bold transition duration-200 transform hover:scale-105 ${
                  liked
                    ? "bg-red-100 text-red-600 hover:bg-red-200 shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <svg className={`w-6 h-6 transition ${liked ? 'fill-current' : ''}`} fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-lg">{totalLikes} {totalLikes === 1 ? 'Like' : 'Likes'}</span>
              </button>

              <button
                onClick={copyToClipboard}
                className="flex items-center gap-3 px-6 py-3 rounded-lg font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition duration-200 transform hover:scale-105"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span>Share Article</span>
              </button>

              <button
                onClick={() => router.back()}
                className="ml-auto text-blue-600 hover:text-blue-700 font-bold flex items-center gap-2 transition duration-200 transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back to Articles</span>
              </button>
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <div className="bg-white rounded-xl shadow-lg p-12 border border-gray-200">
          <h2 className="text-4xl font-bold text-gray-900 mb-10 pb-8 border-b-2 border-gray-200">
            Comments & Discussion <span className="text-blue-600">({comments.length})</span>
          </h2>

          {/* Add Comment Form */}
          <div className="mb-12 pb-12 border-b border-gray-200">
            <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-widest">
              Share Your Thoughts
            </label>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your comment here... Keep it respectful and constructive."
              className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-4 text-gray-700 hover:border-gray-400 transition"
              rows={4}
            />
            <button
              onClick={handleAddComment}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition font-bold shadow-md hover:shadow-lg transform hover:scale-105"
            >
              Post Comment
            </button>
          </div>

          {/* Comments List */}
          <div className="space-y-8">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No comments yet. Be the first to share your thoughts!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border-l-4 border-blue-600 pl-6 hover:bg-gray-50 hover:rounded-lg hover:ml-2 hover:pl-4 transition p-4">
                  {/* Comment Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{comment.author}</p>
                      <p className="text-sm text-gray-500">Just now</p>
                    </div>
                    <button className="text-gray-600 hover:text-red-600 transition flex items-center gap-2 font-semibold hover:scale-110 transform">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>{comment.likes}</span>
                    </button>
                  </div>

                  {/* Comment Text */}
                  <p className="text-gray-700 mb-4 leading-relaxed text-lg">{comment.text}</p>

                  {/* Reply Button */}
                  <button
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-bold transition transform hover:scale-105"
                  >
                    {replyingTo === comment.id ? "Cancel Reply" : "Reply to Comment"}
                  </button>

                  {/* Reply Input */}
                  {replyingTo === comment.id && (
                    <div className="mt-5 p-5 bg-blue-50 rounded-lg border-2 border-blue-200">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your reply..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3"
                        rows={2}
                      />
                      <button
                        onClick={() => handleAddReply(comment.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded text-sm font-bold transition transform hover:scale-105 shadow-md"
                      >
                        Post Reply
                      </button>
                    </div>
                  )}

                  {/* Replies */}
                  {comment.replies.length > 0 && (
                    <div className="mt-6 space-y-3 ml-6 pt-6 border-t border-gray-200">
                      <p className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-4">{comment.replies.length} Replies</p>
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 p-4 border border-gray-200 hover:border-blue-300 transition">
                          <p className="font-bold text-gray-900 text-sm mb-2">{reply.author}</p>
                          <p className="text-gray-700 text-sm leading-relaxed">{reply.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
