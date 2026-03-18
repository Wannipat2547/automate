import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import pool from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [rows] = await pool.execute(
      'SELECT * FROM monthly_reports ORDER BY year DESC, month DESC LIMIT 12'
    );

    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
