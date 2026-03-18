import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { verifyApiKey } from '@/lib/auth-api';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const apiUserId = await verifyApiKey(request);
    if (!session && !apiUserId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get('image') as File;
    if (!file) return NextResponse.json({ error: 'No image provided' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mimeType = file.type || 'image/jpeg';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${base64}` },
            },
            {
              type: 'text',
              text: 'Extract transaction details from this receipt/slip. Return JSON with: amount (number), type (income/expense), description (string), date (YYYY-MM-DD). If date not found use today.',
            },
          ],
        }],
        max_tokens: 300,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{}';

    try {
      const parsed = JSON.parse(content.replace(/```json\n?|\n?```/g, ''));
      return NextResponse.json(parsed);
    } catch {
      return NextResponse.json({ raw: content });
    }
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
