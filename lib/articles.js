// Database functions for articles
import { getSupabaseClient } from './supabaseClient';

export const getArticles = async () => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      profiles:author_id (email, full_name),
      likes (count)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching articles:', error);
    return [];
  }

  return data.map(article => ({
    id: article.id,
    title: article.title,
    author: article.profiles?.full_name || article.profiles?.email || 'Unknown',
    authorEmail: article.profiles?.email || '',
    date: new Date(article.created_at).toLocaleDateString(),
    excerpt: article.excerpt,
    content: article.content,
    likes: article.likes?.[0]?.count || 0,
    image: article.image_url
  }));
};

export const getTopLikedArticles = async (limit = 5) => {
  const supabase = getSupabaseClient();

  // First, get like counts
  const { data: likeCounts, error: likeError } = await supabase
    .from('likes')
    .select('article_id');

  if (likeError) {
    console.error('Error fetching top articles:', likeError);
    return [];
  }

  // Count likes per article
  const counts = {};
  likeCounts.forEach(like => {
    counts[like.article_id] = (counts[like.article_id] || 0) + 1;
  });

  // Get top article IDs
  const topArticleIds = Object.entries(counts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, limit)
    .map(([id]) => parseInt(id));

  if (topArticleIds.length === 0) {
    return [];
  }

  // Get articles for top IDs
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      profiles:author_id (email, full_name)
    `)
    .in('id', topArticleIds);

  if (error) {
    console.error('Error fetching top articles:', error);
    return [];
  }

  // Map and sort by like count
  return data.map(article => ({
    id: article.id,
    title: article.title,
    author: article.profiles?.full_name || article.profiles?.email || 'Unknown',
    authorEmail: article.profiles?.email || '',
    date: new Date(article.created_at).toLocaleDateString(),
    excerpt: article.excerpt,
    content: article.content,
    likes: counts[article.id] || 0,
    image: article.image_url
  })).sort((a, b) => b.likes - a.likes);
};

export const getArticleById = async (id) => {
  const supabase = getSupabaseClient();

  // Get article
  const { data: articleData, error: articleError } = await supabase
    .from('articles')
    .select(`
      *,
      profiles:author_id (email, full_name)
    `)
    .eq('id', id)
    .single();

  if (articleError) {
    console.error('Error fetching article:', articleError);
    return null;
  }

  // Get like count
  const { data: likeData, error: likeError } = await supabase
    .from('likes')
    .select('id')
    .eq('article_id', id);

  if (likeError) {
    console.error('Error fetching likes:', likeError);
    return null;
  }

  return {
    id: articleData.id,
    title: articleData.title,
    author: articleData.profiles?.full_name || articleData.profiles?.email || 'Unknown',
    authorEmail: articleData.profiles?.email || '',
    date: new Date(articleData.created_at).toLocaleDateString(),
    excerpt: articleData.excerpt,
    content: articleData.content,
    likes: likeData.length,
    image: articleData.image_url
  };
};

// Comment data structure
export const SAMPLE_COMMENTS = {
  1: [
    { id: 1, author: "Alex", text: "Great article! Very helpful.", likes: 5, replies: [] }
  ],
  2: [
    { id: 1, author: "Jordan", text: "Love the Tailwind examples!", likes: 3, replies: [] }
  ],
  3: [
    { id: 1, author: "Casey", text: "Really excited about these features!", likes: 8, replies: [] }
  ],
  4: [
    { id: 1, author: "Morgan", text: "Useful tips for performance.", likes: 2, replies: [] }
  ],
  5: [
    { id: 1, author: "Parker", text: "Perfect reference guide!", likes: 6, replies: [] }
  ]
};