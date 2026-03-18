import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

// One-time admin password reset endpoint
// Usage: GET /api/reset-admin?pass=YOUR_NEW_PASSWORD&secret=reset2026
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const pass = searchParams.get('pass');

  if (secret !== 'reset2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!pass || pass.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  const hash = await bcrypt.hash(pass, 10);

  await pool.execute(
    'UPDATE users SET password = ? WHERE email = ?',
    [hash, 'admin@example.com']
  );

  return NextResponse.json({ 
    success: true, 
    message: `Password for admin@example.com updated successfully. Please delete this endpoint after use.`
  });
}
