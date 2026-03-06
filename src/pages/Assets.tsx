import React, { useState, useMemo } from 'react';
import { Asset, AssetType, AssetCategory, AssetStatus } from '../types';
import { useData } from '../contexts/DataContext';
import { PageHeader, DataTable, Modal, StatusBadge, ConfirmDialog } from '../components/ui';
import { formatCurrency, formatDate, exportToCSV } from '../utils/helpers';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Download, Edit, Trash2, Package } from 'lucide-react';

const ASSET_TYPES: { value: AssetType; label: string }[] = [
  { value: 'furniture', label: 'Furniture' },
  { value: 'it_equipment', label: 'IT Equipment' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'office_equipment', label: 'Office Equipment' },
  { value: 'other', label: 'Other' },
];

const ASSET_CATEGORIES: { value: AssetCategory; label: string }[] = [
  { value: 'laptop', label: 'Laptop' },
  { value: 'desktop', label: 'Desktop' },
  { value: 'monitor', label: 'Monitor' },
  { value: 'printer', label: 'Printer' },
  { value: 'chair', label: 'Chair' },
  { value: 'desk', label: 'Desk' },
  { value: 'phone', label: 'Phone' },
  { value: 'projector', label: 'Projector' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'server', label: 'Server' },
  { value: 'networking', label: 'Networking' },
  { value: 'other', label: 'Other' },
];

const ASSET_STATUSES: { value: AssetStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'available', label: 'Available' },
  { value: 'allocated', label: 'Allocated' },
  { value: 'under_maintenance', label: 'Under Maintenance' },
  { value: 'retired', label: 'Retired' },
];

interface AssetFormData {
  name: string;
  type: AssetType;
  category: AssetCategory;
  brand: string;
  model: string;
  serialNumber: string;
  locationId: string;
  departmentId: string;
  purchaseDate: string;
  purchaseCost: number;
  warrantyStart: string;
  warrantyEnd: string;
  status: AssetStatus;
  vendorId: string;
  description: string;
  usefulLifeYears: number;
  salvageValue: number;
}

const emptyForm: AssetFormData = {
  name: '',
  type: 'it_equipment',
  category: 'laptop',
  brand: '',
  model: '',
  serialNumber: '',
  locationId: '',
  departmentId: '',
  purchaseDate: '',
  purchaseCost: 0,
  warrantyStart: '',
  warrantyEnd: '',
  status: 'available',
  vendorId: '',
  description: '',
  usefulLifeYears: 5,
  salvageValue: 0,
};

