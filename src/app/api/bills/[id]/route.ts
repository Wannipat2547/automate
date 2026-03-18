import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import pool from '@/lib/db';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    await pool.execute(
      'UPDATE bills SET status = ?, paid_at = ? WHERE id = ?',
      [status, status === 'paid' ? new Date() : null, id]
    );

    return NextResponse.json({ message: 'Bill updated' });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
