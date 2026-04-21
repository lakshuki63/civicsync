'use client';
import { useState, useRef, useEffect } from 'react';
import { Upload as UploadIcon, FileText, CheckCircle, AlertCircle, Search, Shield } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { api } from '@/lib/api';

const DOC_TYPES = [
  { id: 'SALE_DEED', label: 'Sale Deed (Registered)', required: true },
  { id: 'ID_PROOF', label: 'ID Proof (Aadhaar/PAN)', required: true },
  { id: 'ADDRESS_PROOF', label: 'Address Proof', required: true },
  { id: 'PROPERTY_CARD', label: 'Property Card / Khata', required: false },
  { id: 'NO_OBJECTION_CERTIFICATE', label: 'NOC (if applicable)', required: false },
];

export default function UploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [selectedTransfer, setSelectedTransfer] = useState('');
  const [selectedDocType, setSelectedDocType] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  const [uploading, setUploading] = useState(false);
  const [fetchingDigi, setFetchingDigi] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [existingDocs, setExistingDocs] = useState<any[]>([]);

  // Load user's transfers
  useEffect(() => {
    async function load() {
      try {
        const res: any = await api.transfers.list({ status: 'DRAFT' }); // Get Drafts or Submitted
        // For demo, let's load all active
        const resAll: any = await api.transfers.list();
        const active = resAll.data.transfers.filter((t: any) => !['APPROVED', 'REJECTED'].includes(t.status));
        setTransfers(active);
        if (active.length > 0) setSelectedTransfer(active[0].id);
      } catch (err) { console.error(err); }
    }
    load();
  }, []);

  // Load docs when transfer changes
  useEffect(() => {
    if (!selectedTransfer) return;
    async function loadDocs() {
      try {
        const res: any = await api.documents.getByRequest(selectedTransfer);
        setExistingDocs(res.data);
      } catch (err) { console.error(err); }
    }
    loadDocs();
  }, [selectedTransfer]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransfer || !selectedDocType || !file) {
      setMessage({ type: 'error', text: 'Please select transfer, document type, and file.' });
      return;
    }

    setUploading(true); setMessage({ type: '', text: '' });
    const formData = new FormData();
    formData.append('requestId', selectedTransfer);
    formData.append('type', selectedDocType);
    formData.append('file', file);

    try {
      await api.documents.upload(formData);
      setMessage({ type: 'success', text: 'Document uploaded successfully.' });
      setFile(null);
      // Reload docs
      const res: any = await api.documents.getByRequest(selectedTransfer);
      setExistingDocs(res.data);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Upload failed.' });
    } finally {
      setUploading(false);
    }
  };

  const handleDigiLocker = async () => {
    if (!selectedTransfer) {
      setMessage({ type: 'error', text: 'Select a transfer request first.' });
      return;
    }
    setFetchingDigi(true); setMessage({ type: '', text: '' });
    try {
      // 1. Initiate
      const initRes: any = await api.integrations.fetchDigiLocker({ docTypes: ['AADHAAR', 'PROPERTY_CARD'] });
      // In a real app, this would redirect. Here we simulate fetching.
      
      // Simulate saving to DB (in reality backend would do this)
      setMessage({ type: 'success', text: `Fetched ${initRes.data.totalFetched} documents from DigiLocker.` });
      
      // Add mocks to UI
      const newDocs = initRes.data.documents.map((d: any, i: number) => ({
        id: `mock_${Date.now()}_${i}`,
        type: d.type === 'AADHAAR' ? 'ID_PROOF' : 'PROPERTY_CARD',
        fileName: `${d.name}.pdf`,
        fileUrl: '#',
        uploadedAt: new Date().toISOString(),
        verified: true, // DigiLocker docs are auto-verified
      }));
      setExistingDocs([...newDocs, ...existingDocs]);

    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'DigiLocker fetch failed.' });
    } finally {
      setFetchingDigi(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div>
          <h2 className="text-2xl font-bold">Document Management</h2>
          <p className="text-slate-400">Upload documents or fetch them securely from DigiLocker.</p>
        </div>

        {message.text && (
          <div className={`p-4 rounded-xl border flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {message.text}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Upload Form */}
          <div className="glass p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <UploadIcon size={20} className="text-indigo-400" /> Upload File
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Select Transfer Request</label>
                <select 
                  value={selectedTransfer} onChange={e => setSelectedTransfer(e.target.value)}
                  className="input py-3"
                >
                  <option value="" disabled>-- Select Request --</option>
                  {transfers.map(t => (
                    <option key={t.id} value={t.id}>{t.property.registrationNumber} ({t.status})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Document Type</label>
                <select 
                  value={selectedDocType} onChange={e => setSelectedDocType(e.target.value)}
                  className="input py-3"
                >
                  <option value="" disabled>-- Select Type --</option>
                  {DOC_TYPES.map(d => (
                    <option key={d.id} value={d.id}>{d.label} {d.required ? '*' : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">File</label>
                <div 
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                    file ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-700 bg-white/[0.02] hover:bg-white/5 hover:border-slate-500'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" ref={fileInputRef} className="hidden" 
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={e => setFile(e.target.files?.[0] || null)}
                  />
                  {file ? (
                    <div className="flex flex-col items-center">
                      <FileText size={32} className="text-indigo-400 mb-2" />
                      <p className="text-sm font-medium text-white">{file.name}</p>
                      <p className="text-xs text-slate-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <UploadIcon size={32} className="text-slate-500 mb-2" />
                      <p className="text-sm text-slate-300">Click to browse</p>
                      <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG (Max 10MB)</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={handleUpload} 
                  disabled={uploading || !file || !selectedDocType || !selectedTransfer} 
                  className="btn-primary w-full py-3"
                >
                  {uploading ? <span className="spinner" /> : 'Upload Document'}
                </button>
              </div>
            </div>
          </div>

          {/* DigiLocker & Existing */}
          <div className="space-y-6">
            
            {/* DigiLocker Fetch */}
            <div className="glass p-6 md:p-8 border-indigo-500/30 bg-gradient-to-br from-indigo-500/5 to-transparent">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <Shield size={24} className="text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">DigiLocker Integration</h3>
                  <p className="text-sm text-slate-400 mb-4">Skip manual uploads. Fetch verified Aadhaar, PAN, and Property Cards directly from DigiLocker.</p>
                  <button 
                    onClick={handleDigiLocker} 
                    disabled={fetchingDigi || !selectedTransfer}
                    className="btn-secondary w-full"
                  >
                    {fetchingDigi ? <span className="spinner" /> : 'Fetch from DigiLocker'}
                  </button>
                </div>
              </div>
            </div>

            {/* Existing Docs */}
            <div className="glass p-6 md:p-8">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-white/5 pb-4">
                <Search size={20} className="text-indigo-400" /> Uploaded Documents
              </h3>
              
              {!selectedTransfer ? (
                <p className="text-center text-sm text-slate-500 py-4">Select a transfer request to view documents.</p>
              ) : existingDocs.length === 0 ? (
                <p className="text-center text-sm text-slate-500 py-4">No documents uploaded yet.</p>
              ) : (
                <div className="space-y-3">
                  {existingDocs.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/[0.02]">
                      <div className="flex items-center gap-3">
                        <FileText size={18} className="text-indigo-400" />
                        <div>
                          <p className="text-sm font-medium">{doc.type.replace(/_/g, ' ')}</p>
                          <p className="text-xs text-slate-500">{doc.fileName}</p>
                        </div>
                      </div>
                      {doc.verified ? (
                        <span className="badge border-green-500/50 text-green-400 bg-green-500/10"><CheckCircle size={12}/> Verified</span>
                      ) : (
                        <span className="badge border-slate-500/50 text-slate-400 bg-slate-500/10">Pending</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </AppShell>
  );
}
