import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') || new Date().getMonth() + 1;
    const year = searchParams.get('year') || new Date().getFullYear();

    const [budgets] = await pool.execute(
      'SELECT b.*, COALESCE(SUM(t.amount), 0) as spent FROM budgets b LEFT JOIN transactions t ON t.category = b.category AND t.type = "expense" AND MONTH(t.date) = b.month AND YEAR(t.date) = b.year WHERE b.month = ? AND b.year = ? GROUP BY b.id',
      [month, year]
    );

    return NextResponse.json(budgets);
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { category, amount, month, year, user_id } = body;
    const userId = user_id || 1;

    await pool.execute(
      'INSERT INTO budgets (user_id, category, amount, month, year) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE amount = ?',
      [userId, category, amount, month, year, amount]
    );

    return NextResponse.json({ message: 'Budget saved' }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
