import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import pool from '@/lib/db';
import { verifyApiKey } from '@/lib/auth-api';

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const apiUserId = await verifyApiKey(request);
    if (!session && !apiUserId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [rows] = await pool.execute('SELECT * FROM bills ORDER BY due_date ASC');
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
    const { name, amount, due_date, user_id } = body;
    const userId = apiUserId || user_id || 1;

    const [result] = await pool.execute(
      'INSERT INTO bills (user_id, name, amount, due_date) VALUES (?, ?, ?, ?)',
      [userId, name, amount, due_date]
    ) as [{ insertId: number }, unknown];

    return NextResponse.json({ id: result.insertId, message: 'Bill created' }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
