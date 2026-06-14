import { supabase } from '@/lib/supabase';
import { getGeminiModel } from '@/lib/gemini';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

    // Read GDPR law text
    const gdprFilePath = path.join(process.cwd(), 'lib', 'gdpr.txt');
    let gdprText = '';
    try {
      gdprText = fs.readFileSync(gdprFilePath, 'utf8');
    } catch (err) {
      console.warn('Could not read gdpr.txt');
    }

    const prompt = `Jsi bezpečnostní expert pro firemní data (GDPR, NDA, ochrana osobních údajů). Analyzuj následující situaci a vyhodnoť bezpečnostní rizika.
Při hodnocení se PŘÍSNĚ řiď následujícím Zákonem o zpracování osobních údajů (GDPR):
--- TEXT ZÁKONA GDPR ---
${gdprText}
-------------------------

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
  "summary": "Krátké shrnutí verdiktu (1-2 věty) s odkazem na zákon.",
  "sensitive_data": ["seznam identifikovaných citlivých dat v záměru uživatele"],
  "risks": ["seznam konkrétních rizik z pohledu zákona"],
  "gdpr_analysis": "Detailní analýza z hlediska konkrétních paragrafů a zásad GDPR uvedených v textu zákona.",
  "recommendations": ["seznam doporučení pro bezpečné použití"]
}

Pravidla pro hodnocení:
- "dangerous": Data obsahují osobní údaje (e-maily, jména, RČ, telefony) A nástroj není GDPR compliant nebo data používá pro trénink. Porušení zásad zákona!
- "risky": Data mohou obsahovat citlivé informace A existují určitá bezpečnostní omezení
- "safe": Data neobsahují citlivé informace NEBO nástroj je plně GDPR compliant s izolací dat

Odpověz POUZE validním JSON objektem, žádný markdown, žádné code blocks.`;

    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

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
