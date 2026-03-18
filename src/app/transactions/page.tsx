'use client';
import { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';

interface Transaction {
  id: number;
  amount: number;
  type: string;
  category: string;
  description: string;
  date: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [form, setForm] = useState({ amount: '', type: 'expense', description: '', date: new Date().toISOString().split('T')[0] });
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => fetch('/api/transactions').then(r => r.json()).then(setTransactions);

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
    });
    setForm({ amount: '', type: 'expense', description: '', date: new Date().toISOString().split('T')[0] });
    await load();
    setLoading(false);
  };

  const handleOCR = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOcrLoading(true);
    const fd = new FormData();
    fd.append('image', file);
    const res = await fetch('/api/ocr', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.amount) setForm(f => ({ ...f, amount: String(data.amount), type: data.type || 'expense', description: data.description || '', date: data.date || f.date }));
    setOcrLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">รายการธุรกรรม</h1>

        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">เพิ่มรายการใหม่</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))} className="border rounded-lg px-3 py-2">
              <option value="expense">รายจ่าย</option>
              <option value="income">รายรับ</option>
            </select>
            <input type="number" placeholder="จำนวนเงิน" value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))} className="border rounded-lg px-3 py-2" required />
            <input type="text" placeholder="รายละเอียด" value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} className="border rounded-lg px-3 py-2" />
            <input type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} className="border rounded-lg px-3 py-2" />
            <div className="flex gap-2">
              <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 disabled:opacity-50">
                {loading ? '...' : 'เพิ่ม'}
              </button>
              <button type="button" onClick={() => fileRef.current?.click()} className="px-3 bg-gray-100 border rounded-lg hover:bg-gray-200" title="OCR สแกนใบเสร็จ">
                {ocrLoading ? '⏳' : '📷'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleOCR} className="hidden" />
            </div>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">วันที่</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">ประเภท</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">หมวดหมู่</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">รายละเอียด</th>
                <th className="text-right p-4 text-sm font-semibold text-gray-600">จำนวนเงิน</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id} className="border-t hover:bg-gray-50">
                  <td className="p-4 text-sm text-gray-600">{new Date(t.date).toLocaleDateString('th-TH')}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${t.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {t.type === 'income' ? 'รายรับ' : 'รายจ่าย'}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{t.category}</td>
                  <td className="p-4 text-sm text-gray-800">{t.description}</td>
                  <td className={`p-4 text-right font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'income' ? '+' : '-'}฿{Number(t.amount).toLocaleString()}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400">ยังไม่มีรายการ</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
