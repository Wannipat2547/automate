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

    const body = await request.json();
    const { month, year, user_id } = body;
    const userId = apiUserId || user_id || 1;

    const [transactions] = await pool.execute(
      'SELECT * FROM transactions WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ?',
      [userId, month, year]
    ) as [Array<{type: string; amount: number; category: string; description: string}>, unknown];

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);

    const summary = await askGPT(`Summarize this financial data for ${month}/${year}: Income: ${totalIncome}, Expense: ${totalExpense}, Transactions: ${JSON.stringify(transactions.slice(0, 10))}. Give brief analysis in Thai.`);

    await pool.execute(
      'INSERT INTO monthly_reports (user_id, month, year, total_income, total_expense, summary) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE total_income = ?, total_expense = ?, summary = ?',
      [userId, month, year, totalIncome, totalExpense, summary, totalIncome, totalExpense, summary]
    );

    return NextResponse.json({ month, year, totalIncome, totalExpense, summary });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
