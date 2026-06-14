import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { message, history } = await request.json();

    // Fetch ALL current tools from database (live data!)
    const { data: tools, error } = await supabase
      .from('tools')
      .select('*')
      .order('name');

    if (error) throw error;

    // Build context from live catalog data
    const catalogContext = tools.map(tool => (
      `NÁSTROJ: ${tool.name}
` +
      `Kategorie: ${tool.category}
` +
      `Popis: ${tool.description}
` +
      `Cenový model: ${tool.pricing_model}
` +
      `Typ licence: ${tool.license_type || 'Neuvedeno'}
` +
      `GDPR: ${tool.gdpr_compliant ? 'Ano' : 'Ne/Neuvedeno'}
` +
      `Datová politika: ${tool.data_policy || 'Neuvedeno'}
` +
      `Tipy: ${tool.tips || 'Žádné'}
` +
      `Web: ${tool.website_url || 'Neuvedeno'}
` +
      `---`
    )).join('\n');

    const systemPrompt = `Jsi AI asistent pro firemní katalog AI nástrojů (AI Tool Hub). Tvoje role:

1. Odpovídáš POUZE na základě dat z katalogu níže. Pokud informaci v katalogu nemáš, řekni to.
2. Pomáháš uživatelům vybrat správný nástroj pro jejich potřeby.
3. Informuješ o licencích, cenách a bezpečnosti nástrojů.
4. Odpovídáš vždy v češtině, stručně ale přesně.
5. Pokud se uživatel ptá na nástroj, který v katalogu není, řekni mu, že tento nástroj v katalogu nemáme.

AKTUÁLNÍ KATALOG (${tools.length} nástrojů):
${catalogContext}

Důležité: Tyto údaje jsou aktuální data z databáze. Odpovídej výhradně na jejich základě.`;

    // Build conversation history for context
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'assistant', content: 'Rozumím. Jsem AI asistent pro firemní katalog AI nástrojů. Odpovídám na základě aktuálních dat z katalogu. Jak vám mohu pomoci?' },
      ...(history || []).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "google/gemini-2.0-flash:free",
        "messages": messages
      })
    });

    if (!openRouterResponse.ok) {
      const errText = await openRouterResponse.text();
      console.error('OpenRouter error:', errText);
      throw new Error(`OpenRouter API error: ${openRouterResponse.status}`);
    }

    const data = await openRouterResponse.json();
    const response = data.choices[0].message.content;

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Chyba při komunikaci s AI. Zkuste to prosím znovu.' },
      { status: 500 }
    );
  }
}
