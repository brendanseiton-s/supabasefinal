"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Navigation from "@/components/Navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { getArticleById } from "@/lib/articles";

interface Comment {
  id: number;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: {
    email: string;
    full_name: string;
  } | null;
  replies?: Comment[];
}

export default function ArticleDetail() {
  const router = useRouter();
  const params = useParams();
  const articleId = parseInt(params.id as string);

  const [user, setUser] = useState<any>(null);
  const [article, setArticle] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [likedArticles, setLikedArticles] = useState<Set<number>>(new Set());
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
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

      // Load article, comments, and user likes
      await loadArticle();
      await loadComments();
      await loadUserLikes();

      setLoading(false);
    };

    initializePage();
  }, [router, articleId]);

  const loadArticle = async () => {
    const articleData = await getArticleById(articleId);
    setArticle(articleData);
  };

  const loadComments = async () => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles:user_id (email, full_name)
      `)
      .eq('article_id', articleId)
      .is('parent_id', null)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading comments:', error);
      return;
    }

    // Load replies for each comment
    const commentsWithReplies = await Promise.all(
      data.map(async (comment) => {
        const { data: replies } = await supabase
          .from('comments')
          .select(`
            *,
            profiles:user_id (email, full_name)
          `)
          .eq('parent_id', comment.id)
          .order('created_at', { ascending: true });

        return {
          ...comment,
          replies: replies || []
        };
      })
    );

    setComments(commentsWithReplies);
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

  const handleLike = async () => {
    if (!user || !article) return;

    const supabase = getSupabaseClient();
    const isLiked = likedArticles.has(article.id);

    try {
      if (isLiked) {
        await supabase
          .from('likes')
          .delete()
          .eq('article_id', article.id)
          .eq('user_id', user.id);

        setLikedArticles((prev: Set<number>) => {
          const newSet = new Set(prev);
          newSet.delete(article.id);
          return newSet;
        });

        setArticle((prev: any) => prev ? { ...prev, likes: prev.likes - 1 } : null);
      } else {
        await supabase
          .from('likes')
          .insert({ article_id: article.id, user_id: user.id });

        setLikedArticles((prev: Set<number>) => new Set([...prev, article.id]));

        setArticle((prev: any) => prev ? { ...prev, likes: prev.likes + 1 } : null);

        // Send notification to article author
        if (article?.authorEmail && article.authorEmail !== user.email) {
          try {
            await fetch('/api/send-notification', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userEmail: article.authorEmail,
                articleTitle: article.title,
                articleId: articleId,
                likerName: user.user_metadata?.full_name || user.email,
                type: 'like'
              }),
            });
          } catch (notificationError) {
            console.error('Failed to send like notification:', notificationError);
          }
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      console.error("Like error details:", {
        message: (error as Error)?.message,
        stack: (error as Error)?.stack,
        name: (error as Error)?.name
      });
    }
  };

  const handleComment = async () => {
    if (!user || !newComment.trim()) return;

    const supabase = getSupabaseClient();

    try {
      let profile = null;
      try {
        const profileResponse = await fetch('/api/ensure-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email,
          }),
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          profile = profileData.profile;
        }
      } catch (profileError) {
        console.error('Failed to ensure profile:', profileError);
      }

      const { data, error } = await supabase
        .from('comments')
        .insert({
          article_id: articleId,
          user_id: user.id,
          content: newComment.trim()
        })
        .select()
        .single();

      if (error) throw error;

      setComments(prev => [...prev, { 
        ...data, 
        profiles: { 
          email: profile?.email || user.email, 
          full_name: profile?.full_name || user.user_metadata?.full_name || user.email 
        }, 
        replies: [] 
      }]);
      setNewComment("");

      showNotificationMessage("Comment posted successfully!");

      // Send notification to article author
      if (article?.authorEmail && article.authorEmail !== user.email) {
        try {
          await fetch('/api/send-notification', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userEmail: article.authorEmail,
              articleTitle: article.title,
              articleId: articleId,
              likerName: user.user_metadata?.full_name || user.email,
              type: 'comment'
            }),
          });
        } catch (notificationError) {
          console.error('Failed to send notification:', notificationError);
        }
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      console.error("Error details:", {
        message: (error as Error)?.message,
        stack: (error as Error)?.stack,
        name: (error as Error)?.name
      });
      showNotificationMessage("Error posting comment");
    }
  };

  const handleReply = async (parentId: number) => {
    if (!user || !replyText.trim()) return;

    const supabase = getSupabaseClient();

    try {
      let profile = null;
      try {
        const profileResponse = await fetch('/api/ensure-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email,
          }),
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          profile = profileData.profile;
        }
      } catch (profileError) {
        console.error('Failed to ensure profile:', profileError);
      }

      const { data, error } = await supabase
        .from('comments')
        .insert({
          article_id: articleId,
          user_id: user.id,
          parent_id: parentId,
          content: replyText.trim()
        })
        .select()
        .single();

      if (error) throw error;

      // Add reply to the parent comment
      setComments(prev => prev.map(comment =>
        comment.id === parentId
          ? { ...comment, replies: [...(comment.replies || []), { 
              ...data, 
              profiles: { 
                email: profile?.email || user.email, 
                full_name: profile?.full_name || user.user_metadata?.full_name || user.email 
              } 
            }] }
          : comment
      ));

      setReplyText("");
      setReplyingTo(null);

      showNotificationMessage("Reply posted successfully!");

      // Send notification to article author
      if (article?.authorEmail && article.authorEmail !== user.email) {
        try {
          await fetch('/api/send-notification', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userEmail: article.authorEmail,
              articleTitle: article.title,
              articleId: articleId,
              likerName: user.user_metadata?.full_name || user.email,
              type: 'comment'
            }),
          });
        } catch (notificationError) {
          console.error('Failed to send notification:', notificationError);
        }
      }
    } catch (error) {
      console.error("Error posting reply:", error);
      console.error("Reply error details:", {
        message: (error as Error)?.message,
        stack: (error as Error)?.stack,
        name: (error as Error)?.name
      });
      showNotificationMessage("Error posting reply");
    }
  };

  const shareArticle = async () => {
    if (!article) return;

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
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotificationMessage("Link copied to clipboard");
  };

  const showNotificationMessage = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  if (loading || !article) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Article Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-64 object-cover"
          />
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>
            <div className="flex items-center justify-between mb-6">
              <div className="text-gray-600">
                <p className="font-medium">By {article.author}</p>
                <p className="text-sm">{article.date}</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    likedArticles.has(article.id)
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>👍</span>
                  <span>{article.likes} {likedArticles.has(article.id) ? 'Unlike' : 'Like'}</span>
                </button>

                <button
                  onClick={shareArticle}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <span>📤</span>
                  <span>Share</span>
                </button>
              </div>
            </div>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">{article.content}</p>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Comments ({comments.length})</h2>

          {/* Add Comment */}
          <div className="mb-8">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
            />
            <button
              onClick={handleComment}
              disabled={!newComment.trim()}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Post Comment
            </button>
          </div>

          {/* Comments List */}
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="border-l-4 border-blue-500 pl-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900">
                      {comment.profiles?.full_name || comment.profiles?.email || 'Anonymous'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Reply
                  </button>
                </div>
                <p className="text-gray-700 mb-4">{comment.content}</p>

                {/* Reply Form */}
                {replyingTo === comment.id && (
                  <div className="mb-4 ml-6">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a reply..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={3}
                    />
                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={() => handleReply(comment.id)}
                        disabled={!replyText.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        Reply
                      </button>
                      <button
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText("");
                        }}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-6 space-y-4">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="border-l-2 border-gray-300 pl-4">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {reply.profiles?.full_name || reply.profiles?.email || 'Anonymous'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(reply.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notification */}
      {showNotification && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
          {notificationMessage}
        </div>
      )}
    </div>
  );
}
