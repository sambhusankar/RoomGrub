import { NextRequest, NextResponse } from 'next/server'
import { type CookieOptions, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
    console.log('inside /auth/callback');
    console.log(request.url);

    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/orgs'
    const room_id = searchParams.get('room_id') ?? 'orgs'

    if (code) {
        // Use request.cookies.get() instead of cookies()
        const cookieStore = request.cookies;

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value || '';
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        cookieStore.set(name, value);
                    },
                    remove(name: string, options: CookieOptions) {
                        cookieStore.delete(name);
                    },
                },
            }
        );

        console.log('\n\n\n\n---------------');
        console.log('origin', origin);
        console.log('next', next);
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        console.log('error', error);

        if (!error) {
            const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/${room_id}`;
            console.log('Redirecting to:', redirectUrl);
            return NextResponse.redirect(redirectUrl);
        }
    }

    return NextResponse.redirect(`${origin}/login?message=Could not login with provider`);
}
