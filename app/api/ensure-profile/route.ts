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
    const { id, email, full_name } = await request.json();

    if (!id || !email) {
      return NextResponse.json(
        { error: 'Missing profile id or email' },
        { status: 400 }
      );
    }

    const { data: existingProfile, error: selectError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', id)
      .maybeSingle();

    if (selectError) {
      console.error('Error checking profile:', selectError);
      return NextResponse.json(
        { error: 'Failed to check profile' },
        { status: 500 }
      );
    }

    if (existingProfile) {
      return NextResponse.json({ profile: existingProfile });
    }

    const { data: insertedProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id,
        email,
        full_name: full_name || email
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating profile:', insertError);
      return NextResponse.json(
        { error: 'Failed to create profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile: insertedProfile });
  } catch (error) {
    console.error('Error in ensure-profile route:', error);
    return NextResponse.json(
      { error: 'Failed to ensure profile' },
      { status: 500 }
    );
  }
}
