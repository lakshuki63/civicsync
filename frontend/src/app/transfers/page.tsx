'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Search, Filter, Plus, ArrowRight } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { api } from '@/lib/api';

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    async function loadTransfers() {
      try {
        const params: any = {};
        if (statusFilter) params.status = statusFilter;
        const res: any = await api.transfers.list(params);
        setTransfers(res.data.transfers);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadTransfers();
  }, [statusFilter]);

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">My Transfer Requests</h2>
            <p className="text-slate-400">Track and manage all your property ownership transfers</p>
          </div>
          <Link href="/transfer/new" className="btn-primary">
            <Plus size={18} /> New Request
          </Link>
        </div>

        {/* Filters */}
        <div className="glass p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search by Registration No..." className="input pl-10" />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Filter size={18} className="text-slate-400" />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input py-2"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="PAYMENT_PENDING">Payment Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center p-12"><div className="spinner" /></div>
        ) : transfers.length === 0 ? (
          <div className="glass p-12 text-center text-slate-400">
            <Building2 size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium text-white mb-2">No transfers found</p>
            <p>You haven't submitted any transfer requests yet.</p>
            <Link href="/transfer/new" className="btn-primary mt-6">Start your first transfer</Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {transfers.map(t => (
              <Link key={t.id} href={`/transfer/${t.id}`} className="glass p-6 hover:bg-white/[0.02] transition-colors group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <Building2 size={24} className="text-indigo-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-lg group-hover:text-indigo-300 transition-colors">{t.property.registrationNumber}</h3>
                        <span className={`badge badge-${t.status.toLowerCase().replace('_', '-')}`}>{t.status.replace('_', ' ')}</span>
                      </div>
                      <p className="text-slate-400 text-sm mb-3 max-w-2xl truncate">{t.property.address}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-slate-500 font-medium">
                        <span className="bg-white/5 px-2 py-1 rounded">Ref: {t.referenceId.slice(0,8).toUpperCase()}</span>
                        <span className="bg-white/5 px-2 py-1 rounded">Created: {new Date(t.createdAt).toLocaleDateString()}</span>
                        <span className="bg-white/5 px-2 py-1 rounded">Fee: ₹{t.totalFee}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-3 min-w-[200px]">
                    <div className="flex gap-2">
                      {t.departmentStatuses.map((ds: any) => {
                        const statusColor = ds.status === 'APPROVED' ? 'border-green-500/50 text-green-400 bg-green-500/10' : 
                                            ds.status === 'REJECTED' ? 'border-red-500/50 text-red-400 bg-red-500/10' : 
                                            'border-white/10 text-slate-400 bg-white/5';
                        return (
                          <div key={ds.department} title={`${ds.department}: ${ds.status}`} 
                            className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs ${statusColor}`}>
                            {ds.department === 'PROPERTY_TAX' ? '🏛️' : ds.department === 'ELECTRICITY' ? '⚡' : ds.department === 'WATER' ? '💧' : ds.department === 'GAS' ? '🔥' : '📋'}
                          </div>
                        )
                      })}
                    </div>
                    <div className="text-indigo-400 flex items-center gap-1 text-sm font-medium group-hover:translate-x-1 transition-transform">
                      View details <ArrowRight size={16} />
                    </div>
                  </div>

                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </AppShell>
  );
}
