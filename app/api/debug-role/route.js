import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // 1. Kdo je přihlášený?
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      return NextResponse.json({ step: 'auth', error: userError.message });
    }
    
    if (!user) {
      return NextResponse.json({ step: 'auth', error: 'Žádný přihlášený uživatel' });
    }

    // 2. Existuje profil?
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return NextResponse.json({
      user_id: user.id,
      user_email: user.email,
      profile_found: !!profile,
      profile_data: profile,
      profile_error: profileError?.message || null,
      role_detected: profile?.role || 'employee (default)',
    });
  } catch (error) {
    return NextResponse.json({ step: 'crash', error: error.message });
  }
}
