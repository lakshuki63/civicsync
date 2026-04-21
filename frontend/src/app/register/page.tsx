'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, Mail, Lock, Eye, EyeOff, ArrowRight, User, Phone, CheckCircle, Shield } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', aadhaarLast4: '' });
  const [otp, setOtp] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      // Step 1: Register User
      const res: any = await api.auth.register(form);
      setAuth(res.data.user, res.data.accessToken);

      // Step 2: Send OTP for Aadhaar verification
      await api.auth.sendOtp({ phone: form.phone, purpose: 'AADHAAR_KYC' });
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.auth.verifyOtp({ phone: form.phone, otp, purpose: 'AADHAAR_KYC' });
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-main flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Building2 size={22} className="text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">CivicSync</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-slate-400 mt-1 text-sm">Join the unified digital property platform</p>
        </div>

        <div className="glass p-8">
          {/* Progress */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-indigo-400' : 'text-slate-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 bg-slate-800'}`}>1</div>
              <span className="text-sm font-medium">Details</span>
            </div>
            <div className="w-12 h-[2px] bg-slate-800"><div className={`h-full bg-indigo-500 transition-all ${step === 2 ? 'w-full' : 'w-0'}`} /></div>
            <div className={`flex items-center gap-2 ${step === 2 ? 'text-indigo-400' : 'text-slate-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 2 ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 bg-slate-800'}`}>2</div>
              <span className="text-sm font-medium">eKYC</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" required placeholder="As per Aadhaar" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input pl-10" />
                  </div>
                </div>
                <div>
                  <label className="label">Mobile Number</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="tel" required pattern="[6-9][0-9]{9}" placeholder="10-digit number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input pl-10" />
                  </div>
                </div>
              </div>

              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="email" required placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input pl-10" />
                </div>
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type={showPass ? 'text' : 'password'} required minLength={8} placeholder="Min 8 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input pl-10 pr-10" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="label">Aadhaar (Last 4 Digits)</label>
                <div className="relative">
                  <Shield size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" required maxLength={4} pattern="[0-9]{4}" placeholder="e.g. 4521" value={form.aadhaarLast4} onChange={(e) => setForm({ ...form, aadhaarLast4: e.target.value })} className="input pl-10" />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-4">
                {loading ? <span className="spinner" /> : <>Continue to eKYC <ArrowRight size={16} /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-2">
                <Shield size={28} className="text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Aadhaar eKYC</h3>
                <p className="text-slate-400 text-sm">Enter the 6-digit OTP sent to your Aadhaar-linked mobile ending in **{form.phone.slice(-4)}</p>
                {process.env.NODE_ENV === 'development' && <p className="text-xs text-indigo-400 mt-2 bg-indigo-500/10 p-2 rounded inline-block">Dev Mode: Check backend console for OTP</p>}
              </div>

              <div>
                <input type="text" required maxLength={6} placeholder="••••••" value={otp} onChange={(e) => setOtp(e.target.value)} className="input text-center text-2xl tracking-widest py-4" />
              </div>

              <button type="submit" disabled={loading || otp.length !== 6} className="btn-primary w-full py-3">
                {loading ? <span className="spinner" /> : <>Verify & Complete <CheckCircle size={16} /></>}
              </button>
            </form>
          )}

          {step === 1 && (
            <p className="text-center text-sm text-slate-400 mt-6">
              Already have an account? <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Log in</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
