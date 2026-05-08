'use server';

import { createClient } from '@/utils/supabase/server';

export async function upsertUser(code?: string) {
    const supabase = await createClient();

    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) return { success: false, isNew: false };
    }

    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return { success: false, isNew: false };

    const { data: existing } = await supabase
        .from('Users').select('id').eq('uid', user.id);

    if (existing && existing.length > 0) return { success: true, isNew: false };

    const { error: insertError } = await supabase.from('Users').insert({
        uid: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        profile: user.user_metadata?.avatar_url,
    });

    if (insertError) return { success: false, isNew: false };
    return { success: true, isNew: true };
}
