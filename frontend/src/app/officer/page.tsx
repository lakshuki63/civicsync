'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ClipboardList, CheckCircle, XCircle, Search, Filter, AlertCircle, Eye, Building2 } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function OfficerDashboard() {
  const { user } = useAuthStore();
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING'); // Default to pending review
  
  // Modal state
  const [selectedTransfer, setSelectedTransfer] = useState<any>(null);
  const [actionRemarks, setActionRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter; // This might filter main request status instead of dept status depending on backend, but good enough for demo
      const res: any = await api.transfers.list();
      
      // Filter client-side to only show transfers where this department is involved
      const deptTransfers = res.data.transfers.filter((t: any) => 
        t.departmentStatuses.some((ds: any) => ds.department === user?.department)
      );
      
      if (statusFilter) {
        setTransfers(deptTransfers.filter((t: any) => 
          t.departmentStatuses.find((ds: any) => ds.department === user?.department)?.status === statusFilter
        ));
      } else {
        setTransfers(deptTransfers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.department) loadData();
  }, [user, statusFilter]);

  const handleAction = async (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedTransfer || !user?.department) return;
    setActionLoading(true); setError('');
    try {
      await api.transfers.updateDeptStatus(selectedTransfer.id, user.department, {
        status,
        remarks: actionRemarks
      });
      setSelectedTransfer(null);
      setActionRemarks('');
      loadData(); // Reload list
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="glass p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Officer Dashboard</h2>
              <p className="text-slate-400">Department: <span className="text-purple-400 font-semibold">{user?.department?.replace('_', ' ')}</span></p>
            </div>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg p-1">
              <button onClick={() => setStatusFilter('PENDING')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${statusFilter === 'PENDING' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'}`}>Pending</button>
              <button onClick={() => setStatusFilter('APPROVED')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${statusFilter === 'APPROVED' ? 'bg-green-500 text-white' : 'text-slate-400 hover:text-white'}`}>Approved</button>
              <button onClick={() => setStatusFilter('')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${statusFilter === '' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>All</button>
            </div>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center p-12"><div className="spinner" /></div>
        ) : transfers.length === 0 ? (
          <div className="glass p-12 text-center text-slate-400">
            <ClipboardList size={48} className="mx-auto mb-4 opacity-20" />
            <p>No transfers found matching filter.</p>
          </div>
        ) : (
          <div className="glass overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="p-4 font-semibold text-sm text-slate-300">Property Reg No</th>
                    <th className="p-4 font-semibold text-sm text-slate-300">Applicant</th>
                    <th className="p-4 font-semibold text-sm text-slate-300">Global Status</th>
                    <th className="p-4 font-semibold text-sm text-slate-300">Dept Status</th>
                    <th className="p-4 font-semibold text-sm text-slate-300 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transfers.map(t => {
                    const deptStatus = t.departmentStatuses.find((ds: any) => ds.department === user?.department)?.status;
                    return (
                      <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Building2 size={16} className="text-purple-400" />
                            <span className="font-medium text-white">{t.property.registrationNumber}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-slate-300">{t.citizen.name}</td>
                        <td className="p-4">
                          <span className={`badge badge-${t.status.toLowerCase().replace('_', '-')}`}>{t.status.replace('_', ' ')}</span>
                        </td>
                        <td className="p-4">
                          <span className={`badge border ${
                            deptStatus === 'APPROVED' ? 'border-green-500/50 text-green-400 bg-green-500/10' :
                            deptStatus === 'REJECTED' ? 'border-red-500/50 text-red-400 bg-red-500/10' :
                            'border-yellow-500/50 text-yellow-400 bg-yellow-500/10'
                          }`}>{deptStatus}</span>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => setSelectedTransfer(t)}
                            className="btn-secondary py-1.5 px-3 text-xs"
                          >
                            <Eye size={14} /> Review
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Review Modal */}
      {selectedTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--navy-900)] border border-[var(--glass-border)] rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-xl font-bold">Review Request: {selectedTransfer.property.registrationNumber}</h3>
              <button onClick={() => setSelectedTransfer(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">{error}</div>}

              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-slate-500 mb-1">Applicant Name</p>
                  <p className="font-medium">{selectedTransfer.citizen.name}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-slate-500 mb-1">Applicant Phone</p>
                  <p className="font-medium">{selectedTransfer.citizen.phone}</p>
                </div>
                <div className="sm:col-span-2 p-4 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-slate-500 mb-1">Property Address</p>
                  <p className="font-medium">{selectedTransfer.property.address}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Documents</h4>
                {selectedTransfer.documents.length === 0 ? (
                  <p className="text-sm text-slate-500">No documents uploaded.</p>
                ) : (
                  <div className="grid gap-2">
                    {selectedTransfer.documents.map((doc: any) => (
                      <div key={doc.id} className="flex justify-between items-center p-3 rounded-lg border border-white/10 bg-white/[0.02]">
                        <span className="text-sm">{doc.type.replace(/_/g, ' ')}</span>
                        <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:underline">View File</a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-2">Remarks</h4>
                <textarea 
                  value={actionRemarks} 
                  onChange={(e) => setActionRemarks(e.target.value)}
                  placeholder="Enter rejection reason or approval note..." 
                  className="input" rows={3} 
                />
              </div>

            </div>
            
            <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
              <button onClick={() => handleAction('REJECTED')} disabled={actionLoading} className="btn-secondary border-red-500/50 text-red-400 hover:bg-red-500/10">
                <XCircle size={16} /> Reject
              </button>
              <button onClick={() => handleAction('APPROVED')} disabled={actionLoading} className="btn-primary bg-gradient-to-r from-green-500 to-emerald-600">
                {actionLoading ? <span className="spinner border-2" /> : <><CheckCircle size={16} /> Approve</>}
              </button>
            </div>

          </div>
        </div>
      )}
    </AppShell>
  );
}
