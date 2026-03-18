'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';

interface Bill {
  id: number;
  name: string;
  amount: number;
  due_date: string;
  status: string;
  paid_at: string | null;
}

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [form, setForm] = useState({ name: '', amount: '', due_date: '' });

  const load = () => fetch('/api/bills').then(r => r.json()).then(setBills);
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/bills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
    });
    setForm({ name: '', amount: '', due_date: '' });
    load();
  };

  const markPaid = async (id: number) => {
    await fetch(`/api/bills/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'paid' }),
    });
    load();
  };

  const today = new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">บิลและค่าใช้จ่ายประจำ</h1>

        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">เพิ่มบิล</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input type="text" placeholder="ชื่อบิล" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="border rounded-lg px-3 py-2" required />
            <input type="number" placeholder="จำนวนเงิน" value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))} className="border rounded-lg px-3 py-2" required />
            <input type="date" value={form.due_date} onChange={e => setForm(f => ({...f, due_date: e.target.value}))} className="border rounded-lg px-3 py-2" required />
            <button type="submit" className="bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700">เพิ่มบิล</button>
          </form>
        </div>

        <div className="space-y-3">
          {bills.map(bill => {
            const dueDate = new Date(bill.due_date);
            const isOverdue = bill.status === 'pending' && dueDate < today;
            const isDueSoon = bill.status === 'pending' && !isOverdue && (dueDate.getTime() - today.getTime()) < 3 * 24 * 60 * 60 * 1000;

            return (
              <div key={bill.id} className={`bg-white rounded-xl shadow p-4 flex items-center justify-between border-l-4 ${bill.status === 'paid' ? 'border-green-400' : isOverdue ? 'border-red-500' : isDueSoon ? 'border-yellow-400' : 'border-gray-200'}`}>
                <div>
                  <p className="font-semibold text-gray-800">{bill.name}</p>
                  <p className="text-sm text-gray-500">ครบกำหนด: {new Date(bill.due_date).toLocaleDateString('th-TH')}</p>
                  {isOverdue && <span className="text-xs text-red-600 font-medium">⚠️ เลยกำหนดชำระ</span>}
                  {isDueSoon && <span className="text-xs text-yellow-600 font-medium">⏰ ใกล้ครบกำหนด</span>}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-gray-800">฿{Number(bill.amount).toLocaleString()}</span>
                  {bill.status === 'pending' ? (
                    <button onClick={() => markPaid(bill.id)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm">
                      ชำระแล้ว
                    </button>
                  ) : (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">✓ ชำระแล้ว</span>
                  )}
                </div>
              </div>
            );
          })}
          {bills.length === 0 && <div className="text-center py-8 text-gray-400">ยังไม่มีบิล</div>}
        </div>
      </div>
    </div>
  );
}
