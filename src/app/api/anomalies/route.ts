import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import pool from '@/lib/db';
import { askAI as askGPT } from '@/lib/ai';
import { verifyApiKey } from '@/lib/auth-api';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const apiUserId = await verifyApiKey(request);
    if (!session && !apiUserId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [transactions] = await pool.execute(
      'SELECT * FROM transactions ORDER BY date DESC LIMIT 30'
    ) as [Array<{amount: number; category: string; description: string; date: string}>, unknown];

    const analysis = await askGPT(`Analyze these transactions for anomalies or unusual spending patterns: ${JSON.stringify(transactions)}. Report any suspicious patterns in Thai, be concise.`);

    return NextResponse.json({ anomalies: analysis, count: transactions.length });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
