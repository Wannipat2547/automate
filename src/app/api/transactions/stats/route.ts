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

    const [income] = await pool.execute(
      'SELECT SUM(amount) as total FROM transactions WHERE type = "income" AND MONTH(date) = ? AND YEAR(date) = ?',
      [month, year]
    ) as [Array<{total: number}>, unknown];

    const [expense] = await pool.execute(
      'SELECT SUM(amount) as total FROM transactions WHERE type = "expense" AND MONTH(date) = ? AND YEAR(date) = ?',
      [month, year]
    ) as [Array<{total: number}>, unknown];

    const [byCategory] = await pool.execute(
      'SELECT category, SUM(amount) as total FROM transactions WHERE type = "expense" AND MONTH(date) = ? AND YEAR(date) = ? GROUP BY category',
      [month, year]
    );

    const [monthly] = await pool.execute(
      'SELECT MONTH(date) as month, YEAR(date) as year, SUM(CASE WHEN type="income" THEN amount ELSE 0 END) as income, SUM(CASE WHEN type="expense" THEN amount ELSE 0 END) as expense FROM transactions GROUP BY YEAR(date), MONTH(date) ORDER BY year DESC, month DESC LIMIT 12'
    );

    return NextResponse.json({
      totalIncome: income[0]?.total || 0,
      totalExpense: expense[0]?.total || 0,
      balance: (income[0]?.total || 0) - (expense[0]?.total || 0),
      byCategory,
      monthly,
    });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
