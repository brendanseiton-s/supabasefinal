// Sample articles data
export const SAMPLE_ARTICLES = [
  {
    id: 1,
    title: "Getting Started with React Hooks",
    author: "John Doe",
    date: "2024-01-15",
    excerpt: "Learn how to use React Hooks to manage state and side effects in your functional components.",
    content: "React Hooks provide a powerful way to use state and other React features without writing class components. In this article, we'll explore the basics of useState, useEffect, and other essential hooks that will improve your React development workflow.",
    likes: 0,
    comments: 12,
    image: "https://images.unsplash.com/photo-1633356122544-f134ef2e541c?w=500&h=300&fit=crop"
  },
  {
    id: 2,
    title: "Mastering Tailwind CSS",
    author: "Jane Smith",
    date: "2024-01-12",
    excerpt: "A comprehensive guide to building beautiful UI components with Tailwind CSS utility-first approach.",
    content: "Tailwind CSS has revolutionized the way we write CSS. With its utility-first approach and extensive customization options, you can build any design without leaving your HTML. This guide covers everything from installation to advanced configuration.",
    likes: 0,
    comments: 8,
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop"
  },
  {
    id: 3,
    title: "Next.js 14: What's New",
    author: "Mike Johnson",
    date: "2024-01-10",
    excerpt: "Explore the latest features and improvements in Next.js 14 including App Router and Server Components.",
    content: "Next.js 14 brings significant improvements to the developer experience with better performance, new features, and improved tooling. From enhanced Server Components to better error handling, this release is packed with useful additions.",
    likes: 0,
    comments: 24,
    image: "https://images.unsplash.com/photo-1627398242454-45a570e50e0a?w=500&h=300&fit=crop"
  },
  {
    id: 4,
    title: "Web Performance Optimization Tips",
    author: "Sarah Wilson",
    date: "2024-01-08",
    excerpt: "Essential techniques to optimize your website for faster loading times and better user experience.",
    content: "Performance is critical for user experience and SEO. Learn about Core Web Vitals, image optimization, code splitting, and other techniques to make your website faster and more responsive.",
    likes: 0,
    comments: 9,
    image: "https://images.unsplash.com/photo-1460925895917-adf4198c5b7b?w=500&h=300&fit=crop"
  },
  {
    id: 5,
    title: "TypeScript Best Practices",
    author: "Alex Chen",
    date: "2024-01-05",
    excerpt: "Write better, more maintainable code with TypeScript best practices and advanced type patterns.",
    content: "TypeScript helps catch bugs before they reach production. Discover best practices for type definitions, generics, interfaces, and utility types that will make your code more robust and easier to maintain.",
    likes: 0,
    comments: 16,
    image: "https://images.unsplash.com/photo-1517694712169-ab089516e594?w=500&h=300&fit=crop"
  }
];

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
