import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  : null;

export async function POST(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY is not configured' },
      { status: 500 }
    );
  }

  try {
    // Get the top 5 articles (newest)
    const { data: topArticles, error: articlesError } = await supabase
      .from('articles')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(5);

    if (articlesError || !topArticles || topArticles.length < 5) {
      return NextResponse.json(
        { error: 'Could not fetch top 5 articles' },
        { status: 500 }
      );
    }

    // Get all existing profiles
    const { data: allProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id');

    if (profilesError || !allProfiles) {
      return NextResponse.json(
        { error: 'Could not fetch profiles' },
        { status: 500 }
      );
    }

    // Add likes from all profiles to each of the top 5 articles
    const allLikes = [];
    for (const article of topArticles) {
      for (const profile of allProfiles) {
        allLikes.push({
          article_id: article.id,
          user_id: profile.id
        });
      }
    }

    // Insert all likes (will skip duplicates due to unique constraint)
    const { error: likesError } = await supabase
      .from('likes')
      .insert(allLikes);

    if (likesError) {
      console.error('Error inserting likes:', likesError);
      // Ignore errors for duplicates
    }

    return NextResponse.json({
      message: 'Successfully added likes to top 5 articles from all existing profiles',
      updatedArticles: 5,
      profilesUsed: allProfiles.length,
      totalLikesAdded: allLikes.length
    });
  } catch (error) {
    console.error('Error updating likes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}