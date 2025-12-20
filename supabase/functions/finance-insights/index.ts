import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transactions, period, userQuestion } = await req.json();

    console.log(`[finance-insights] Received ${transactions?.length || 0} transactions for period ${period?.start} to ${period?.end}`);

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      console.error('[finance-insights] OPENAI_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured (OpenAI)' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build AI prompt with transaction data
    const totalIncome = transactions.filter((t: any) => t.amount > 0).reduce((sum: number, t: any) => sum + t.amount, 0);
    const totalExpense = transactions.filter((t: any) => t.amount < 0).reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);
    const balance = totalIncome - totalExpense;

    // Group by category
    const byCategory: Record<string, number> = {};
    transactions.forEach((t: any) => {
      if (t.amount < 0) {
        byCategory[t.category] = (byCategory[t.category] || 0) + Math.abs(t.amount);
      }
    });

    const categorySummary = Object.entries(byCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([cat, val]) => `${cat}: €${val.toFixed(2)}`)
      .join(', ');

    const userContext = userQuestion ? `\n\nPergunta do usuário: "${userQuestion}"` : '';

    const systemPrompt = `Você é o "Agente Estrategista", um assistente financeiro de elite integrado ao Dashboard Deep Space. Sua missão é analisar dados transacionais e fornecer inteligência estratégica.

Diretrizes de Resposta:
1. **Analise Profundamente**: Olhe para padrões de gastos semanais, categorias dominantes e evolução temporal.
2. **Seja Estratégico**: Não apenas liste números, explique o que eles significam para a saúde financeira do usuário.
3. **Naturalidade**: Responda de forma fluida, como se fosse um consultor pessoal.
4. **Formatação**: No caso de perguntas específicas, responda diretamente. Se for uma consulta geral, use:
   - **Diagnóstico**: O estado atual (bom, alerta, crítico).
   - **Padrões**: O que você notou de recorrente ou incomum.
   - **Caminho Estratégico**: 2-3 recomendações práticas.

Use sempre o português (pt-PT) e valores em euros (€). Seja conciso e impactante.`;

    const userPrompt = `Período: ${period.start} até ${period.end}
Receitas totais: €${totalIncome.toFixed(2)}
Despesas totais: €${totalExpense.toFixed(2)}
Saldo: €${balance.toFixed(2)}

Despesas por categoria (top 5): ${categorySummary || 'Nenhum gasto registrado'}

Total de transações: ${transactions.length}${userContext}`;

    console.log('[finance-insights] Calling OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`[finance-insights] OpenAI API error:`, errorData);

      return new Response(
        JSON.stringify({ error: errorData.error?.message || 'Erro ao processar análise por IA' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const insightsText = data.choices?.[0]?.message?.content || 'Não foi possível gerar insights neste momento.';

    console.log('[finance-insights] Analysis generated successfully');

    return new Response(
      JSON.stringify({ insightsText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[finance-insights] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
