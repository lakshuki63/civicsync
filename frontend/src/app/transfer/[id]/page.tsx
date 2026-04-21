'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Building2, Clock, CheckCircle, FileText, IndianRupee, AlertCircle, ArrowRight, Shield } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { api } from '@/lib/api';

export default function TransferDetailsPage() {
  const { id } = useParams();
  const [transfer, setTransfer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res: any = await api.transfers.get(id as string);
        setTransfer(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handlePayment = async () => {
    setPayLoading(true);
    try {
      // 1. Initiate
      const initRes: any = await api.payments.initiate({ requestId: id });
      
      // Simulate Razorpay window delay
      await new Promise(r => setTimeout(r, 1500));
      
      // 2. Verify mock payment
      await api.payments.verify({
        paymentId: initRes.data.paymentId,
        razorpayPaymentId: `pay_mock_${Date.now()}`,
        razorpayOrderId: initRes.data.orderId,
        razorpaySignature: 'mock_sig',
      });
      
      // Reload data
      const res: any = await api.transfers.get(id as string);
      setTransfer(res.data);
    } catch (err) {
      console.error(err);
      alert('Payment failed');
    } finally {
      setPayLoading(false);
    }
  };

  if (loading) return <AppShell><div className="flex justify-center p-12"><div className="spinner" /></div></AppShell>;
  if (!transfer) return <AppShell><div className="text-center p-12">Transfer not found</div></AppShell>;

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'APPROVED': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'REJECTED': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'IN_REVIEW': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      default: return 'text-gold-400 bg-gold-500/10 border-gold-500/20';
    }
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="glass p-6 md:p-8 flex flex-col md:flex-row md:items-start justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                <Building2 size={20} className="text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold">{transfer.property.registrationNumber}</h2>
              <span className={`badge ml-2 ${getStatusColor(transfer.status)} border`}>
                {transfer.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-slate-400 text-sm max-w-2xl mt-3">{transfer.property.address}</p>
            <div className="flex flex-wrap gap-6 mt-4 text-sm">
              <div><span className="text-slate-500">Ref:</span> <span className="font-mono text-slate-300">{transfer.referenceId}</span></div>
              <div><span className="text-slate-500">Submitted:</span> <span className="text-slate-300">{new Date(transfer.createdAt).toLocaleString()}</span></div>
              <div><span className="text-slate-500">Applicant:</span> <span className="text-slate-300">{transfer.citizen.name}</span></div>
            </div>
          </div>

          {/* Payment Action Box */}
          {transfer.status === 'SUBMITTED' || transfer.status === 'PAYMENT_PENDING' ? (
            <div className="relative z-10 glass p-5 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30 min-w-[280px]">
              <h3 className="font-bold mb-1 flex items-center gap-2"><IndianRupee size={16} className="text-gold-400"/> Pending Fees</h3>
              <p className="text-3xl font-bold text-white mb-1">₹{transfer.totalFee}</p>
              <p className="text-xs text-slate-400 mb-4">Complete payment to start review process.</p>
              <button onClick={handlePayment} disabled={payLoading} className="btn-primary w-full shadow-[0_0_15px_rgba(79,110,247,0.3)]">
                {payLoading ? <span className="spinner w-4 h-4 border-2" /> : <>Pay Now via UPI <ArrowRight size={16}/></>}
              </button>
            </div>
          ) : transfer.payments?.length > 0 && transfer.payments[0].status === 'SUCCESS' ? (
            <div className="relative z-10 flex items-center gap-3 p-4 rounded-xl border border-green-500/20 bg-green-500/5">
              <CheckCircle size={24} className="text-green-400" />
              <div>
                <p className="text-sm font-bold text-green-400">Payment Successful</p>
                <p className="text-xs text-slate-400">Ref: {transfer.payments[0].gatewayRef}</p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Main Content - Left 2 cols */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Department Statuses */}
            <div className="glass p-6">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
                <Shield size={20} className="text-indigo-400" /> Department Approvals
              </h3>
              <div className="space-y-4">
                {transfer.departmentStatuses.map((ds: any) => (
                  <div key={ds.id} className="flex items-start md:items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white/5 text-lg">
                        {ds.department === 'PROPERTY_TAX' ? '🏛️' : ds.department === 'ELECTRICITY' ? '⚡' : ds.department === 'WATER' ? '💧' : ds.department === 'GAS' ? '🔥' : '📋'}
                      </div>
                      <div>
                        <h4 className="font-semibold">{ds.department.replace('_', ' ')}</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          {ds.status === 'APPROVED' ? `Approved by ${ds.officer?.name || 'Officer'}` : 
                           ds.status === 'REJECTED' ? `Rejected: ${ds.remarks}` : 
                           ds.status === 'IN_REVIEW' ? 'Under review by officer' : 'Awaiting payment/review'}
                        </p>
                      </div>
                    </div>
                    <span className={`badge ${getStatusColor(ds.status)} border whitespace-nowrap`}>
                      {ds.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents */}
            <div className="glass p-6">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
                <FileText size={20} className="text-indigo-400" /> Attached Documents
              </h3>
              {transfer.documents?.length === 0 ? (
                <div className="text-center p-6 text-slate-400">No documents uploaded yet.</div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {transfer.documents?.map((doc: any) => (
                    <a key={doc.id} href={doc.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors group">
                      <div className="w-10 h-10 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                        <FileText size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{doc.type.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-slate-500 truncate">{doc.fileName}</p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
            
          </div>

          {/* Sidebar - Right 1 col */}
          <div className="space-y-6">
            {/* Timeline */}
            <div className="glass p-6">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
                <Clock size={20} className="text-indigo-400" /> Audit Timeline
              </h3>
              <div className="space-y-0 pl-2">
                {transfer.auditLogs?.map((log: any, i: number) => (
                  <div key={log.id} className="timeline-step pb-6">
                    <div className="relative z-10 w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center flex-shrink-0 text-[10px] text-slate-400 mt-1">
                      {transfer.auditLogs.length - i}
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-1 text-white">{log.action.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-slate-400">{new Date(log.createdAt).toLocaleString()}</p>
                      <p className="text-xs text-slate-500 mt-1">by {log.user?.name} ({log.user?.role})</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </AppShell>
  );
}
