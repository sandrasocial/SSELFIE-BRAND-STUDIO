export const config = { 
  runtime: 'edge',
  maxDuration: 45 
};

export default async function handler(req: Request) {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json().catch(() => ({} as any));
    let { messages } = body as { messages?: Array<{ role: string; content: string }>; message?: string; conversationHistory?: Array<{ role: string; content?: string; message?: string }>; } as any;

    // Accept alternative payload shape: { message, conversationHistory }
    if (!messages || !Array.isArray(messages)) {
      const singleMessage = (body as any).message as string | undefined;
      const conversationHistory = (body as any).conversationHistory as Array<{ role: string; content?: string; message?: string }> | undefined;
      const historyMessages = Array.isArray(conversationHistory)
        ? conversationHistory.map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content || m.message || '' }))
        : [];
      const initial = singleMessage ? [{ role: 'user', content: singleMessage }] : [];
      const synthesized = [...historyMessages, ...initial].filter(m => m.content && m.content.length > 0);
      if (synthesized.length > 0) {
        messages = synthesized as any;
      }
    }
    
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages array is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create abort controller for timeout
    const ac = new AbortController();
    const killer = setTimeout(() => ac.abort('timeout'), 45000);

    try {
      // Mock AI response for now (replace with actual AI call)
      const mockResponse = `Hello! I'm Maya, your AI personal brand strategist. I'm here to help you create stunning professional photos. How can I assist you today?`;

      // Create streaming response
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();

      // Simulate streaming response
      const encoder = new TextEncoder();
      const chunks = mockResponse.split(' ');
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i] + (i < chunks.length - 1 ? ' ' : '');
        await writer.write(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
        
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      await writer.close();
      clearTimeout(killer);

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-store',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });

    } catch (error) {
      clearTimeout(killer);
      throw error;
    }

  } catch (error) {
    console.error('❌ Maya chat error:', error);
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error && error.message.includes('timeout') 
        ? 'Request timeout' 
        : 'Internal server error' 
    }), {
      status: error instanceof Error && error.message.includes('timeout') ? 504 : 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}