import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { askAI as askGPT } from '@/lib/ai';

async function sendTelegramMessage(chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = body?.message;
    if (!message) return NextResponse.json({ ok: true });

    const chatId = message.chat?.id;
    const text = message.text || '';

    if (text.startsWith('/summary')) {
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();
      const [income] = await pool.execute(
        'SELECT SUM(amount) as total FROM transactions WHERE type = "income" AND MONTH(date) = ? AND YEAR(date) = ?',
        [month, year]
      ) as [Array<{total: number}>, unknown];
      const [expense] = await pool.execute(
        'SELECT SUM(amount) as total FROM transactions WHERE type = "expense" AND MONTH(date) = ? AND YEAR(date) = ?',
        [month, year]
      ) as [Array<{total: number}>, unknown];

      const totalIncome = income[0]?.total || 0;
      const totalExpense = expense[0]?.total || 0;
      await sendTelegramMessage(chatId, `📊 *สรุปเดือน ${month}/${year}*\n💰 รายรับ: ${totalIncome.toLocaleString()} บาท\n💸 รายจ่าย: ${totalExpense.toLocaleString()} บาท\n📈 คงเหลือ: ${(totalIncome - totalExpense).toLocaleString()} บาท`);
    } else if (text.startsWith('/add ')) {
      const parts = text.replace('/add ', '').split(' ');
      if (parts.length >= 3) {
        const [type, amount, ...descParts] = parts;
        const description = descParts.join(' ');
        await pool.execute(
          'INSERT INTO transactions (user_id, amount, type, category, description, date) VALUES (1, ?, ?, "Other", ?, CURDATE())',
          [parseFloat(amount), type === 'income' ? 'income' : 'expense', description]
        );
        await sendTelegramMessage(chatId, `✅ บันทึกรายการ: ${description} ${amount} บาท`);
      }
    } else {
      const reply = await askGPT(`คุณเป็น AI ผู้ช่วยด้านการเงิน ตอบคำถามนี้ให้กระชับ: ${text}`);
      await sendTelegramMessage(chatId, reply);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
