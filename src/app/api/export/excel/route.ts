import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import pool from '@/lib/db';
import * as XLSX from 'xlsx';

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') || new Date().getMonth() + 1;
    const year = searchParams.get('year') || new Date().getFullYear();

    const [transactions] = await pool.execute(
      'SELECT date, type, category, description, amount FROM transactions WHERE MONTH(date) = ? AND YEAR(date) = ? ORDER BY date DESC',
      [month, year]
    );

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(transactions as object[]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=transactions-${year}-${month}.xlsx`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
