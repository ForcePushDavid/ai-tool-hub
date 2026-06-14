import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { toolId, userIntent } = await request.json();

    if (!toolId || !userIntent) {
      return NextResponse.json(
        { error: 'Vyberte nástroj a popište svůj záměr.' },
        { status: 400 }
      );
    }

    // Fetch the specific tool
    const { data: tool, error } = await supabase
      .from('tools')
      .select('*')
      .eq('id', toolId)
      .single();

    if (error || !tool) {
      return NextResponse.json(
        { error: 'Nástroj nenalezen.' },
        { status: 404 }
      );
    }

    const prompt = `Jsi bezpečnostní expert pro firemní data (GDPR, NDA, ochrana osobních údajů). Analyzuj následující situaci a vyhodnoť bezpečnostní rizika.

NÁSTROJ: ${tool.name}
Kategorie: ${tool.category}
Cenový model: ${tool.pricing_model}
Typ licence: ${tool.license_type || 'Neuvedeno'}
GDPR kompatibilní: ${tool.gdpr_compliant ? 'Ano' : 'Ne / Neuvedeno'}
Datová politika: ${tool.data_policy || 'Neuvedeno'}
Bezpečnostní poznámky: ${tool.security_notes || 'Žádné'}
Uchovávání dat: ${tool.data_retention || 'Neuvedeno'}

ZÁMĚR UŽIVATELE: "${userIntent}"

Analyzuj a odpověz PŘESNĚ v tomto JSON formátu (nic jiného):
{
  "verdict": "safe" | "risky" | "dangerous",
  "verdict_label": "Bezpečné" | "Rizikové" | "Nebezpečné",
  "summary": "Krátké shrnutí verdiktu (1-2 věty)",
  "sensitive_data": ["seznam identifikovaných citlivých dat v záměru uživatele"],
  "risks": ["seznam konkrétních rizik"],
  "gdpr_analysis": "Analýza z hlediska GDPR",
  "recommendations": ["seznam doporučení pro bezpečné použití"]
}

Pravidla pro hodnocení:
- "dangerous": Data obsahují osobní údaje (e-maily, jména, RČ, telefony) A nástroj není GDPR compliant nebo data používá pro trénink
- "risky": Data mohou obsahovat citlivé informace A existují určitá bezpečnostní omezení
- "safe": Data neobsahují citlivé informace NEBO nástroj je plně GDPR compliant s izolací dat

Odpověz POUZE validním JSON objektem, žádný markdown, žádné code blocks.`;

    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "google/gemini-2.0-flash:free",
        "messages": [
          { role: "user", content: prompt }
        ]
      })
    });

    if (!openRouterResponse.ok) {
      const errText = await openRouterResponse.text();
      console.error('OpenRouter error:', errText);
      throw new Error(`OpenRouter API error: ${openRouterResponse.status}`);
    }

    const data = await openRouterResponse.json();
    const responseText = data.choices[0].message.content.trim();

    // Parse JSON from response (handle potential markdown wrapping)
    let analysis;
    try {
      const jsonStr = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', responseText);
      analysis = {
        verdict: 'risky',
        verdict_label: 'Nelze vyhodnotit',
        summary: 'Nepodařilo se provést automatickou analýzu. Doporučujeme manuální kontrolu.',
        sensitive_data: [],
        risks: ['Automatická analýza selhala'],
        gdpr_analysis: 'Nelze vyhodnotit automaticky.',
        recommendations: ['Konzultujte s bezpečnostním týmem před použitím.']
      };
    }

    return NextResponse.json({
      tool: {
        name: tool.name,
        category: tool.category,
        gdpr_compliant: tool.gdpr_compliant,
      },
      analysis,
    });
  } catch (error) {
    console.error('Security check error:', error);
    return NextResponse.json(
      { error: 'Chyba při bezpečnostní analýze. Zkuste to znovu.' },
      { status: 500 }
    );
  }
}
