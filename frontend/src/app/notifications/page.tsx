'use client';
import { useEffect, useState } from 'react';
import { Bell, CheckCircle, Info, AlertCircle, Check } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res: any = await api.notifications.list();
      setNotifications(res.data.notifications);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.notifications.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Notifications</h2>
            <p className="text-slate-400">Updates on your transfers and account</p>
          </div>
          <button onClick={markAllRead} className="btn-secondary text-sm">
            <Check size={16} /> Mark all read
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center p-12"><div className="spinner" /></div>
        ) : notifications.length === 0 ? (
          <div className="glass p-12 text-center text-slate-400">
            <Bell size={48} className="mx-auto mb-4 opacity-20" />
            <p>No notifications found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => {
              const Icon = n.type === 'SUCCESS' ? CheckCircle : n.type === 'ERROR' ? AlertCircle : Info;
              const color = n.type === 'SUCCESS' ? 'text-green-400' : n.type === 'ERROR' ? 'text-red-400' : 'text-blue-400';
              const bg = n.read ? 'bg-white/[0.02] border-white/5' : 'bg-indigo-500/5 border-indigo-500/20';

              return (
                <div key={n.id} className={`glass p-4 transition-colors flex items-start gap-4 ${bg}`}>
                  <div className={`mt-1 ${color}`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <h4 className={`font-semibold ${n.read ? 'text-slate-300' : 'text-white'}`}>{n.title}</h4>
                      <span className="text-xs text-slate-500 whitespace-nowrap">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={`text-sm mb-2 ${n.read ? 'text-slate-400' : 'text-slate-300'}`}>{n.message}</p>
                    
                    <div className="flex items-center gap-4">
                      {n.link && (
                        <Link href={n.link} className="text-xs font-medium text-indigo-400 hover:text-indigo-300">
                          View Details
                        </Link>
                      )}
                      {!n.read && (
                        <button onClick={() => markAsRead(n.id)} className="text-xs font-medium text-slate-400 hover:text-white">
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                  {!n.read && (
                    <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-2" />
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </AppShell>
  );
}
