import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [rows] = await pool.execute(
      'SELECT * FROM bills WHERE id = ?',
      [id]
    ) as [Array<{id: number; name: string; amount: number; status: string}>, unknown];

    if (rows.length === 0) return NextResponse.json({ error: 'Bill not found' }, { status: 404 });

    await pool.execute(
      'UPDATE bills SET status = "paid", paid_at = NOW() WHERE id = ?',
      [id]
    );

    return new Response(`<html><body><h1>✅ Bill "${rows[0].name}" marked as paid!</h1></body></html>`, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
