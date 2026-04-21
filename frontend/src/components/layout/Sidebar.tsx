'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard, FileText, Upload, Bell, LogOut,
  Settings, Users, ClipboardList, Shield, ChevronRight,
  Building2
} from 'lucide-react';

const citizenNav = [
  { href: '/dashboard',     label: 'Dashboard',       icon: LayoutDashboard },
  { href: '/transfer/new',  label: 'New Transfer',    icon: FileText },
  { href: '/transfers',     label: 'My Requests',     icon: ClipboardList },
  { href: '/upload',        label: 'Upload Docs',     icon: Upload },
  { href: '/notifications', label: 'Notifications',   icon: Bell },
];

const officerNav = [
  { href: '/officer',       label: 'Requests Queue',  icon: ClipboardList },
  { href: '/notifications', label: 'Notifications',   icon: Bell },
];

const adminNav = [
  { href: '/admin',         label: 'Overview',        icon: LayoutDashboard },
  { href: '/admin/users',   label: 'Users',           icon: Users },
  { href: '/admin/logs',    label: 'Audit Logs',      icon: Shield },
  { href: '/notifications', label: 'Notifications',   icon: Bell },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const navItems =
    user?.role === 'ADMIN' ? adminNav :
    user?.role === 'OFFICER' ? officerNav :
    citizenNav;

  const roleLabel = user?.role === 'ADMIN' ? 'Administrator' : user?.role === 'OFFICER' ? `Officer · ${user?.department?.replace('_', ' ')}` : 'Citizen';
  const roleColor = user?.role === 'ADMIN' ? 'text-red-400' : user?.role === 'OFFICER' ? 'text-purple-400' : 'text-indigo-400';

  return (
    <aside className="w-64 min-h-screen flex flex-col glass border-r border-[var(--glass-border)] sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-[var(--glass-border)]">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Building2 size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-white font-[var(--font-sora)] text-lg leading-none">CivicSync</p>
            <p className="text-xs text-slate-400 mt-0.5">Gov Property Portal</p>
          </div>
        </Link>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-[var(--glass-border)]">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</p>
            <p className={`text-xs font-medium ${roleColor}`}>{roleLabel}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link key={href} href={href} className={`nav-item ${active ? 'active' : ''}`}>
              <Icon size={18} />
              <span>{label}</span>
              {active && <ChevronRight size={14} className="ml-auto opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-[var(--glass-border)] space-y-1">
        <button onClick={logout} className="nav-item w-full text-red-400 hover:bg-red-500/10 hover:text-red-300">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
