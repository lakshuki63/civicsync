'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Clock, CheckCircle, AlertCircle, ArrowRight, Upload, Building2 } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { api } from '@/lib/api';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recentTransfers, setRecentTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res: any = await api.transfers.list({ limit: '3' });
        setRecentTransfers(res.data.transfers);
        
        // Calculate basic stats from transfers list
        const active = res.data.transfers.filter((t: any) => !['APPROVED', 'REJECTED'].includes(t.status)).length;
        const completed = res.data.transfers.filter((t: any) => t.status === 'APPROVED').length;
        setStats({ active, completed, total: res.data.pagination.total });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <AppShell><div className="flex h-full items-center justify-center"><div className="spinner" /></div></AppShell>;

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Welcome & Quick Actions */}
        <div className="glass p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome to your Dashboard</h2>
              <p className="text-slate-400 max-w-md">Manage your property transfers, upload documents, and track department approvals in real-time.</p>
            </div>
            <div className="flex gap-4">
              <Link href="/upload" className="btn-secondary">
                <Upload size={18} /> Upload Docs
              </Link>
              <Link href="/transfer/new" className="btn-primary">
                <FileText size={18} /> New Request
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Clock size={24} className="text-blue-400" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats?.active || 0}</p>
                <p className="text-sm text-slate-400">Active Requests</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <CheckCircle size={24} className="text-green-400" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats?.completed || 0}</p>
                <p className="text-sm text-slate-400">Completed Transfers</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Building2 size={24} className="text-indigo-400" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats?.total || 0}</p>
                <p className="text-sm text-slate-400">Total Properties</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transfers */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Recent Requests</h3>
            <Link href="/transfers" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentTransfers.length === 0 ? (
              <div className="glass p-8 text-center text-slate-400">
                <FileText size={48} className="mx-auto mb-4 opacity-20" />
                <p>No transfer requests found.</p>
                <Link href="/transfer/new" className="text-indigo-400 mt-2 inline-block hover:underline">Create your first request</Link>
              </div>
            ) : (
              recentTransfers.map((req) => (
                <Link key={req.id} href={`/transfer/${req.id}`} className="block glass p-6 hover:bg-white/[0.02] transition-colors group">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <Building2 size={20} className="text-indigo-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-bold text-lg">{req.property.registrationNumber}</h4>
                          <span className={`badge badge-${req.status.toLowerCase().replace('_', '-')}`}>
                            {req.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 max-w-xl truncate">{req.property.address}</p>
                        <div className="flex gap-4 mt-3 text-xs text-slate-500">
                          <span>Ref: {req.referenceId.slice(0,8).toUpperCase()}</span>
                          <span>•</span>
                          <span>Created: {new Date(req.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {req.departmentStatuses.map((ds: any) => (
                        <div key={ds.department} title={`${ds.department}: ${ds.status}`} className="w-8 h-8 rounded-full border border-[var(--glass-border)] flex items-center justify-center bg-white/5 text-xs">
                          {ds.department === 'PROPERTY_TAX' ? '🏛️' : ds.department === 'ELECTRICITY' ? '⚡' : ds.department === 'WATER' ? '💧' : ds.department === 'GAS' ? '🔥' : '📋'}
                        </div>
                      ))}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

      </div>
    </AppShell>
  );
}
