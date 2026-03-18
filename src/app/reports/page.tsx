'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';

interface Report {
  id: number;
  month: number;
  year: number;
  total_income: number;
  total_expense: number;
  summary: string;
  created_at: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [generating, setGenerating] = useState(false);

  const load = () => fetch('/api/reports/monthly').then(r => r.json()).then(setReports);
  useEffect(() => { load(); }, []);

  const generateReport = async () => {
    setGenerating(true);
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month, year }),
    });
    await load();
    setGenerating(false);
  };

  const downloadExcel = (month: number, year: number) => {
    window.open(`/api/export/excel?month=${month}&year=${year}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">รายงานประจำเดือน</h1>
          <button onClick={generateReport} disabled={generating} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {generating ? '⏳ กำลังสร้าง...' : '🤖 สร้างรายงานเดือนนี้'}
          </button>
        </div>

        <div className="space-y-4">
          {reports.map(report => (
            <div key={report.id} className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">เดือน {report.month}/{report.year}</h2>
                <button onClick={() => downloadExcel(report.month, report.year)} className="flex items-center gap-2 text-green-600 hover:text-green-800 text-sm font-medium">
                  📥 Export Excel
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-gray-500">รายรับ</p>
                  <p className="font-bold text-green-600">฿{Number(report.total_income).toLocaleString()}</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-xs text-gray-500">รายจ่าย</p>
                  <p className="font-bold text-red-600">฿{Number(report.total_expense).toLocaleString()}</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-gray-500">คงเหลือ</p>
                  <p className="font-bold text-blue-600">฿{(Number(report.total_income) - Number(report.total_expense)).toLocaleString()}</p>
                </div>
              </div>
              {report.summary && (
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap">
                  {report.summary}
                </div>
              )}
            </div>
          ))}
          {reports.length === 0 && <div className="text-center py-8 text-gray-400">ยังไม่มีรายงาน</div>}
        </div>
      </div>
    </div>
  );
}
