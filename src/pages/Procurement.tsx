import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { PageHeader, DataTable, Modal, StatusBadge } from '../components/ui';
import { formatDate, formatCurrency, exportToCSV } from '../utils/helpers';
import { Procurement as ProcurementType } from '../types';
import { Plus, Download, CheckCircle, XCircle } from 'lucide-react';

export default function Procurement() {
  const { user } = useAuth();
  const data = useData();
  const [refresh, setRefresh] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [showDetail, setShowDetail] = useState<ProcurementType | null>(null);
  const [filter, setFilter] = useState('all');

  const [form, setForm] = useState({
    assetName: '', assetType: 'it_equipment' as any, category: 'laptop' as any, vendorId: '',
    quantity: 1, estimatedCost: 0, expectedDelivery: '', notes: '', departmentId: '',
  });

  const procurements = data.procurements.getAll();
  const vendors = data.vendors.getAll();
  const users = data.users.getAll();
  const departments = data.departments.getAll();

  const filtered = filter === 'all' ? procurements : procurements.filter(p => p.status === filter);

  const getUserName = (id: string) => users.find(u => u.id === id)?.name || 'Unknown';
  const getVendorName = (id: string) => vendors.find(v => v.id === id)?.name || 'N/A';
  const getDeptName = (id: string) => departments.find(d => d.id === id)?.name || 'N/A';

  const handleCreate = async () => {
    if (!form.assetName || !form.departmentId) return;
    await data.procurements.create({
      assetName: form.assetName, assetType: form.assetType, category: form.category,
      requestedBy: user!.id, departmentId: form.departmentId, vendorId: form.vendorId,
      quantity: form.quantity, estimatedCost: form.estimatedCost, actualCost: null,
      status: 'requested', approvedBy: null, approvalDate: null,
      expectedDelivery: form.expectedDelivery, receivedDate: null, notes: form.notes,
      createdAt: new Date().toISOString().split('T')[0],
    });
    await data.addAuditLog(user!.id, user!.name, 'CREATE', 'Procurement', '', 'Procurement', `Requested procurement: ${form.quantity}x ${form.assetName}`);
    await data.addNotification('user-1', 'procurement', 'New Procurement Request', `${user!.name} requested ${form.quantity}x ${form.assetName}`, 'medium');
    setShowAdd(false);
    setForm({ assetName: '', assetType: 'it_equipment', category: 'laptop', vendorId: '', quantity: 1, estimatedCost: 0, expectedDelivery: '', notes: '', departmentId: '' });
    setRefresh(r => r + 1);
  };

  const handleApprove = async (p: ProcurementType) => {
    await data.procurements.update(p.id, { status: 'approved', approvedBy: user!.id, approvalDate: new Date().toISOString().split('T')[0] });
    await data.addAuditLog(user!.id, user!.name, 'APPROVE', 'Procurement', p.id, 'Procurement', `Approved procurement: ${p.assetName}`);
    await data.addNotification(p.requestedBy, 'procurement', 'Procurement Approved', `Your request for ${p.assetName} has been approved`, 'medium');
    setShowDetail(null); setRefresh(r => r + 1);
  };

  const handleReject = async (p: ProcurementType) => {
    await data.procurements.update(p.id, { status: 'rejected', approvedBy: user!.id, approvalDate: new Date().toISOString().split('T')[0] });
    await data.addAuditLog(user!.id, user!.name, 'REJECT', 'Procurement', p.id, 'Procurement', `Rejected procurement: ${p.assetName}`);
    await data.addNotification(p.requestedBy, 'procurement', 'Procurement Rejected', `Your request for ${p.assetName} has been rejected`, 'medium');
    setShowDetail(null); setRefresh(r => r + 1);
  };

  const handleMarkOrdered = async (p: ProcurementType) => {
    await data.procurements.update(p.id, { status: 'ordered' });
    await data.addAuditLog(user!.id, user!.name, 'UPDATE', 'Procurement', p.id, 'Procurement', `Marked as ordered: ${p.assetName}`);
    setShowDetail(null); setRefresh(r => r + 1);
  };

  const handleMarkReceived = async (p: ProcurementType, actualCost: number) => {
    await data.procurements.update(p.id, { status: 'received', actualCost, receivedDate: new Date().toISOString().split('T')[0] });
    await data.addAuditLog(user!.id, user!.name, 'UPDATE', 'Procurement', p.id, 'Procurement', `Received procurement: ${p.assetName}`);
    setShowDetail(null); setRefresh(r => r + 1);
  };

  const columns = [
    { key: 'assetName', label: 'Asset', render: (p: any) => <span className="font-medium">{p.assetName}</span> },
    { key: 'quantity', label: 'Qty' },
    { key: 'requestedBy', label: 'Requested By', render: (p: any) => getUserName(p.requestedBy) },
    { key: 'departmentId', label: 'Department', render: (p: any) => getDeptName(p.departmentId) },
    { key: 'vendorId', label: 'Vendor', render: (p: any) => getVendorName(p.vendorId) },
    { key: 'estimatedCost', label: 'Est. Cost', render: (p: any) => formatCurrency(p.estimatedCost) },
    { key: 'status', label: 'Status', render: (p: any) => <StatusBadge status={p.status} /> },
    { key: 'expectedDelivery', label: 'Expected', render: (p: any) => formatDate(p.expectedDelivery) },
  ];

  const filterTabs = [
    { key: 'all', label: 'All' }, { key: 'requested', label: 'Requested' }, { key: 'approved', label: 'Approved' },
    { key: 'ordered', label: 'Ordered' }, { key: 'received', label: 'Received' }, { key: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader title="Asset Procurement" subtitle="Manage purchase requests and delivery"
        action={
          <div className="flex gap-2">
            <button onClick={() => exportToCSV(filtered.map(p => ({ Asset: p.assetName, Qty: p.quantity, RequestedBy: getUserName(p.requestedBy), Department: getDeptName(p.departmentId), Vendor: getVendorName(p.vendorId), EstCost: p.estimatedCost, ActualCost: p.actualCost || '', Status: p.status, Expected: p.expectedDelivery })), 'procurement')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"><Download className="w-4 h-4" /> Export</button>
            <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors shadow-sm"><Plus className="w-4 h-4" /> New Request</button>
          </div>
        }
      />

      <div className="flex gap-2 mb-4 flex-wrap">
        {filterTabs.map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${filter === t.key ? 'bg-indigo-500 text-white shadow-sm' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300'}`}>{t.label}</button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
        <DataTable columns={columns} data={filtered} onRowClick={(p: any) => setShowDetail(p)} />
      </div>

      {/* Add Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="New Procurement Request" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Asset Name *</label>
              <input type="text" value={form.assetName} onChange={e => setForm({...form, assetName: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-white" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department *</label>
              <select value={form.departmentId} onChange={e => setForm({...form, departmentId: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-white">
                <option value="">Select department</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Asset Type</label>
              <select value={form.assetType} onChange={e => setForm({...form, assetType: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-white">
                {['furniture','it_equipment','vehicle','electronics','office_equipment','other'].map(t => <option key={t} value={t}>{t.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendor</label>
              <select value={form.vendorId} onChange={e => setForm({...form, vendorId: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-white">
                <option value="">Select vendor</option>{vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
              <input type="number" min={1} value={form.quantity} onChange={e => setForm({...form, quantity: parseInt(e.target.value) || 1})} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-white" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estimated Cost ($)</label>
              <input type="number" step="0.01" value={form.estimatedCost} onChange={e => setForm({...form, estimatedCost: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-white" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expected Delivery</label>
            <input type="date" value={form.expectedDelivery} onChange={e => setForm({...form, expectedDelivery: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-white" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-white" /></div>
          <div className="flex justify-end gap-3 pt-4">
            <button onClick={() => setShowAdd(false)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">Cancel</button>
            <button onClick={handleCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors shadow-sm">Submit Request</button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={!!showDetail} onClose={() => setShowDetail(null)} title="Procurement Details" size="lg">
        {showDetail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-gray-500 dark:text-gray-400">Asset</p><p className="text-sm font-medium text-gray-900 dark:text-white">{showDetail.assetName}</p></div>
              <div><p className="text-xs text-gray-500 dark:text-gray-400">Quantity</p><p className="text-sm font-medium text-gray-900 dark:text-white">{showDetail.quantity}</p></div>
              <div><p className="text-xs text-gray-500 dark:text-gray-400">Requested By</p><p className="text-sm font-medium text-gray-900 dark:text-white">{getUserName(showDetail.requestedBy)}</p></div>
              <div><p className="text-xs text-gray-500 dark:text-gray-400">Department</p><p className="text-sm font-medium text-gray-900 dark:text-white">{getDeptName(showDetail.departmentId)}</p></div>
              <div><p className="text-xs text-gray-500 dark:text-gray-400">Vendor</p><p className="text-sm font-medium text-gray-900 dark:text-white">{getVendorName(showDetail.vendorId)}</p></div>
              <div><p className="text-xs text-gray-500 dark:text-gray-400">Status</p><StatusBadge status={showDetail.status} /></div>
              <div><p className="text-xs text-gray-500 dark:text-gray-400">Estimated Cost</p><p className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(showDetail.estimatedCost)}</p></div>
              <div><p className="text-xs text-gray-500 dark:text-gray-400">Actual Cost</p><p className="text-sm font-medium text-gray-900 dark:text-white">{showDetail.actualCost ? formatCurrency(showDetail.actualCost) : 'N/A'}</p></div>
              <div><p className="text-xs text-gray-500 dark:text-gray-400">Expected Delivery</p><p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(showDetail.expectedDelivery)}</p></div>
              <div><p className="text-xs text-gray-500 dark:text-gray-400">Received Date</p><p className="text-sm font-medium text-gray-900 dark:text-white">{showDetail.receivedDate ? formatDate(showDetail.receivedDate) : 'Pending'}</p></div>
            </div>
            {showDetail.notes && <div><p className="text-xs text-gray-500 dark:text-gray-400">Notes</p><p className="text-sm text-gray-900 dark:text-white">{showDetail.notes}</p></div>}

            {user?.role === 'admin' && (
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-slate-700 flex-wrap">
                {showDetail.status === 'requested' && (
                  <>
                    <button onClick={() => handleApprove(showDetail)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"><CheckCircle className="w-4 h-4" /> Approve</button>
                    <button onClick={() => handleReject(showDetail)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"><XCircle className="w-4 h-4" /> Reject</button>
                  </>
                )}
                {showDetail.status === 'approved' && (
                  <button onClick={() => handleMarkOrdered(showDetail)} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors shadow-sm">Mark as Ordered</button>
                )}
                {showDetail.status === 'ordered' && (
                  <ReceivedForm onReceived={(cost) => handleMarkReceived(showDetail, cost)} estimated={showDetail.estimatedCost} />
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function ReceivedForm({ onReceived, estimated }: { onReceived: (cost: number) => void; estimated: number }) {
  const [cost, setCost] = useState(String(estimated));
  return (
    <div className="flex items-end gap-3">
      <div><label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Actual Cost ($)</label>
        <input type="number" step="0.01" value={cost} onChange={e => setCost(e.target.value)} className="w-32 px-2 py-1.5 border border-gray-300 dark:border-slate-600 rounded text-sm dark:bg-slate-700 dark:text-white" /></div>
      <button onClick={() => onReceived(parseFloat(cost) || 0)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm">Mark Received</button>
    </div>
  );
}
