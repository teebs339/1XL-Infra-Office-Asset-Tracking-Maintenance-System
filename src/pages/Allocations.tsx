import React, { useState, useMemo } from 'react';
import { Allocation, AllocationStatus } from '../types';
import { useData } from '../contexts/DataContext';
import { PageHeader, DataTable, Modal, StatusBadge, ConfirmDialog } from '../components/ui';
import { formatDate, exportToCSV } from '../utils/helpers';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Download, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

type FilterTab = 'all' | 'pending' | 'active' | 'returned';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'active', label: 'Active' },
  { key: 'returned', label: 'Returned' },
];

export default function Allocations() {
  const { user, hasRole } = useAuth();
  const data = useData();
  const isManagerOrAdmin = hasRole(['admin', 'manager']);

  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState<Allocation | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Return asset flow
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnAllocation, setReturnAllocation] = useState<Allocation | null>(null);
  const [returnCondition, setReturnCondition] = useState('');

  // Confirm dialogs
  const [confirmAction, setConfirmAction] = useState<{ type: 'approve' | 'reject'; allocation: Allocation } | null>(null);

  // New request form state
  const [formData, setFormData] = useState({
    assetId: '',
    employeeId: '',
    departmentId: '',
    notes: '',
  });

  const refresh = () => setRefreshCounter(c => c + 1);

  const allocations = useMemo(() => data.allocations.getAll(), [refreshCounter]);
  const assets = useMemo(() => data.assets.getAll(), [refreshCounter]);
  const users = useMemo(() => data.users.getAll(), [refreshCounter]);
  const departments = useMemo(() => data.departments.getAll(), [refreshCounter]);

  const availableAssets = useMemo(
    () => assets.filter(a => a.status === 'available'),
    [assets]
  );

  const filteredAllocations = useMemo(() => {
    if (activeTab === 'all') return allocations;
    if (activeTab === 'pending') return allocations.filter(a => a.status === 'pending');
    if (activeTab === 'active') return allocations.filter(a => a.status === 'approved' || a.status === 'active');
    if (activeTab === 'returned') return allocations.filter(a => a.status === 'returned');
    return allocations;
  }, [allocations, activeTab]);

  const getAssetName = (id: string) => assets.find(a => a.id === id)?.name || 'Unknown';
  const getUserName = (id: string | null) => {
    if (!id) return 'N/A';
    return users.find(u => u.id === id)?.name || 'Unknown';
  };
  const getDeptName = (id: string) => departments.find(d => d.id === id)?.name || 'Unknown';

  const columns = [
    { key: 'assetId', label: 'Asset', render: (item: Record<string, unknown>) => getAssetName(item.assetId as string) },
    { key: 'employeeId', label: 'Employee', render: (item: Record<string, unknown>) => getUserName(item.employeeId as string) },
    { key: 'departmentId', label: 'Department', render: (item: Record<string, unknown>) => getDeptName(item.departmentId as string) },
    { key: 'startDate', label: 'Start Date', render: (item: Record<string, unknown>) => formatDate(item.startDate as string) },
    { key: 'endDate', label: 'End Date', render: (item: Record<string, unknown>) => (item.endDate as string | null) ? formatDate(item.endDate as string) : 'Ongoing' },
    { key: 'status', label: 'Status', render: (item: Record<string, unknown>) => <StatusBadge status={item.status as string} /> },
    { key: 'approvedBy', label: 'Approved By', render: (item: Record<string, unknown>) => getUserName(item.approvedBy as string | null) },
  ];

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.assetId || !formData.employeeId || !formData.departmentId) return;

    const now = new Date().toISOString();
    await data.allocations.create({
      assetId: formData.assetId,
      employeeId: formData.employeeId,
      departmentId: formData.departmentId,
      startDate: now,
      endDate: null,
      status: 'pending' as AllocationStatus,
      approvedBy: null,
      approvalDate: null,
      returnDate: null,
      returnCondition: null,
      notes: formData.notes,
      createdAt: now,
    });

    await data.addAuditLog(
      user!.id, user!.name, 'Created allocation request', 'allocations',
      formData.assetId, 'allocation',
      `Allocation request for asset ${getAssetName(formData.assetId)} to ${getUserName(formData.employeeId)}`
    );

    setFormData({ assetId: '', employeeId: '', departmentId: '', notes: '' });
    setShowNewModal(false);
    refresh();
  };

  const handleApprove = async (allocation: Allocation) => {
    const now = new Date().toISOString();
    await data.allocations.update(allocation.id, { status: 'approved' as AllocationStatus, approvedBy: user!.id, approvalDate: now });
    await data.assets.update(allocation.assetId, { status: 'allocated' });
    await data.addNotification(allocation.employeeId, 'allocation', 'Allocation Approved', `Your request for ${getAssetName(allocation.assetId)} has been approved by ${user!.name}.`, 'medium');
    await data.addAuditLog(user!.id, user!.name, 'Approved allocation', 'allocations', allocation.id, 'allocation', `Approved allocation of ${getAssetName(allocation.assetId)} to ${getUserName(allocation.employeeId)}`);
    setSelectedAllocation(null);
    refresh();
  };

  const handleReject = async (allocation: Allocation) => {
    await data.allocations.update(allocation.id, { status: 'rejected' as AllocationStatus, approvedBy: user!.id });
    await data.addNotification(allocation.employeeId, 'allocation', 'Allocation Rejected', `Your request for ${getAssetName(allocation.assetId)} has been rejected by ${user!.name}.`, 'medium');
    await data.addAuditLog(user!.id, user!.name, 'Rejected allocation', 'allocations', allocation.id, 'allocation', `Rejected allocation of ${getAssetName(allocation.assetId)} to ${getUserName(allocation.employeeId)}`);
    setSelectedAllocation(null);
    refresh();
  };

  const handleReturn = async () => {
    if (!returnAllocation) return;
    const now = new Date().toISOString();
    await data.allocations.update(returnAllocation.id, { returnDate: now, status: 'returned' as AllocationStatus, returnCondition: returnCondition || null });
    await data.assets.update(returnAllocation.assetId, { status: 'available' });
    await data.addAuditLog(user!.id, user!.name, 'Returned asset', 'allocations', returnAllocation.id, 'allocation', `Returned asset ${getAssetName(returnAllocation.assetId)}. Condition: ${returnCondition || 'Not specified'}`);
    setReturnCondition('');
    setReturnAllocation(null);
    setShowReturnModal(false);
    setSelectedAllocation(null);
    refresh();
  };

  const handleExportCSV = () => {
    const rows = filteredAllocations.map(a => ({
      Asset: getAssetName(a.assetId), Employee: getUserName(a.employeeId), Department: getDeptName(a.departmentId),
      'Start Date': formatDate(a.startDate), 'End Date': a.endDate ? formatDate(a.endDate) : 'Ongoing',
      Status: a.status, 'Approved By': getUserName(a.approvedBy),
      'Return Date': a.returnDate ? formatDate(a.returnDate) : '', 'Return Condition': a.returnCondition || '', Notes: a.notes,
    }));
    exportToCSV(rows, 'asset-allocations');
  };

  const openReturnFlow = (alloc: Allocation) => {
    setReturnAllocation(alloc);
    setReturnCondition('');
    setShowReturnModal(true);
  };

  const tabCounts: Record<FilterTab, number> = {
    all: allocations.length,
    pending: allocations.filter(a => a.status === 'pending').length,
    active: allocations.filter(a => a.status === 'approved' || a.status === 'active').length,
    returned: allocations.filter(a => a.status === 'returned').length,
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="Asset Allocations"
        action={
          <div className="flex gap-2">
            <button onClick={handleExportCSV} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button onClick={() => setShowNewModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors shadow-sm">
              <Plus className="w-4 h-4" /> New Request
            </button>
          </div>
        }
      />

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTER_TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              activeTab === tab.key
                ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-medium'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}>
            {tab.label}
            <span className="ml-1.5 text-xs text-gray-400 dark:text-gray-500">({tabCounts[tab.key]})</span>
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
        <DataTable columns={columns} data={filteredAllocations as unknown as Record<string, unknown>[]}
          onRowClick={(item) => { setSelectedAllocation(item as unknown as Allocation); }}
          emptyMessage="No allocations found" />
      </div>

      {/* New Request Modal */}
      <Modal isOpen={showNewModal} onClose={() => setShowNewModal(false)} title="New Allocation Request" size="md">
        <form onSubmit={handleCreateRequest} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Asset</label>
            <select value={formData.assetId} onChange={e => setFormData(f => ({ ...f, assetId: e.target.value }))} required
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-white">
              <option value="">Select an available asset</option>
              {availableAssets.map(a => (<option key={a.id} value={a.id}>{a.name} ({a.assetTag})</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee</label>
            <select value={formData.employeeId} onChange={e => setFormData(f => ({ ...f, employeeId: e.target.value }))} required
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-white">
              <option value="">Select an employee</option>
              {users.filter(u => u.isActive).map(u => (<option key={u.id} value={u.id}>{u.name} ({u.email})</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
            <select value={formData.departmentId} onChange={e => setFormData(f => ({ ...f, departmentId: e.target.value }))} required
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-white">
              <option value="">Select a department</option>
              {departments.map(d => (<option key={d.id} value={d.id}>{d.name}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
            <textarea value={formData.notes} onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))} rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-white"
              placeholder="Optional notes about this allocation..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowNewModal(false)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">Cancel</button>
            <button type="submit" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors shadow-sm">Submit Request</button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={!!selectedAllocation} onClose={() => setSelectedAllocation(null)} title="Allocation Details" size="lg">
        {selectedAllocation && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Asset</p><p className="text-sm text-gray-900 dark:text-white font-semibold mt-0.5">{getAssetName(selectedAllocation.assetId)}</p></div>
              <div><p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Employee</p><p className="text-sm text-gray-900 dark:text-white font-semibold mt-0.5">{getUserName(selectedAllocation.employeeId)}</p></div>
              <div><p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Department</p><p className="text-sm text-gray-900 dark:text-white mt-0.5">{getDeptName(selectedAllocation.departmentId)}</p></div>
              <div><p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Status</p><div className="mt-0.5"><StatusBadge status={selectedAllocation.status} /></div></div>
              <div><p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Start Date</p><p className="text-sm text-gray-900 dark:text-white mt-0.5">{formatDate(selectedAllocation.startDate)}</p></div>
              <div><p className="text-xs text-gray-500 dark:text-gray-400 font-medium">End Date</p><p className="text-sm text-gray-900 dark:text-white mt-0.5">{selectedAllocation.endDate ? formatDate(selectedAllocation.endDate) : 'Ongoing'}</p></div>
              <div><p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Approved By</p><p className="text-sm text-gray-900 dark:text-white mt-0.5">{getUserName(selectedAllocation.approvedBy)}</p></div>
              <div><p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Approval Date</p><p className="text-sm text-gray-900 dark:text-white mt-0.5">{selectedAllocation.approvalDate ? formatDate(selectedAllocation.approvalDate) : 'N/A'}</p></div>
              {selectedAllocation.returnDate && (<div><p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Return Date</p><p className="text-sm text-gray-900 dark:text-white mt-0.5">{formatDate(selectedAllocation.returnDate)}</p></div>)}
              {selectedAllocation.returnCondition && (<div><p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Return Condition</p><p className="text-sm text-gray-900 dark:text-white mt-0.5">{selectedAllocation.returnCondition}</p></div>)}
            </div>
            {selectedAllocation.notes && (
              <div><p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Notes</p><p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">{selectedAllocation.notes}</p></div>
            )}
            <div><p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Created At</p><p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{formatDate(selectedAllocation.createdAt)}</p></div>
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-slate-700">
              {isManagerOrAdmin && selectedAllocation.status === 'pending' && (
                <>
                  <button onClick={() => setConfirmAction({ type: 'reject', allocation: selectedAllocation })}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30">
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                  <button onClick={() => setConfirmAction({ type: 'approve', allocation: selectedAllocation })}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm">
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                </>
              )}
              {(selectedAllocation.status === 'approved' || selectedAllocation.status === 'active') && (
                <button onClick={() => openReturnFlow(selectedAllocation)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-lg hover:bg-gray-800 transition-colors shadow-sm">
                  <RotateCcw className="w-4 h-4" /> Return Asset
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Return Asset Modal */}
      <Modal isOpen={showReturnModal} onClose={() => { setShowReturnModal(false); setReturnAllocation(null); setReturnCondition(''); }} title="Return Asset" size="sm">
        {returnAllocation && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Returning <span className="font-semibold">{getAssetName(returnAllocation.assetId)}</span> allocated to{' '}
              <span className="font-semibold">{getUserName(returnAllocation.employeeId)}</span>.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Return Condition</label>
              <textarea value={returnCondition} onChange={e => setReturnCondition(e.target.value)} rows={3}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-white"
                placeholder="Describe the condition of the asset upon return..." />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => { setShowReturnModal(false); setReturnAllocation(null); setReturnCondition(''); }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">Cancel</button>
              <button onClick={handleReturn}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-lg hover:bg-gray-800 transition-colors shadow-sm">
                <RotateCcw className="w-4 h-4" /> Confirm Return
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog isOpen={confirmAction?.type === 'approve'} onClose={() => setConfirmAction(null)}
        onConfirm={() => { if (confirmAction?.allocation) handleApprove(confirmAction.allocation); setConfirmAction(null); }}
        title="Approve Allocation"
        message={`Are you sure you want to approve the allocation of ${confirmAction ? getAssetName(confirmAction.allocation.assetId) : ''} to ${confirmAction ? getUserName(confirmAction.allocation.employeeId) : ''}?`} />

      <ConfirmDialog isOpen={confirmAction?.type === 'reject'} onClose={() => setConfirmAction(null)}
        onConfirm={() => { if (confirmAction?.allocation) handleReject(confirmAction.allocation); setConfirmAction(null); }}
        title="Reject Allocation"
        message={`Are you sure you want to reject the allocation of ${confirmAction ? getAssetName(confirmAction.allocation.assetId) : ''} to ${confirmAction ? getUserName(confirmAction.allocation.employeeId) : ''}?`} />
    </div>
  );
}
