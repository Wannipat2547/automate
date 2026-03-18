import pool from '@/lib/db';

export async function verifyApiKey(request: Request): Promise<number | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const apiKey = authHeader.substring(7);

  try {
    const [rows] = await pool.execute(
      'SELECT id FROM users WHERE api_key = ?',
      [apiKey]
    ) as [Array<{id: number}>, unknown];

    return rows.length > 0 ? rows[0].id : null;
  } catch {
    return null;
  }
}
