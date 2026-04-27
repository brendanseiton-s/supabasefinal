import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
    // Get an existing profile id to use as author
    const { data: existingProfiles, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (profileError || !existingProfiles || existingProfiles.length === 0) {
      return NextResponse.json(
        { error: 'No existing profiles found. Please create a user first.' },
        { status: 400 }
      );
    }

    const authorId = existingProfiles[0].id;

    // Dummy user IDs for likes
    const dummyUserIds = [
      '11111111-1111-1111-1111-111111111111',
      '22222222-2222-2222-2222-222222222222',
      '33333333-3333-3333-3333-333333333333'
    ];

    // Create dummy user profiles
    for (const userId of dummyUserIds) {
      await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: `user${userId.slice(0,8)}@example.com`,
          full_name: `Dummy User ${userId.slice(0,8)}`,
          role: 'user'
        });
    }

    // Random articles data
    const articles = [
      {
        title: 'The Future of AI in Healthcare',
        excerpt: 'Exploring how artificial intelligence is revolutionizing medical diagnosis and treatment.',
        content: 'Artificial intelligence is transforming healthcare in unprecedented ways. From diagnostic imaging to personalized treatment plans, AI algorithms are helping doctors make more accurate decisions. Machine learning models can analyze vast amounts of medical data to identify patterns that might be invisible to human experts. This technology promises faster diagnoses, more effective treatments, and ultimately, better patient outcomes. As AI continues to evolve, we can expect to see even more innovative applications in the medical field.',
        image_url: 'https://picsum.photos/800/400?random=1'
      },
      {
        title: 'Sustainable Living Tips for Modern Families',
        excerpt: 'Practical advice for reducing your environmental impact while maintaining a comfortable lifestyle.',
        content: 'Sustainable living doesn\'t have to be complicated or expensive. Start with small changes like reducing plastic use, conserving energy, and choosing eco-friendly products. Composting food waste, using reusable bags and containers, and opting for public transportation or biking can make a significant difference. Many communities offer incentives for sustainable practices, such as rebates for solar panel installations or composting programs. By making conscious choices, families can contribute to a healthier planet while potentially saving money.',
        image_url: 'https://picsum.photos/800/400?random=2'
      },
      {
        title: 'The History of Space Exploration',
        excerpt: 'A journey through humanity\'s quest to understand the cosmos.',
        content: 'Space exploration has been a cornerstone of human curiosity and innovation since ancient times. From the first telescopes to modern spacecraft, our understanding of the universe has grown exponentially. Key milestones include the moon landing in 1969, the Voyager Golden Record, and the International Space Station. Today, private companies are joining government agencies in pushing the boundaries of what\'s possible. As we look to Mars and beyond, space exploration continues to inspire scientific discovery and technological advancement.',
        image_url: 'https://picsum.photos/800/400?random=3'
      },
      {
        title: 'Cooking with Exotic Ingredients',
        excerpt: 'Discover new flavors and culinary adventures from around the world.',
        content: 'Exploring exotic ingredients can transform your cooking and introduce you to new cultures. From saffron and cardamom to dragon fruit and yuzu, these unique items add depth and excitement to meals. Learning to use them properly is key to unlocking their full potential. Start with simple recipes and gradually incorporate more complex flavors. Not only will your dishes taste amazing, but you\'ll also gain a deeper appreciation for global cuisine and the stories behind these ingredients.',
        image_url: 'https://picsum.photos/800/400?random=4'
      },
      {
        title: 'Mental Health in the Digital Age',
        excerpt: 'Navigating the impact of technology on our psychological well-being.',
        content: 'The digital age has brought unprecedented connectivity but also new challenges for mental health. Social media, constant notifications, and information overload can contribute to anxiety and depression. However, technology also offers solutions like mental health apps, online therapy, and support communities. Finding balance is crucial – setting boundaries, practicing mindfulness, and maintaining real-world connections are essential strategies. As we continue to integrate technology into our lives, prioritizing mental health becomes increasingly important.',
        image_url: 'https://picsum.photos/800/400?random=5'
      },
      {
        title: 'Renewable Energy Innovations',
        excerpt: 'Cutting-edge technologies shaping the future of clean energy.',
        content: 'Renewable energy is evolving rapidly with new technologies making clean power more efficient and affordable. Solar panels, wind turbines, and battery storage systems are becoming more advanced. Innovations like floating solar farms and artificial photosynthesis show promise for scaling up renewable energy production. Governments and businesses worldwide are investing heavily in these technologies, driving down costs and increasing adoption. The transition to renewable energy is not just environmentally necessary but also economically beneficial.',
        image_url: 'https://picsum.photos/800/400?random=6'
      },
      {
        title: 'Hidden Travel Destinations for 2024',
        excerpt: 'Uncover lesser-known gems that offer authentic cultural experiences.',
        content: 'While popular tourist destinations have their appeal, hidden gems offer more authentic and less crowded experiences. Places like Faroe Islands, Bhutan, or the Azores provide stunning natural beauty and rich cultural heritage without the tourist hustle. Planning trips to these locations requires more research but rewards travelers with unique memories. Supporting local communities and sustainable tourism practices ensures these destinations remain pristine for future visitors.',
        image_url: 'https://picsum.photos/800/400?random=7'
      },
      {
        title: 'The Art of Street Photography',
        excerpt: 'Capturing the essence of urban life through candid moments.',
        content: 'Street photography is about observing and capturing the spontaneity of everyday life in public spaces. It requires patience, quick reflexes, and an eye for composition. Learning to see interesting moments and light conditions is key to creating compelling images. Ethical considerations are important – respecting people\'s privacy and cultural norms. With practice, street photography becomes a meditative practice that deepens your connection to your surroundings and fellow humans.',
        image_url: 'https://picsum.photos/800/400?random=8'
      },
      {
        title: 'Financial Planning for Beginners',
        excerpt: 'Essential steps to build a secure financial future.',
        content: 'Financial planning doesn\'t have to be intimidating. Start by creating a budget, building an emergency fund, and understanding your income and expenses. Learning about investing, debt management, and retirement planning early can set you up for long-term success. Many free resources are available online, and consulting with a financial advisor can provide personalized guidance. Remember, financial literacy is a lifelong journey that empowers you to make informed decisions about your money.',
        image_url: 'https://picsum.photos/800/400?random=9'
      },
      {
        title: 'Climate Change Solutions We Can Implement Today',
        excerpt: 'Practical actions individuals can take to combat climate change.',
        content: 'Climate change is a global challenge that requires action at all levels. Individuals can make a difference through daily choices like reducing meat consumption, using energy-efficient appliances, and supporting sustainable brands. Community involvement, such as participating in local clean-up efforts or advocating for policy changes, amplifies impact. Education and awareness are crucial for driving systemic change. By taking responsibility for our actions, we contribute to a more sustainable future for generations to come.',
        image_url: 'https://picsum.photos/800/400?random=10'
      }
    ];

    // Insert articles
    const insertedArticles = [];
    for (const article of articles) {
      const { data, error } = await supabase
        .from('articles')
        .insert({
          title: article.title,
          content: article.content,
          excerpt: article.excerpt,
          author_id: authorId,
          image_url: article.image_url
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error inserting article:', error);
        return NextResponse.json(
          { error: 'Failed to insert article' },
          { status: 500 }
        );
      }

      insertedArticles.push(data);
    }

    // Add likes to the first 5 articles (featured)
    for (let i = 0; i < 5; i++) {
      const articleId = insertedArticles[i].id;
      for (const userId of dummyUserIds) {
        await supabase
          .from('likes')
          .insert({
            article_id: articleId,
            user_id: userId
          });
      }
    }

    return NextResponse.json({
      message: 'Successfully seeded 10 articles with top 5 featured',
      articlesCount: 10,
      featuredCount: 5
    });
  } catch (error) {
    console.error('Error seeding articles:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}