'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  api_key: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || (session.user as {role?: string})?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    fetch('/api/admin/users').then(r => r.json()).then(setUsers);
  }, [session, status, router]);

  if (status === 'loading') return <div>Loading...</div>;
  if ((session?.user as {role?: string})?.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">จัดการผู้ใช้งาน</h1>
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">ชื่อ</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">อีเมล</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">Role</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">API Key</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">วันที่สร้าง</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-t hover:bg-gray-50">
                  <td className="p-4 text-sm font-medium">{user.name}</td>
                  <td className="p-4 text-sm text-gray-600">{user.email}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-gray-400 font-mono">{user.api_key || '-'}</td>
                  <td className="p-4 text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString('th-TH')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
