import { getGeminiModel } from '@/lib/gemini';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { name } = await request.json();

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Zadejte název nástroje.' }, { status: 400 });
    }

    const prompt = `Jsi expert na AI nástroje. Uživatel zadal název nástroje, který chce přidat do firemního katalogu.

NÁZEV NÁSTROJE: "${name}"

TVŮJ ÚKOL:
1. Zhodnoť, zda tento AI nástroj skutečně existuje a znáš ho.
2. Pokud jde o zjevnou chybu, překlep, nebo neexistující nástroj (např. náhodná písmena), odpověz POUZE takto: {"error": "unknown_tool"}
3. Pokud nástroj znáš, vyplň základní informace. NEVYPLŇUJ bezpečnostní údaje (data_policy, gdpr_compliant, data_retention, security_notes), ty musí vyplnit uživatel ručně.

Odpověz POUZE validním JSON objektem:
{
  "description": "Stručný popis nástroje v češtině (2-3 věty, co umí, k čemu slouží)",
  "category": "PŘESNĚ jedna z: Text / Konverzace | Obrázky | Video | Audio | Kód | Prezentace | Produktivita | Marketing",
  "pricing_model": "PŘESNĚ jedna z: Free | Freemium | Paid | Enterprise",
  "tips": "3 praktické tipy pro efektivní použití, každý na nový řádek",
  "website_url": "Oficiální URL adresa nástroje",
  "license_type": "PŘESNĚ jedna z: Osobní | Firemní | Obojí | Open Source"
}`;

    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    let data;
    try {
      const jsonStr = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      data = JSON.parse(jsonStr);
      
      if (data.error === 'unknown_tool') {
        return NextResponse.json({ error: 'Nástroj neznám. Prosím, vyplňte údaje ručně pro zachování přesnosti katalogu.' }, { status: 404 });
      }
    } catch {
      return NextResponse.json({ error: 'AI nedokázalo zpracovat odpověď.' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Autofill error:', error);
    return NextResponse.json({ error: 'Chyba při AI generování.' }, { status: 500 });
  }
}
