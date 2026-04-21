'use client';
import { useEffect, useState } from 'react';
import { Search, Filter, Shield, User, Power, ShieldAlert, Check } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { api } from '@/lib/api';

const ROLES = ['CITIZEN', 'OFFICER', 'ADMIN'];
const DEPARTMENTS = ['PROPERTY_TAX', 'ELECTRICITY', 'WATER', 'GAS', 'LAND_RECORDS'];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  // Edit modal
  const [editUser, setEditUser] = useState<any>(null);
  const [form, setForm] = useState({ role: '', department: '', isActive: true });
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const res: any = await api.admin.users(params);
      setUsers(res.data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => loadData(), 400);
    return () => clearTimeout(timer);
  }, [search, roleFilter]);

  const handleEditClick = (u: any) => {
    setEditUser(u);
    setForm({ role: u.role, department: u.department || '', isActive: u.isActive });
  };

  const handleSave = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      const payload: any = { role: form.role, isActive: form.isActive };
      if (form.role === 'OFFICER' && form.department) payload.department = form.department;
      if (form.role !== 'OFFICER') payload.department = null;

      await api.admin.updateUser(editUser.id, payload);
      setEditUser(null);
      loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-slate-400">Manage all registered accounts</p>
        </div>

        <div className="glass p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" placeholder="Search by name, email, or phone..." 
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="input pl-10" 
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Filter size={18} className="text-slate-400" />
            <select 
              value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
              className="input py-2"
            >
              <option value="">All Roles</option>
              <option value="CITIZEN">Citizen</option>
              <option value="OFFICER">Officer</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>

        <div className="glass overflow-hidden">
          {loading ? (
            <div className="flex justify-center p-12"><div className="spinner" /></div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-slate-400">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="p-4 font-semibold text-sm text-slate-300">User</th>
                    <th className="p-4 font-semibold text-sm text-slate-300">Contact</th>
                    <th className="p-4 font-semibold text-sm text-slate-300">Role</th>
                    <th className="p-4 font-semibold text-sm text-slate-300">Status</th>
                    <th className="p-4 font-semibold text-sm text-slate-300 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            u.role === 'ADMIN' ? 'bg-red-500/20 text-red-400' :
                            u.role === 'OFFICER' ? 'bg-purple-500/20 text-purple-400' : 'bg-indigo-500/20 text-indigo-400'
                          }`}>
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-white text-sm flex items-center gap-1">
                              {u.name} {u.aadhaarVerified && <Check size={12} className="text-green-400" title="Aadhaar Verified"/>}
                            </p>
                            <p className="text-xs text-slate-500">Joined {new Date(u.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm">{u.email}</p>
                        <p className="text-xs text-slate-400">{u.phone}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`badge border text-[10px] ${
                            u.role === 'ADMIN' ? 'border-red-500/50 text-red-400 bg-red-500/10' :
                            u.role === 'OFFICER' ? 'border-purple-500/50 text-purple-400 bg-purple-500/10' : 'border-indigo-500/50 text-indigo-400 bg-indigo-500/10'
                          }`}>{u.role}</span>
                          {u.department && <span className="text-[10px] text-slate-400 font-medium">{u.department.replace('_', ' ')}</span>}
                        </div>
                      </td>
                      <td className="p-4">
                        {u.isActive ? (
                          <span className="badge border-green-500/50 text-green-400 bg-green-500/10 text-[10px]">Active</span>
                        ) : (
                          <span className="badge border-slate-500/50 text-slate-400 bg-slate-500/10 text-[10px]">Inactive</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleEditClick(u)} className="btn-secondary py-1.5 px-3 text-xs">
                          Edit Role
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Edit Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--navy-900)] border border-[var(--glass-border)] rounded-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="font-bold">Edit User: {editUser.name}</h3>
              <button onClick={() => setEditUser(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="label">Role</label>
                <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="input">
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              {form.role === 'OFFICER' && (
                <div>
                  <label className="label">Department</label>
                  <select value={form.department} onChange={e => setForm({...form, department: e.target.value})} className="input">
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d.replace('_', ' ')}</option>)}
                  </select>
                </div>
              )}

              <div className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/5">
                <button 
                  type="button"
                  onClick={() => setForm({...form, isActive: !form.isActive})}
                  className={`w-10 h-5 rounded-full relative transition-colors ${form.isActive ? 'bg-indigo-500' : 'bg-slate-700'}`}
                >
                  <div className={`w-3 h-3 rounded-full bg-white absolute top-1 transition-all ${form.isActive ? 'left-6' : 'left-1'}`} />
                </button>
                <div>
                  <p className="text-sm font-medium">Account Active</p>
                  <p className="text-xs text-slate-400">Turn off to suspend user access</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
              <button onClick={() => setEditUser(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving || (form.role === 'OFFICER' && !form.department)} className="btn-primary">
                {saving ? <span className="spinner border-2" /> : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

    </AppShell>
  );
}
