const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('civicsync-auth');
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      return parsed?.state?.token || null;
    } catch { return null; }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }
    return data;
  }

  // Auth
  auth = {
    register: (body: any) => this.request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body: any) => this.request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    sendOtp: (body: any) => this.request('/auth/otp/send', { method: 'POST', body: JSON.stringify(body) }),
    verifyOtp: (body: any) => this.request('/auth/otp/verify', { method: 'POST', body: JSON.stringify(body) }),
    me: () => this.request('/auth/me'),
  };

  // Transfers
  transfers = {
    create: (body: any) => this.request('/transfers', { method: 'POST', body: JSON.stringify(body) }),
    list: (params?: Record<string, string>) => {
      const q = params ? '?' + new URLSearchParams(params).toString() : '';
      return this.request(`/transfers${q}`);
    },
    get: (id: string) => this.request(`/transfers/${id}`),
    updateDeptStatus: (id: string, department: string, body: any) =>
      this.request(`/transfers/${id}/department/${department}`, { method: 'PATCH', body: JSON.stringify(body) }),
  };

  // Documents
  documents = {
    upload: (formData: FormData) => {
      const token = this.getToken();
      return fetch(`${API_URL}/documents/upload`, {
        method: 'POST',
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
        body: formData,
      }).then(r => r.json());
    },
    getByRequest: (requestId: string) => this.request(`/documents/request/${requestId}`),
  };

  // Admin
  admin = {
    stats: () => this.request('/admin/stats'),
    users: (params?: Record<string, string>) => {
      const q = params ? '?' + new URLSearchParams(params).toString() : '';
      return this.request(`/admin/users${q}`);
    },
    updateUser: (id: string, body: any) => this.request(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    auditLogs: (params?: Record<string, string>) => {
      const q = params ? '?' + new URLSearchParams(params).toString() : '';
      return this.request(`/admin/audit-logs${q}`);
    },
  };

  // Notifications
  notifications = {
    list: (params?: Record<string, string>) => {
      const q = params ? '?' + new URLSearchParams(params).toString() : '';
      return this.request(`/notifications${q}`);
    },
    markRead: (id: string) => this.request(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () => this.request('/notifications/read-all', { method: 'PATCH' }),
  };

  // Payments
  payments = {
    initiate: (body: any) => this.request('/payments/initiate', { method: 'POST', body: JSON.stringify(body) }),
    verify: (body: any) => this.request('/payments/verify', { method: 'POST', body: JSON.stringify(body) }),
  };

  // Integrations
  integrations = {
    fetchDigiLocker: (body: any) => this.request('/integrations/digilocker/fetch', { method: 'POST', body: JSON.stringify(body) }),
    aadhaarKyc: (body: any) => this.request('/integrations/aadhaar/kyc', { method: 'POST', body: JSON.stringify(body) }),
    aadhaarVerify: (body: any) => this.request('/integrations/aadhaar/verify', { method: 'POST', body: JSON.stringify(body) }),
    chatbot: (message: string) => this.request('/integrations/chatbot/message', { method: 'POST', body: JSON.stringify({ message }) }),
  };
}

export const api = new ApiClient();
