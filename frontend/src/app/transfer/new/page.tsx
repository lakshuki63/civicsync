'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, User, Phone, Shield, MapPin, CheckCircle, ArrowRight, AlertCircle } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { api } from '@/lib/api';

const DEPARTMENTS = [
  { id: 'PROPERTY_TAX', label: 'Property Tax', icon: '🏛️', fee: 500, desc: 'Municipal corporation tax records' },
  { id: 'ELECTRICITY', label: 'Electricity Board', icon: '⚡', fee: 300, desc: 'Meter name transfer' },
  { id: 'WATER', label: 'Water Supply', icon: '💧', fee: 200, desc: 'Water and sewerage connection' },
  { id: 'GAS', label: 'Gas Connection', icon: '🔥', fee: 150, desc: 'Piped natural gas transfer' },
  { id: 'LAND_RECORDS', label: 'Land Records', icon: '📋', fee: 1000, desc: 'State revenue department khata' },
];

export default function NewTransferPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    propertyRegistrationNumber: '',
    address: '',
    district: '',
    state: '',
    newOwnerName: '',
    newOwnerPhone: '',
    newOwnerAadhaarLast4: '',
    departments: ['PROPERTY_TAX', 'ELECTRICITY', 'WATER', 'LAND_RECORDS'],
  });

  const toggleDept = (id: string) => {
    setForm(prev => ({
      ...prev,
      departments: prev.departments.includes(id)
        ? prev.departments.filter(d => d !== id)
        : [...prev.departments, id]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.departments.length === 0) {
      setError('Select at least one department');
      return;
    }
    
    setLoading(true); setError('');
    try {
      const res: any = await api.transfers.create(form);
      router.push(`/transfer/${res.data.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to submit request');
      setLoading(false);
    }
  };

  const totalFee = form.departments.reduce((sum, deptId) => {
    const dept = DEPARTMENTS.find(d => d.id === deptId);
    return sum + (dept ? dept.fee : 0);
  }, 0);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">New Transfer Request</h2>
          <p className="text-slate-400">Initiate ownership transfer across multiple departments at once.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Property Details */}
          <div className="glass p-6 md:p-8">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
              <Building2 size={20} className="text-indigo-400" /> Property Details
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="label">Registration Number</label>
                <input type="text" required placeholder="e.g. KA-BLR-2023-1234" 
                  value={form.propertyRegistrationNumber} onChange={e => setForm({...form, propertyRegistrationNumber: e.target.value})} 
                  className="input" />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="label">Full Address</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-3 text-slate-400" />
                <textarea required rows={3} placeholder="Complete property address"
                  value={form.address} onChange={e => setForm({...form, address: e.target.value})} 
                  className="input pl-10" />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="label">District</label>
                <input type="text" required placeholder="e.g. Bengaluru Urban" 
                  value={form.district} onChange={e => setForm({...form, district: e.target.value})} 
                  className="input" />
              </div>
              <div>
                <label className="label">State</label>
                <input type="text" required placeholder="e.g. Karnataka" 
                  value={form.state} onChange={e => setForm({...form, state: e.target.value})} 
                  className="input" />
              </div>
            </div>
          </div>

          {/* New Owner Details */}
          <div className="glass p-6 md:p-8">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
              <User size={20} className="text-indigo-400" /> New Owner Details
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="label">Full Name</label>
                <input type="text" required placeholder="As per legal documents" 
                  value={form.newOwnerName} onChange={e => setForm({...form, newOwnerName: e.target.value})} 
                  className="input" />
              </div>
              <div>
                <label className="label">Mobile Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="tel" required pattern="[6-9][0-9]{9}" placeholder="10-digit number" 
                    value={form.newOwnerPhone} onChange={e => setForm({...form, newOwnerPhone: e.target.value})} 
                    className="input pl-10" />
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="label">Aadhaar (Last 4 Digits) - Optional</label>
                <div className="relative">
                  <Shield size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" maxLength={4} pattern="[0-9]{4}" placeholder="e.g. 4521" 
                    value={form.newOwnerAadhaarLast4} onChange={e => setForm({...form, newOwnerAadhaarLast4: e.target.value})} 
                    className="input pl-10" />
                </div>
              </div>
            </div>
          </div>

          {/* Department Selection */}
          <div className="glass p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 border-b border-white/5 pb-4 gap-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <CheckCircle size={20} className="text-indigo-400" /> Select Departments
              </h3>
              <div className="text-xl font-bold bg-indigo-500/10 text-indigo-400 px-4 py-2 rounded-lg border border-indigo-500/20">
                Total Fee: ₹{totalFee}
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {DEPARTMENTS.map(dept => {
                const isSelected = form.departments.includes(dept.id);
                return (
                  <div 
                    key={dept.id} 
                    onClick={() => toggleDept(dept.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-4 ${
                      isSelected 
                        ? 'bg-indigo-500/10 border-indigo-500 shadow-[0_0_15px_rgba(79,110,247,0.15)]' 
                        : 'bg-white/[0.02] border-white/10 hover:bg-white/5'
                    }`}
                  >
                    <div className={`w-5 h-5 mt-0.5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-slate-500'
                    }`}>
                      {isSelected && <CheckCircle size={14} className="text-white" />}
                    </div>
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-white flex items-center gap-2">
                          <span>{dept.emoji}</span> {dept.label}
                        </h4>
                        <span className="text-sm font-bold text-slate-300">₹{dept.fee}</span>
                      </div>
                      <p className="text-xs text-slate-400">{dept.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4 pt-4 border-t border-[var(--glass-border)]">
            <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading || form.departments.length === 0} className="btn-primary px-8">
              {loading ? <span className="spinner" /> : <>Submit Request <ArrowRight size={18} /></>}
            </button>
          </div>

        </form>
      </div>
    </AppShell>
  );
}
