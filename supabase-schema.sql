-- Supabase Database Schema for Article Management System

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'user');

-- Create users table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create articles table
CREATE TABLE public.articles (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create likes table
CREATE TABLE public.likes (
  id SERIAL PRIMARY KEY,
  article_id INTEGER REFERENCES public.articles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(article_id, user_id)
);

-- Create comments table
CREATE TABLE public.comments (
  id SERIAL PRIMARY KEY,
  article_id INTEGER REFERENCES public.articles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  parent_id INTEGER REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create notifications table
CREATE TABLE public.notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'like', 'comment', 'new_article'
  message TEXT NOT NULL,
  related_article_id INTEGER REFERENCES public.articles(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for articles
CREATE POLICY "Anyone can view articles" ON public.articles
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create articles" ON public.articles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authors can update their articles" ON public.articles
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Admins can delete articles" ON public.articles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for likes
CREATE POLICY "Anyone can view likes" ON public.likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage their likes" ON public.likes
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for comments
CREATE POLICY "Anyone can view comments" ON public.comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON public.comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their comments" ON public.comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete comments" ON public.comments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for notifications
CREATE POLICY "Users can view their notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Functions and Triggers

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to notify on new article
CREATE OR REPLACE FUNCTION public.notify_new_article()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, message, related_article_id)
  SELECT
    p.id,
    'new_article',
    'New article posted: ' || NEW.title,
    NEW.id
  FROM public.profiles p
  WHERE p.id != NEW.author_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new article notifications
CREATE TRIGGER on_article_created
  AFTER INSERT ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_article();

-- Function to notify on like
CREATE OR REPLACE FUNCTION public.notify_like()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, message, related_article_id)
  SELECT
    a.author_id,
    'like',
    (SELECT p.full_name || ' liked your article: ' || a.title FROM public.profiles p WHERE p.id = NEW.user_id),
    NEW.article_id
  FROM public.articles a
  WHERE a.id = NEW.article_id AND a.author_id != NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for like notifications
CREATE TRIGGER on_like_created
  AFTER INSERT ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.notify_like();

-- Function to notify on comment
CREATE OR REPLACE FUNCTION public.notify_comment()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, message, related_article_id)
  SELECT
    a.author_id,
    'comment',
    (SELECT p.full_name || ' commented on your article: ' || a.title FROM public.profiles p WHERE p.id = NEW.user_id),
    NEW.article_id
  FROM public.articles a
  WHERE a.id = NEW.article_id AND a.author_id != NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for comment notifications
CREATE TRIGGER on_comment_created
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.notify_comment();

-- Sample data will be inserted after users sign up
-- INSERT INTO public.articles (title, content, excerpt, author_id, image_url) VALUES
-- ('Getting Started with React Hooks', 'React Hooks provide a powerful way to use state and other React features without writing class components. In this article, we''ll explore the basics of useState, useEffect, and other essential hooks that will improve your React development workflow.', 'Learn how to use React Hooks to manage state and side effects in your functional components.', (SELECT id FROM auth.users LIMIT 1), 'https://images.unsplash.com/photo-1633356122544-f134ef2e541c?w=500&h=300&fit=crop'),
-- ('Mastering Tailwind CSS', 'Tailwind CSS has revolutionized the way we write CSS. With its utility-first approach and extensive customization options, you can build any design without leaving your HTML. This guide covers everything from installation to advanced configuration.', 'A comprehensive guide to building beautiful UI components with Tailwind CSS utility-first approach.', (SELECT id FROM auth.users LIMIT 1), 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop'),
-- ('Next.js 14: What''s New', 'Next.js 14 brings significant improvements to the developer experience with better performance, new features, and improved tooling. From enhanced Server Components to better error handling, this release is packed with useful additions.', 'Explore the latest features and improvements in Next.js 14 including App Router and Server Components.', (SELECT id FROM auth.users LIMIT 1), 'https://images.unsplash.com/photo-1627398242454-45a570e50e0a?w=500&h=300&fit=crop'),
-- ('Web Performance Optimization Tips', 'Performance is critical for user experience and SEO. Learn about Core Web Vitals, image optimization, code splitting, and other techniques to make your website faster and more responsive.', 'Essential techniques to optimize your website for faster loading times and better user experience.', (SELECT id FROM auth.users LIMIT 1), 'https://images.unsplash.com/photo-1460925895917-adf4198c5b7b?w=500&h=300&fit=crop');