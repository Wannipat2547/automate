'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';

interface Budget {
  id: number;
  category: string;
  amount: number;
  spent: number;
  month: number;
  year: number;
}

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Utilities', 'Other'];

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [form, setForm] = useState({ category: 'Food', amount: '' });
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();

  const load = () => fetch(`/api/budget?month=${month}&year=${year}`).then(r => r.json()).then(setBudgets);
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/budget', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount), month, year }),
    });
    setForm(f => ({...f, amount: ''}));
    load();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">งบประมาณเดือน {month}/{year}</h1>

        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">ตั้งงบประมาณ</h2>
          <form onSubmit={handleSubmit} className="flex gap-4">
            <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} className="border rounded-lg px-3 py-2 flex-1">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="number" placeholder="จำนวนเงิน (บาท)" value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))} className="border rounded-lg px-3 py-2 flex-1" required />
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">บันทึก</button>
          </form>
        </div>

        <div className="space-y-4">
          {budgets.map(budget => {
            const pct = Math.min((Number(budget.spent) / Number(budget.amount)) * 100, 100);
            const isOver = Number(budget.spent) > Number(budget.amount);

            return (
              <div key={budget.id} className="bg-white rounded-xl shadow p-4">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-gray-800">{budget.category}</span>
                  <span className={`text-sm font-medium ${isOver ? 'text-red-600' : 'text-gray-600'}`}>
                    ฿{Number(budget.spent).toLocaleString()} / ฿{Number(budget.amount).toLocaleString()}
                    {isOver && ' ⚠️'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${isOver ? 'bg-red-500' : pct > 80 ? 'bg-yellow-400' : 'bg-green-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">{pct.toFixed(0)}% ใช้แล้ว</p>
              </div>
            );
          })}
          {budgets.length === 0 && <div className="text-center py-8 text-gray-400">ยังไม่มีงบประมาณ กรุณาตั้งงบประมาณก่อน</div>}
        </div>
      </div>
    </div>
  );
}
