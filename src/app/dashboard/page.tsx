'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface Stats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  byCategory: Array<{category: string; total: number}>;
  monthly: Array<{month: number; year: number; income: number; expense: number}>;
}

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/transactions/stats').then(r => r.json()).then(setStats);
  }, []);

  if (!stats) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center h-96 text-gray-500">กำลังโหลด...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-500">
            <p className="text-sm text-gray-500">รายรับเดือนนี้</p>
            <p className="text-3xl font-bold text-green-600">฿{Number(stats.totalIncome).toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-red-500">
            <p className="text-sm text-gray-500">รายจ่ายเดือนนี้</p>
            <p className="text-3xl font-bold text-red-600">฿{Number(stats.totalExpense).toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500">
            <p className="text-sm text-gray-500">คงเหลือ</p>
            <p className={`text-3xl font-bold ${Number(stats.balance) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              ฿{Number(stats.balance).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">รายรับ-รายจ่าย 12 เดือนล่าสุด</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.monthly.slice().reverse()}>
                <XAxis dataKey="month" tickFormatter={(v) => `เดือน ${v}`} />
                <YAxis />
                <Tooltip formatter={(value) => `฿${Number(value).toLocaleString()}`} />
                <Legend />
                <Bar dataKey="income" name="รายรับ" fill="#10B981" />
                <Bar dataKey="expense" name="รายจ่าย" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">รายจ่ายตามหมวดหมู่</h2>
            {stats.byCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={stats.byCategory} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={100} label={(props) => `${props.name} ${((props.percent ?? 0)*100).toFixed(0)}%`}>
                    {stats.byCategory.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `฿${Number(value).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-400">ยังไม่มีข้อมูล</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
