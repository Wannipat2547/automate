import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import pool from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session || (session.user as {role?: string})?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [rows] = await pool.execute('SELECT id, name, email, role, api_key, created_at FROM users ORDER BY created_at DESC');
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
