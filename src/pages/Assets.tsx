import React, { useState, useMemo, useRef } from 'react';
import { Asset, AssetType, AssetCategory, AssetStatus } from '../types';
import { useData } from '../contexts/DataContext';
import { PageHeader, DataTable, Modal, StatusBadge, ConfirmDialog, DependencyNotice } from '../components/ui';
import { formatCurrency, formatDate, exportToCSV } from '../utils/helpers';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Download, Edit, Trash2, Package, Upload, FileDown, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

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
  const [createError, setCreateError] = useState('');

  // Bulk import state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkParsed, setBulkParsed] = useState<Record<string, string>[]>([]);
  const [bulkErrors, setBulkErrors] = useState<string[]>([]);
  const [bulkSuccess, setBulkSuccess] = useState(0);
  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkDone, setBulkDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const isFormValid = formData.name && formData.locationId && formData.departmentId && formData.purchaseDate;

  async function handleCreate() {
    if (!isFormValid) return;
    setCreateError('');
    try {
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
    } catch (err: any) {
      setCreateError(err?.message || 'Failed to create asset. Please try again.');
    }
  }

  async function handleUpdate() {
    if (!selectedAsset) return;
    setCreateError('');
    try {
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
    } catch (err: any) {
      setCreateError(err?.message || 'Failed to update asset. Please try again.');
    }
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

  // ---- Bulk Import ----
  const SAMPLE_CSV_HEADERS = ['Name', 'Type', 'Category', 'Brand', 'Model', 'Serial Number', 'Location', 'Department', 'Status', 'Purchase Date', 'Purchase Cost', 'Warranty Start', 'Warranty End', 'Vendor', 'Useful Life (Years)', 'Salvage Value', 'Description'];

  function downloadSampleCSV() {
    const sampleRows = [
      SAMPLE_CSV_HEADERS.join(','),
      '"Dell Latitude 5540","it_equipment","laptop","Dell","Latitude 5540","SN-001","Main Office","Engineering","available","2025-01-15","1200","2025-01-15","2028-01-15","Dell Inc",5,100,"Employee laptop"',
      '"Herman Miller Aeron","furniture","chair","Herman Miller","Aeron","SN-002","Main Office","HR","available","2025-03-01","950","","","",10,50,"Ergonomic office chair"',
    ].join('\n');
    const blob = new Blob([sampleRows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'assets-import-template.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  function parseCSV(text: string): Record<string, string>[] {
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
    return lines.slice(1).map(line => {
      const values: string[] = [];
      let current = '', inQuotes = false;
      for (const char of line) {
        if (char === '"') { inQuotes = !inQuotes; }
        else if (char === ',' && !inQuotes) { values.push(current.trim()); current = ''; }
        else { current += char; }
      }
      values.push(current.trim());
      const row: Record<string, string> = {};
      headers.forEach((h, i) => { row[h] = values[i] || ''; });
      return row;
    });
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkFile(file);
    setBulkErrors([]);
    setBulkParsed([]);
    setBulkDone(false);
    setBulkSuccess(0);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const rows = parseCSV(text);
      if (rows.length === 0) { setBulkErrors(['CSV file is empty or has no data rows.']); return; }
      // Validate
      const errors: string[] = [];
      rows.forEach((row, i) => {
        const rn = i + 2; // line number (1-indexed, header is line 1)
        if (!row['Name']) errors.push(`Row ${rn}: Name is required.`);
        if (!row['Location']) errors.push(`Row ${rn}: Location is required.`);
        if (!row['Department']) errors.push(`Row ${rn}: Department is required.`);
        if (!row['Purchase Date']) errors.push(`Row ${rn}: Purchase Date is required.`);
        if (row['Location'] && !locations.find(l => l.name.toLowerCase() === row['Location'].toLowerCase()))
          errors.push(`Row ${rn}: Location "${row['Location']}" not found.`);
        if (row['Department'] && !departments.find(d => d.name.toLowerCase() === row['Department'].toLowerCase()))
          errors.push(`Row ${rn}: Department "${row['Department']}" not found.`);
        if (row['Vendor'] && !vendors.find(v => v.name.toLowerCase() === row['Vendor'].toLowerCase()))
          errors.push(`Row ${rn}: Vendor "${row['Vendor']}" not found.`);
      });
      setBulkErrors(errors);
      setBulkParsed(rows);
    };
    reader.readAsText(file);
  }

  async function handleBulkImport() {
    if (bulkErrors.length > 0 || bulkParsed.length === 0) return;
    setBulkImporting(true);
    setBulkSuccess(0);
    const errors: string[] = [];
    let successCount = 0;
    const allAssets = data.assets.getAll();
    let nextNum = allAssets.length + 1;

    for (let i = 0; i < bulkParsed.length; i++) {
      const row = bulkParsed[i];
      const tag = `AST-${String(nextNum).padStart(3, '0')}`;
      const loc = locations.find(l => l.name.toLowerCase() === row['Location'].toLowerCase());
      const dept = departments.find(d => d.name.toLowerCase() === row['Department'].toLowerCase());
      const vend = row['Vendor'] ? vendors.find(v => v.name.toLowerCase() === row['Vendor'].toLowerCase()) : null;
      const now = new Date().toISOString();
      try {
        await data.assets.create({
          assetTag: tag,
          name: row['Name'],
          type: (row['Type'] as AssetType) || 'other',
          category: (row['Category'] as AssetCategory) || 'other',
          brand: row['Brand'] || '',
          model: row['Model'] || '',
          serialNumber: row['Serial Number'] || '',
          locationId: loc?.id || '',
          departmentId: dept?.id || '',
          purchaseDate: row['Purchase Date'] || '',
          purchaseCost: parseFloat(row['Purchase Cost']) || 0,
          warrantyStart: row['Warranty Start'] || '',
          warrantyEnd: row['Warranty End'] || '',
          status: (row['Status'] as AssetStatus) || 'available',
          vendorId: vend?.id || '',
          description: row['Description'] || '',
          usefulLifeYears: parseInt(row['Useful Life (Years)']) || 5,
          salvageValue: parseFloat(row['Salvage Value']) || 0,
          createdAt: now,
          updatedAt: now,
        });
        successCount++;
        nextNum++;
        setBulkSuccess(successCount);
      } catch (err: any) {
        errors.push(`Row ${i + 2}: ${err?.message || 'Failed to create'}`);
      }
    }
    setBulkErrors(errors);
    setBulkImporting(false);
    setBulkDone(true);
    if (successCount > 0) setRefreshKey(k => k + 1);
  }

  function resetBulkModal() {
    setBulkFile(null);
    setBulkParsed([]);
    setBulkErrors([]);
    setBulkSuccess(0);
    setBulkImporting(false);
    setBulkDone(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
              Export
            </button>
            <button
              onClick={() => { resetBulkModal(); setShowBulkModal(true); }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Bulk Import
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
        <DependencyNotice missing={[
          ...(departments.length === 0 ? [{ label: 'Create Departments', path: '/locations', pageName: 'Locations & Departments' }] : []),
          ...(locations.length === 0 ? [{ label: 'Create Locations', path: '/locations', pageName: 'Locations & Departments' }] : []),
        ]} />
        {createError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm flex items-center gap-2">
            <XCircle className="w-4 h-4 flex-shrink-0" /> {createError}
          </div>
        )}
        {renderForm()}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={() => { setShowCreateModal(false); setCreateError(''); }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!isFormValid}
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

      {/* Bulk Import Modal */}
      <Modal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        title="Bulk Import Assets"
        size="lg"
      >
        <div className="space-y-5">
          {/* Step 1: Download template */}
          <div className="p-4 bg-gray-50 dark:bg-slate-700/30 rounded-xl border border-gray-200 dark:border-slate-600">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">1. Download the CSV template</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Use this template to format your data correctly. Fill in the columns and save as CSV.
                </p>
              </div>
              <button
                onClick={downloadSampleCSV}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700/50 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex-shrink-0"
              >
                <FileDown className="w-4 h-4" />
                Sample CSV
              </button>
            </div>
            <div className="mt-3 text-xs text-gray-400 dark:text-gray-500">
              <span className="font-medium">Required columns:</span> Name, Location, Department, Purchase Date &nbsp;|&nbsp;
              <span className="font-medium">Location / Department / Vendor:</span> must match existing names exactly
            </div>
          </div>

          {/* Step 2: Upload file */}
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">2. Upload your CSV file</p>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl p-6 text-center hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors cursor-pointer"
            >
              <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
              {bulkFile ? (
                <p className="text-sm text-gray-900 dark:text-white font-medium">{bulkFile.name}</p>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">Click to select a CSV file</p>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Validation results */}
          {bulkParsed.length > 0 && !bulkDone && (
            <div className="p-4 bg-gray-50 dark:bg-slate-700/30 rounded-xl border border-gray-200 dark:border-slate-600">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                3. Review — {bulkParsed.length} row{bulkParsed.length !== 1 ? 's' : ''} found
              </p>
              {bulkErrors.length > 0 ? (
                <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                  {bulkErrors.map((e, i) => (
                    <p key={i} className="text-xs text-red-600 dark:text-red-400 flex items-start gap-1.5">
                      <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /> {e}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> All rows validated successfully. Ready to import.
                </p>
              )}
            </div>
          )}

          {/* Import progress / result */}
          {bulkImporting && (
            <div className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-700/50">
              <div className="w-5 h-5 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin flex-shrink-0" />
              <p className="text-sm text-indigo-700 dark:text-indigo-300">Importing assets... {bulkSuccess}/{bulkParsed.length}</p>
            </div>
          )}

          {bulkDone && (
            <div className="space-y-2">
              {bulkSuccess > 0 && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-700/50 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    Successfully imported {bulkSuccess} asset{bulkSuccess !== 1 ? 's' : ''}.
                  </p>
                </div>
              )}
              {bulkErrors.length > 0 && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 max-h-32 overflow-y-auto">
                  {bulkErrors.map((e, i) => (
                    <p key={i} className="text-xs text-red-600 dark:text-red-400 flex items-start gap-1.5">
                      <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /> {e}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
            <button
              onClick={() => setShowBulkModal(false)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              {bulkDone ? 'Close' : 'Cancel'}
            </button>
            {!bulkDone && (
              <button
                onClick={handleBulkImport}
                disabled={bulkErrors.length > 0 || bulkParsed.length === 0 || bulkImporting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-4 h-4" />
                Import {bulkParsed.length > 0 ? `${bulkParsed.length} Assets` : 'Assets'}
              </button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
