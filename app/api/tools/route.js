import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { getUserRole } from '@/utils/auth';
import { createClient } from '@/utils/supabase/server';

// GET /api/tools - list all tools
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const pricing = searchParams.get('pricing');
    const status = searchParams.get('status') || 'approved';

    let query = supabase.from('tools').select('*').order('name');
    
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (category && category !== 'Vše') {
      query = query.eq('category', category);
    }
    if (pricing && pricing !== 'Vše') {
      query = query.eq('pricing_model', pricing);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/tools - create new tool
export async function POST(request) {
  try {
    const role = await getUserRole();
    const supabaseServer = await createClient();
    const body = await request.json();
    
    const { data, error } = await supabaseServer
      .from('tools')
      .insert([{
        name: body.name,
        description: body.description,
        category: body.category,
        pricing_model: body.pricing_model,
        tips: body.tips,
        website_url: body.website_url,
        license_type: body.license_type,
        data_policy: body.data_policy,
        gdpr_compliant: body.gdpr_compliant ?? false,
        data_retention: body.data_retention,
        security_notes: body.security_notes,
        status: role === 'admin' ? 'approved' : 'pending',
        request_reason: role === 'admin' ? null : body.request_reason,
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
