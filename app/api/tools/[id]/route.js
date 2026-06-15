import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { getUserRole } from '@/utils/auth';
import { createClient } from '@/utils/supabase/server';

// GET /api/tools/[id]
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'Nástroj nenalezen' }, { status: 404 });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/tools/[id]
export async function PUT(request, { params }) {
  try {
    const role = await getUserRole();
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Přístup odepřen: Nejste admin.' }, { status: 403 });
    }
    const supabaseServer = await createClient();

    const { id } = await params;
    const body = await request.json();

    const { data, error } = await supabaseServer
      .from('tools')
      .update({
        name: body.name,
        description: body.description,
        category: body.category,
        pricing_model: body.pricing_model,
        tips: body.tips,
        website_url: body.website_url,
        license_type: body.license_type,
        data_policy: body.data_policy,
        gdpr_compliant: body.gdpr_compliant,
        data_retention: body.data_retention,
        security_notes: body.security_notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase Update Error:', error);
      return NextResponse.json({ error: 'DB chyba: ' + error.message, details: error }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('Server Error in PUT:', error);
    return NextResponse.json({ error: 'Server chyba: ' + error.message }, { status: 500 });
  }
}

// DELETE /api/tools/[id]
export async function DELETE(request, { params }) {
  try {
    const role = await getUserRole();
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Přístup odepřen' }, { status: 403 });
    }
    const supabaseServer = await createClient();

    const { id } = await params;
    const { error } = await supabaseServer
      .from('tools')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/tools/[id]
export async function PATCH(request, { params }) {
  try {
    const role = await getUserRole();
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Přístup odepřen' }, { status: 403 });
    }
    const supabaseServer = await createClient();

    const { id } = await params;
    const body = await request.json();

    if (body.action === 'approve') {
      const { data, error } = await supabaseServer
        .from('tools')
        .update({ status: 'approved' })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return NextResponse.json(data);
    }
    
    return NextResponse.json({ error: 'Neznámá akce' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
