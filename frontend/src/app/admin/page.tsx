'use client';
import { useEffect, useState } from 'react';
import { LayoutDashboard, Users, FileText, CheckCircle, XCircle, IndianRupee, Clock, Activity } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res: any = await api.admin.stats();
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) return <AppShell><div className="flex h-full items-center justify-center"><div className="spinner" /></div></AppShell>;

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Total Requests', value: stats?.totalTransfers || 0, icon: FileText, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
    { label: 'Pending / In Review', value: stats?.pendingTransfers || 0, icon: Clock, color: 'text-gold-400', bg: 'bg-gold-500/10 border-gold-500/20' },
    { label: 'Approved', value: stats?.approvedTransfers || 0, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
    { label: 'Rejected', value: stats?.rejectedTransfers || 0, icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
    { label: 'Total Revenue', value: `₹${stats?.totalRevenue?.toLocaleString() || 0}`, icon: IndianRupee, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  ];

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="glass p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3" />
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">Platform Overview</h2>
            <p className="text-slate-400">System-wide metrics and health</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((s, i) => (
            <div key={i} className="stat-card flex items-center gap-5">
              <div className={`w-14 h-14 rounded-xl border flex items-center justify-center flex-shrink-0 ${s.bg}`}>
                <s.icon size={28} className={s.color} />
              </div>
              <div>
                <p className="text-3xl font-bold">{s.value}</p>
                <p className="text-sm font-medium text-slate-400">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Users size={18} className="text-indigo-400"/> User Management</h3>
              <p className="text-slate-400 text-sm mb-6">Manage citizen and officer accounts, assign roles, and handle account statuses.</p>
            </div>
            <Link href="/admin/users" className="btn-secondary w-full">Go to Users</Link>
          </div>
          
          <div className="glass p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Activity size={18} className="text-indigo-400"/> Audit Logs</h3>
              <p className="text-slate-400 text-sm mb-6">Review system-wide activity, track officer actions, and monitor for anomalies.</p>
            </div>
            <Link href="/admin/logs" className="btn-secondary w-full">Go to Logs</Link>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