export default function Assets() {
  const { user } = useAuth();
  const data = useData();
  const [refreshKey, setRefreshKey] = useState(0);
  const [statusFilter, setStatusFilter] = useState<AssetStatus | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<AssetFormData>(emptyForm);

  const locations = useMemo(() => data.locations.getAll(), [refreshKey]);
  const departments = useMemo(() => data.departments.getAll(), [refreshKey]);
  const vendors = useMemo(() => data.vendors.getAll(), [refreshKey]);

  const assets = useMemo(() => {
    const all = data.assets.getAll();
    if (statusFilter === 'all') return all;
    return all.filter(a => a.status === statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, refreshKey]);

  const getLocationName = (id: string) => locations.find(l => l.id === id)?.name || 'N/A';
  const getDepartmentName = (id: string) => departments.find(d => d.id === id)?.name || 'N/A';
  const getVendorName = (id: string) => vendors.find(v => v.id === id)?.name || 'N/A';

  function generateAssetTag(): string {
    const all = data.assets.getAll();
    const nextNum = all.length + 1;
    return `AST-${String(nextNum).padStart(3, '0')}`;
  }

  const columns = [
    { key: 'assetTag', label: 'Asset Tag' },
    { key: 'name', label: 'Name' },
    {
      key: 'type',
      label: 'Type',
      render: (item: Record<string, unknown>) =>
        String(item.type).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    },
    {
      key: 'category',
      label: 'Category',
      render: (item: Record<string, unknown>) =>
        String(item.category).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    },
    { key: 'brand', label: 'Brand' },
    {
      key: 'locationId',
      label: 'Location',
      render: (item: Record<string, unknown>) => getLocationName(String(item.locationId)),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: Record<string, unknown>) => <StatusBadge status={String(item.status)} />,
    },
    {
      key: 'purchaseCost',
      label: 'Purchase Cost',
      render: (item: Record<string, unknown>) => formatCurrency(Number(item.purchaseCost)),
    },
  ];

  function openCreateModal() {
    setFormData(emptyForm);
    setSelectedAsset(null);
    setIsEditing(false);
    setShowCreateModal(true);
  }

  function openDetailModal(item: Record<string, unknown>) {
    const asset = data.assets.getById(String(item.id));
    if (!asset) return;
    setSelectedAsset(asset);
    setFormData({
      name: asset.name,
      type: asset.type,
      category: asset.category,
      brand: asset.brand,
      model: asset.model,
      serialNumber: asset.serialNumber,
      locationId: asset.locationId,
      departmentId: asset.departmentId,
      purchaseDate: asset.purchaseDate,
      purchaseCost: asset.purchaseCost,
      warrantyStart: asset.warrantyStart,
      warrantyEnd: asset.warrantyEnd,
      status: asset.status,
      vendorId: asset.vendorId,
      description: asset.description,
      usefulLifeYears: asset.usefulLifeYears,
      salvageValue: asset.salvageValue,
    });
    setIsEditing(false);
    setShowDetailModal(true);
  }

  async function handleCreate() {
    const assetTag = generateAssetTag();
    const now = new Date().toISOString();
    const newAsset = await data.assets.create({
      assetTag,
      ...formData,
      createdAt: now,
      updatedAt: now,
    });
    await data.addAuditLog(
      user?.id || '',
      user?.name || '',
      'Created',
      'Assets',
      newAsset.id,
      'Asset',
      `Created asset "${formData.name}" with tag ${assetTag}`
    );
    setShowCreateModal(false);
    setRefreshKey(k => k + 1);
  }

  async function handleUpdate() {
    if (!selectedAsset) return;
    const now = new Date().toISOString();
    await data.assets.update(selectedAsset.id, {
      ...formData,
      updatedAt: now,
    });
    await data.addAuditLog(
      user?.id || '',
      user?.name || '',
      'Updated',
      'Assets',
      selectedAsset.id,
      'Asset',
      `Updated asset "${formData.name}" (${selectedAsset.assetTag})`
    );
    setShowDetailModal(false);
    setIsEditing(false);
    setRefreshKey(k => k + 1);
  }

  async function handleDelete() {
    if (!selectedAsset) return;
    await data.assets.remove(selectedAsset.id);
    await data.addAuditLog(
      user?.id || '',
      user?.name || '',
      'Deleted',
      'Assets',
      selectedAsset.id,
      'Asset',
      `Deleted asset "${selectedAsset.name}" (${selectedAsset.assetTag})`
    );
    setShowDetailModal(false);
    setSelectedAsset(null);
    setRefreshKey(k => k + 1);
  }

  function handleExport() {
    const exportData = assets.map(a => ({
      'Asset Tag': a.assetTag,
      Name: a.name,
      Type: a.type.replace(/_/g, ' '),
      Category: a.category.replace(/_/g, ' '),
      Brand: a.brand,
      Model: a.model,
      'Serial Number': a.serialNumber,
      Location: getLocationName(a.locationId),
      Department: getDepartmentName(a.departmentId),
      Status: a.status.replace(/_/g, ' '),
      'Purchase Date': a.purchaseDate,
      'Purchase Cost': a.purchaseCost,
      'Warranty Start': a.warrantyStart,
      'Warranty End': a.warrantyEnd,
      Vendor: getVendorName(a.vendorId),
      'Useful Life (Years)': a.usefulLifeYears,
      'Salvage Value': a.salvageValue,
      Description: a.description,
    }));
    exportToCSV(exportData, 'assets-export');
  }

  function updateField<K extends keyof AssetFormData>(key: K, value: AssetFormData[K]) {
    setFormData(prev => ({ ...prev, [key]: value }));
  }

  // Shared form JSX
  function renderForm() {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={e => updateField('name', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-white"
            placeholder="Asset name"
            required
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
          <select
            value={formData.type}
            onChange={e => updateField('type', e.target.value as AssetType)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-white"
          >
            {ASSET_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
          <select
            value={formData.category}
            onChange={e => updateField('category', e.target.value as AssetCategory)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-white"
          >
            {ASSET_CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Brand */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brand</label>
          <input
            type="text"
            value={formData.brand}
            onChange={e => updateField('brand', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-white"
            placeholder="Brand name"
          />
        </div>

        {/* Model */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Model</label>
          <input
            type="text"
            value={formData.model}
            onChange={e => updateField('model', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-white"
            placeholder="Model number"
          />
        </div>

        {/* Serial Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Serial Number</label>
          <input
            type="text"
            value={formData.serialNumber}
            onChange={e => updateField('serialNumber', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-white"
            placeholder="Serial number"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
          <select
            value={formData.status}
            onChange={e => updateField('status', e.target.value as AssetStatus)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-white"
          >
            <option value="available">Available</option>
            <option value="allocated">Allocated</option>
            <option value="under_maintenance">Under Maintenance</option>
            <option value="retired">Retired</option>
            <option value="disposed">Disposed</option>
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location *</label>
          <select
            value={formData.locationId}
            onChange={e => updateField('locationId', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-white"
          >
            <option value="">Select location</option>
            {locations.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>

        {/* Department */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department *</label>
          <select
            value={formData.departmentId}
            onChange={e => updateField('departmentId', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-white"
          >
            <option value="">Select department</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Vendor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendor</label>
          <select
            value={formData.vendorId}
            onChange={e => updateField('vendorId', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-white"
          >
            <option value="">Select vendor</option>
            {vendors.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>

        {/* Purchase Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Purchase Date *</label>
          <input
            type="date"
            value={formData.purchaseDate}
            onChange={e => updateField('purchaseDate', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-white"
          />
        </div>

        {/* Purchase Cost */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Purchase Cost *</label>
          <input
            type="number"
            value={formData.purchaseCost}
            onChange={e => updateField('purchaseCost', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-white"
            min="0"
            step="0.01"
          />
        </div>

        {/* Warranty Start */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Warranty Start</label>
          <input
            type="date"
            value={formData.warrantyStart}
            onChange={e => updateField('warrantyStart', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-white"
          />
        </div>

        {/* Warranty End */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Warranty End</label>
          <input
            type="date"
            value={formData.warrantyEnd}
            onChange={e => updateField('warrantyEnd', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-white"
          />
        </div>

        {/* Useful Life Years */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Useful Life (Years)</label>
          <input
            type="number"
            value={formData.usefulLifeYears}
            onChange={e => updateField('usefulLifeYears', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-white"
            min="0"
          />
        </div>

        {/* Salvage Value */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Salvage Value</label>
          <input
            type="number"
            value={formData.salvageValue}
            onChange={e => updateField('salvageValue', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-white"
            min="0"
            step="0.01"
          />
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={e => updateField('description', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-white"
            rows={3}
            placeholder="Additional details about the asset"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="Asset Management"
        action={
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Asset
            </button>
          </div>
        }
      />

      {/* Status Filter Chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {ASSET_STATUSES.map(s => (
          <button
            key={s.value}
            onClick={() => setStatusFilter(s.value)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              statusFilter === s.value
                ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-medium'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
        <DataTable
          columns={columns}
          data={assets as unknown as Record<string, unknown>[]}
          onRowClick={openDetailModal}
          emptyMessage="No assets found. Click 'Add Asset' to create one."
        />
      </div>

      {/* Create Asset Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New Asset"
        size="xl"
      >
        {renderForm()}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={() => setShowCreateModal(false)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!formData.name}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Asset
          </button>
        </div>
      </Modal>

      {/* Detail / Edit Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => { setShowDetailModal(false); setIsEditing(false); }}
        title={isEditing ? 'Edit Asset' : 'Asset Details'}
        size="xl"
      >
        {selectedAsset && !isEditing ? (
          /* Detail View */
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Asset Tag</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedAsset.assetTag}</p>
              </div>
              <StatusBadge status={selectedAsset.status} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Name</p>
                <p className="text-sm text-gray-900 dark:text-white">{selectedAsset.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Type</p>
                <p className="text-sm text-gray-900 dark:text-white">{selectedAsset.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Category</p>
                <p className="text-sm text-gray-900 dark:text-white">{selectedAsset.category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Brand</p>
                <p className="text-sm text-gray-900 dark:text-white">{selectedAsset.brand || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Model</p>
                <p className="text-sm text-gray-900 dark:text-white">{selectedAsset.model || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Serial Number</p>
                <p className="text-sm text-gray-900 dark:text-white">{selectedAsset.serialNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Location</p>
                <p className="text-sm text-gray-900 dark:text-white">{getLocationName(selectedAsset.locationId)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Department</p>
                <p className="text-sm text-gray-900 dark:text-white">{getDepartmentName(selectedAsset.departmentId)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Vendor</p>
                <p className="text-sm text-gray-900 dark:text-white">{getVendorName(selectedAsset.vendorId)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Purchase Date</p>
                <p className="text-sm text-gray-900 dark:text-white">{formatDate(selectedAsset.purchaseDate)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Purchase Cost</p>
                <p className="text-sm text-gray-900 dark:text-white font-semibold">{formatCurrency(selectedAsset.purchaseCost)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Warranty Start</p>
                <p className="text-sm text-gray-900 dark:text-white">{formatDate(selectedAsset.warrantyStart)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Warranty End</p>
                <p className="text-sm text-gray-900 dark:text-white">{formatDate(selectedAsset.warrantyEnd)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Useful Life</p>
                <p className="text-sm text-gray-900 dark:text-white">{selectedAsset.usefulLifeYears} years</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Salvage Value</p>
                <p className="text-sm text-gray-900 dark:text-white">{formatCurrency(selectedAsset.salvageValue)}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Description</p>
                <p className="text-sm text-gray-900 dark:text-white">{selectedAsset.description || 'No description'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Created</p>
                <p className="text-sm text-gray-900 dark:text-white">{formatDate(selectedAsset.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Last Updated</p>
                <p className="text-sm text-gray-900 dark:text-white">{formatDate(selectedAsset.updatedAt)}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors shadow-sm"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            </div>
          </div>
        ) : (
          /* Edit View */
          <div>
            {renderForm()}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
              <button
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={!formData.name}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Asset"
        message={`Are you sure you want to delete "${selectedAsset?.name}" (${selectedAsset?.assetTag})? This action cannot be undone.`}
      />
    </div>
  );
}
