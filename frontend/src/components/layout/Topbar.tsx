'use client';
import { usePathname } from 'next/navigation';
import { Bell, Search } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/transfers': 'My Transfer Requests',
  '/transfer/new': 'New Transfer Request',
  '/upload': 'Upload Documents',
  '/notifications': 'Notifications',
  '/officer': 'Officer Dashboard',
  '/admin': 'Admin Overview',
  '/admin/users': 'User Management',
  '/admin/logs': 'Audit Logs',
};

export default function Topbar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const title = Object.entries(PAGE_TITLES).find(([key]) =>
    pathname === key || pathname.startsWith(key + '/')
  )?.[1] || 'CivicSync';

  return (
    <header className="h-16 border-b border-[var(--glass-border)] flex items-center justify-between px-6 bg-[var(--navy-950)]/80 backdrop-blur-md sticky top-0 z-30">
      <div>
        <h1 className="text-lg font-bold text-white">{title}</h1>
        <p className="text-xs text-slate-400">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button className="w-9 h-9 rounded-xl bg-white/5 border border-[var(--glass-border)] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
          <Bell size={16} />
        </button>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold">
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
}
