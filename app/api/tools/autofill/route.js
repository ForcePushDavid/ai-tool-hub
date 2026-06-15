import { getGeminiModel } from '@/lib/gemini';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { name } = await request.json();

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Zadejte název nástroje.' }, { status: 400 });
    }

    const prompt = `Jsi expert na AI nástroje. Na základě názvu AI nástroje vyplň strukturované informace.

NÁZEV NÁSTROJE: "${name}"

Odpověz POUZE validním JSON objektem (žádný markdown, žádné code blocks):
{
  "description": "Stručný popis nástroje v češtině (2-3 věty, co umí, k čemu slouží)",
  "category": "PŘESNĚ jedna z: Text / Konverzace | Obrázky | Video | Audio | Kód | Prezentace | Produktivita | Marketing",
  "pricing_model": "PŘESNĚ jedna z: Free | Freemium | Paid | Enterprise",
  "tips": "3 praktické tipy pro efektivní použití, každý na nový řádek",
  "website_url": "Oficiální URL adresa nástroje",
  "license_type": "PŘESNĚ jedna z: Osobní | Firemní | Obojí | Open Source",
  "data_policy": "Jak nástroj nakládá s uživatelskými daty (1-2 věty)",
  "gdpr_compliant": true nebo false,
  "data_retention": "Jak dlouho uchovává data",
  "security_notes": "Bezpečnostní poznámky a doporučení (1-2 věty)"
}

Pokud nástroj neznáš, vymysli rozumné hodnoty na základě názvu. Odpověz POUZE JSON.`;

    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    let data;
    try {
      const jsonStr = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      data = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json({ error: 'AI nedokázalo zpracovat odpověď.' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Autofill error:', error);
    return NextResponse.json({ error: 'Chyba při AI generování.' }, { status: 500 });
  }
}
