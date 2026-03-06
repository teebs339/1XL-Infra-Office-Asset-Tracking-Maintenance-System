import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { PageHeader, DataTable, Modal, ConfirmDialog } from '../components/ui';
import { formatDate, exportToCSV } from '../utils/helpers';
import { Document } from '../types';
import { Plus, Download, FileText, Trash2, File, FileImage, FileSpreadsheet } from 'lucide-react';

export default function Documents() {
  const { user } = useAuth();
  const data = useData();
  const [refresh, setRefresh] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null);
  const [typeFilter, setTypeFilter] = useState('all');

  const [form, setForm] = useState({ assetId: '', name: '', type: 'warranty' as Document['type'], description: '', fileSize: '' });

  const documents = data.documents.getAll();
  const assets = data.assets.getAll();
  const users = data.users.getAll();

  const filtered = typeFilter === 'all' ? documents : documents.filter(d => d.type === typeFilter);

  const getAssetName = (id: string) => { const a = assets.find(a => a.id === id); return a ? `${a.assetTag} - ${a.name}` : 'N/A'; };
  const getUserName = (id: string) => users.find(u => u.id === id)?.name || 'Unknown';

  const handleCreate = async () => {
    if (!form.name || !form.assetId) return;
    await data.documents.create({
      assetId: form.assetId, name: form.name, type: form.type, description: form.description,
      fileSize: form.fileSize || 'N/A', uploadedBy: user!.id,
      createdAt: new Date().toISOString().split('T')[0],
    });
    await data.addAuditLog(user!.id, user!.name, 'CREATE', 'Documents', form.assetId, 'Document', `Uploaded document: ${form.name}`);
    setShowAdd(false);
    setForm({ assetId: '', name: '', type: 'warranty', description: '', fileSize: '' });
    setRefresh(r => r + 1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await data.documents.remove(deleteTarget.id);
    await data.addAuditLog(user!.id, user!.name, 'DELETE', 'Documents', deleteTarget.id, 'Document', `Deleted document: ${deleteTarget.name}`);
    setDeleteTarget(null); setRefresh(r => r + 1);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warranty': return <FileText className="w-4 h-4 text-indigo-500" />;
      case 'invoice': return <FileSpreadsheet className="w-4 h-4 text-green-500" />;
      case 'manual': return <File className="w-4 h-4 text-purple-500" />;
      case 'service_report': return <FileImage className="w-4 h-4 text-orange-500" />;
      default: return <File className="w-4 h-4 text-gray-500 dark:text-gray-400" />;
    }
  };

  const columns = [
    { key: 'name', label: 'Document', render: (d: any) => (
      <div className="flex items-center gap-2">{getTypeIcon(d.type)}<span className="font-medium">{d.name}</span></div>
    )},
    { key: 'type', label: 'Type', render: (d: any) => (
      <span className="px-2 py-0.5 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 rounded text-xs capitalize">{d.type.replace(/_/g, ' ')}</span>
    )},
    { key: 'assetId', label: 'Asset', render: (d: any) => getAssetName(d.assetId) },
    { key: 'description', label: 'Description', render: (d: any) => <span className="truncate max-w-[200px] block text-gray-500 dark:text-gray-400">{d.description}</span> },
    { key: 'fileSize', label: 'Size' },
    { key: 'uploadedBy', label: 'Uploaded By', render: (d: any) => getUserName(d.uploadedBy) },
    { key: 'createdAt', label: 'Date', render: (d: any) => formatDate(d.createdAt) },
    { key: 'actions', label: '', render: (d: any) => (
      <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(d); }} className="p-1.5 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4 text-red-500" /></button>
    )},
  ];

  const typeFilters = ['all', 'warranty', 'invoice', 'manual', 'service_report', 'purchase_order', 'other'];

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader title="Documents & Warranty Management" subtitle={`${documents.length} documents`}
        action={
          <div className="flex gap-2">
            <button onClick={() => exportToCSV(documents.map(d => ({ Name: d.name, Type: d.type, Asset: getAssetName(d.assetId), Description: d.description, Size: d.fileSize, UploadedBy: getUserName(d.uploadedBy), Date: d.createdAt })), 'documents')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50"><Download className="w-4 h-4" /> Export</button>
            <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-500 rounded-lg hover:bg-indigo-600"><Plus className="w-4 h-4" /> Upload Document</button>
          </div>
        }
      />

      <div className="flex gap-2 mb-4 flex-wrap">
        {typeFilters.map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg capitalize ${typeFilter === t ? 'bg-indigo-500 text-white' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}>
            {t === 'all' ? 'All' : t.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-5">
        <DataTable columns={columns} data={filtered} />
      </div>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Upload Document" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Document Name *</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Document Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value as any})} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white">
                <option value="warranty">Warranty</option><option value="invoice">Invoice</option><option value="manual">Manual</option>
                <option value="service_report">Service Report</option><option value="purchase_order">Purchase Order</option><option value="other">Other</option>
              </select></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Asset *</label>
            <select value={form.assetId} onChange={e => setForm({...form, assetId: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white">
              <option value="">Select asset</option>{assets.map(a => <option key={a.id} value={a.id}>{a.assetTag} - {a.name}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">File Size</label>
            <input type="text" value={form.fileSize} onChange={e => setForm({...form, fileSize: e.target.value})} placeholder="e.g., 2.5 MB"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white" /></div>
          <div className="flex justify-end gap-3 pt-4">
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600">Cancel</button>
            <button onClick={handleCreate} className="px-4 py-2 text-sm font-medium text-white bg-indigo-500 rounded-lg hover:bg-indigo-600">Upload</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Document" message={`Delete "${deleteTarget?.name}"? This cannot be undone.`} />
    </div>
  );
}
