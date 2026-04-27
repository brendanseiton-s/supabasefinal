# ArticleHub - Article Management System

A comprehensive article management system built with Next.js, Supabase, and Tailwind CSS featuring user roles, real-time likes, comments, notifications, and admin controls.

## Features

### User Management
- **Two User Roles**: Admin and Regular User
- **Separate Login Pages**: Dedicated login for admins and users
- **Role-based Access Control**: Different permissions and dashboards

### Article Features
- **Asynchronous Likes**: Like articles without page refresh
- **Facebook-style Comments**: Post comments and replies in real-time
- **Top 5 Most Liked Articles**: Display popular articles on homepage
- **Shareable Articles**: Share via Web Share API or clipboard
- **Article Management**: Create, read, update, delete articles

### Notifications
- **Email Notifications**: Receive emails for likes and new articles
- **In-app Notifications**: Real-time notification system
- **Automatic Notifications**: Triggered by user actions

### Admin Controls
- **User Management**: View and manage all users
- **Article Management**: Create, edit, and delete articles
- **Comment Moderation**: Delete inappropriate comments
- **Notification Overview**: Monitor system notifications

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Email**: Resend API
- **Icons**: Lucide React
- **Deployment**: Vercel

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Email (Resend)
RESEND_API_KEY=your_resend_api_key

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Run the SQL script from `supabase-schema.sql` to create all tables and functions
4. Update your environment variables with the Supabase credentials

### 3. Email Setup (Resend)

1. Create an account at [resend.com](https://resend.com)
2. Get your API key
3. Add it to your environment variables
4. Verify your domain in Resend (replace `yourdomain.com` in the code)

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### 6. Create Admin User

1. Sign up as a regular user first
2. In Supabase dashboard, go to Table Editor
3. Find the `profiles` table
4. Change the `role` column from 'user' to 'admin' for your user

## Database Schema

The system uses the following main tables:

- `profiles`: User profiles with roles
- `articles`: Article content and metadata
- `likes`: User likes on articles
- `comments`: Comments and replies on articles
- `notifications`: User notifications

## API Routes

- `POST /api/send-notification`: Send like notifications
- `POST /api/new-article-notification`: Send new article notifications to all users

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Make sure to set all environment variables in your deployment platform:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_SITE_URL` (your production URL)

## Usage

### For Regular Users
1. Sign up/Login at `/login`
2. Browse articles at `/articles`
3. Like articles and leave comments
4. Receive notifications via email

### For Admins
1. Login at `/admin-login`
2. Access admin dashboard at `/admin`
3. Create new articles
4. Manage users, articles, and comments

## Features in Detail

### Asynchronous Likes
- Likes update instantly without page refresh
- Real-time count updates
- Persistent across sessions

### Comments System
- Facebook-style threaded comments
- Real-time comment posting
- Reply to comments
- User attribution

### Notifications
- Email notifications for likes
- Broadcast emails for new articles
- In-app notification badges
- Database-backed notification storage

### Admin Features
- User role management
- Article CRUD operations
- Comment moderation
- System statistics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
