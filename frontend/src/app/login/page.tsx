'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res: any = await api.auth.login(form);
      setAuth(res.data.user, res.data.accessToken);
      const role = res.data.user.role;
      router.replace(role === 'ADMIN' ? '/admin' : role === 'OFFICER' ? '/officer' : '/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: string) => {
    const creds: Record<string, { email: string; password: string }> = {
      citizen: { email: 'citizen@example.com', password: 'Citizen@123' },
      officer: { email: 'officer.property_tax@civicsync.gov.in', password: 'Officer@123' },
      admin: { email: 'admin@civicsync.gov.in', password: 'Admin@123' },
    };
    setForm(creds[role]);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-main flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Building2 size={22} className="text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">CivicSync</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-slate-400 mt-1 text-sm">Sign in to manage your property transfers</p>
        </div>

        <div className="glass p-8">
          {/* Demo quick-fill */}
          <div className="mb-6">
            <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">Quick Demo Login</p>
            <div className="flex gap-2">
              {['citizen', 'officer', 'admin'].map((role) => (
                <button key={role} onClick={() => fillDemo(role)}
                  className="flex-1 py-1.5 text-xs font-medium rounded-lg border border-white/10 text-slate-400 hover:bg-white/5 hover:text-white capitalize transition-all">
                  {role}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email" required placeholder="you@example.com"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPass ? 'text' : 'password'} required placeholder="••••••••"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input pl-10 pr-10"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? <span className="spinner" /> : <>Sign In <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Don't have an account?{' '}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Register here
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Secured by Aadhaar eKYC · DigiLocker Integrated · Government of India
        </p>
      </div>
    </div>
  );
}
