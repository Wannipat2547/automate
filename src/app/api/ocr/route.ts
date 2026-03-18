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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: 'Extract transaction details from this receipt/slip. Return JSON with: amount (number), type (income/expense), description (string), date (YYYY-MM-DD). If date not found use today. Return ONLY the raw JSON object, without ```json markdown.' },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64
              }
            }
          ],
        }],
        generationConfig: { maxOutputTokens: 300 }
      }),
    });

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

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
