'use client';
import { useEffect, useState } from 'react';
import { Activity, Search } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { api } from '@/lib/api';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchAction, setSearchAction] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchAction) params.action = searchAction;
      const res: any = await api.admin.auditLogs(params);
      setLogs(res.data.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => loadData(), 400);
    return () => clearTimeout(timer);
  }, [searchAction]);

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div>
          <h2 className="text-2xl font-bold">System Audit Logs</h2>
          <p className="text-slate-400">Immutable record of all critical system actions</p>
        </div>

        <div className="glass p-4">
          <div className="relative w-full sm:w-96">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" placeholder="Search by Action (e.g. LOGIN, DEPT_STATUS)..." 
              value={searchAction} onChange={(e) => setSearchAction(e.target.value)}
              className="input pl-10" 
            />
          </div>
        </div>

        <div className="glass overflow-hidden">
          {loading ? (
            <div className="flex justify-center p-12"><div className="spinner" /></div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-slate-400">No logs found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="p-4 font-semibold text-sm text-slate-300">Timestamp</th>
                    <th className="p-4 font-semibold text-sm text-slate-300">Action</th>
                    <th className="p-4 font-semibold text-sm text-slate-300">User</th>
                    <th className="p-4 font-semibold text-sm text-slate-300">Entity</th>
                    <th className="p-4 font-semibold text-sm text-slate-300">IP & Agent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors font-mono text-xs">
                      <td className="p-4 text-slate-400 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className="bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded border border-indigo-500/20 font-bold tracking-wide">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-white">{log.user?.email || log.userId}</span>
                          <span className="text-slate-500">{log.user?.role}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-slate-400">{log.entityType}: </span>
                        <span className="text-slate-300">{log.entityId || 'N/A'}</span>
                        {log.metadata && (
                          <div className="mt-1 text-[10px] text-slate-500 max-w-xs truncate" title={JSON.stringify(log.metadata)}>
                            {JSON.stringify(log.metadata)}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-slate-500">
                        {log.ipAddress || 'Unknown IP'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </AppShell>
  );
}
