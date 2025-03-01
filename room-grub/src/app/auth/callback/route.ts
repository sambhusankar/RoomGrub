import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest): Promise<NextResponse> {
    console.log('inside /auth/callback');
    console.log(request.url);

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/orgs';
    const room_id = searchParams.get('room_id') ?? 'orgs';

    if (code) {
        // Create the Supabase client with cookie management support
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { cookies }  // Use next/headers cookies helper for automatic handling
        );

        console.log('next', next);

        // Exchange the code for a Supabase session
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
            console.error('Error exchanging code for session:', exchangeError);
            return NextResponse.redirect(`/login?message=Could not exchange code for session`);
        }

        // Retrieve the current session after exchanging the code
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !sessionData?.session) {
            console.error('Session retrieval error:', sessionError);
            return NextResponse.redirect('/login?message=Could not retrieve user session');
        }

        const user = sessionData.session.user;
        console.log('User:', user);

        // Redirect to the appropriate page after successful login
        const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/${room_id}`;
        console.log('Redirecting to:', redirectUrl);
        return NextResponse.redirect(redirectUrl);
    }

    // Fallback redirect if code is missing
    return NextResponse.redirect(`/login?message=Could not login with provider`);
}
