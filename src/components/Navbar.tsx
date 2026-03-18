'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/transactions', label: 'รายการ' },
    { href: '/bills', label: 'บิล' },
    { href: '/budget', label: 'งบประมาณ' },
    { href: '/reports', label: 'รายงาน' },
  ];

  if (!session) return null;

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold">💰 Smart Finance</Link>
        <div className="flex gap-4 items-center">
          {links.map(link => (
            <Link key={link.href} href={link.href} className={`hover:text-blue-200 ${pathname === link.href ? 'font-bold underline' : ''}`}>
              {link.label}
            </Link>
          ))}
          {(session.user as {role?: string})?.role === 'admin' && (
            <Link href="/admin/users" className="hover:text-blue-200">Admin</Link>
          )}
          <button onClick={() => signOut()} className="bg-blue-800 px-3 py-1 rounded hover:bg-blue-900">
            ออกจากระบบ
          </button>
        </div>
      </div>
    </nav>
  );
}
