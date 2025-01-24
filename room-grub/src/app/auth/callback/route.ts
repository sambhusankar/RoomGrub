import 'server-only';
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { type CookieOptions, createServerClient } from '@supabase/ssr'

export async function GET(request: Request) {
    console.log('inside /auth/callback');
    console.log(request.url);
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/orgs'
    const room_id = searchParams.get('room_id') ?? 'orgs'

    if (code) {
        const cookieStore = cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        cookieStore.set({ name, value, ...options })
                    },
                    remove(name: string, options: CookieOptions) {
                        cookieStore.delete({ name, ...options })
                    },
                },
            }
        )
        console.log('\n\n\n\n---------------');
        console.log('origin',origin);
        console.log('next',next);
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        console.log('error',error);

        if (!error) {
            // return redirect("https://costing.imgears.com/orgs");
            const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/${room_id}`;
            console.log('Redirecting to:', redirectUrl);
            return new Response(null, { status: 302, headers: { Location: redirectUrl } });
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/orgs`);

            // return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}${next}`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?message=Could not login with provider`)
}