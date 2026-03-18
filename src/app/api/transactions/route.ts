import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import pool from '@/lib/db';
import { verifyApiKey } from '@/lib/auth-api';
import { categorize } from '@/lib/openai';

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const apiUserId = await verifyApiKey(request);
    if (!session && !apiUserId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const [rows] = await pool.execute(
      'SELECT * FROM transactions ORDER BY date DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const apiUserId = await verifyApiKey(request);
    if (!session && !apiUserId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { amount, type, description, date, user_id } = body;

    const userId = apiUserId || user_id || 1;
    let category = body.category;
    if (!category && description) {
      category = await categorize(description);
    }

    const [result] = await pool.execute(
      'INSERT INTO transactions (user_id, amount, type, category, description, date) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, amount, type, category || 'Other', description || '', date]
    ) as [{ insertId: number }, unknown];

    return NextResponse.json({ id: result.insertId, message: 'Transaction created' }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
