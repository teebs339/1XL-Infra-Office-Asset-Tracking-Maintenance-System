import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { PageHeader } from '../components/ui';
import { formatCurrency, exportToCSV, calculateStraightLineDepreciation } from '../utils/helpers';
import { Download, BarChart3, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

type ReportType = 'inventory' | 'allocation' | 'maintenance' | 'repair' | 'vendor' | 'financial' | 'consumables';

export default function Reports() {
  const data = useData();
  const [activeReport, setActiveReport] = useState<ReportType>('inventory');

  const assets = data.assets.getAll();
  const allocations = data.allocations.getAll();
  const maintenance = data.maintenance.getAll();
  const repairs = data.repairs.getAll();
  const vendors = data.vendors.getAll();
  const consumables = data.consumables.getAll();
  const departments = data.departments.getAll();
  const locations = data.locations.getAll();
  const users = data.users.getAll();

  const reports: { key: ReportType; label: string }[] = [
    { key: 'inventory', label: 'Inventory Report' },
    { key: 'allocation', label: 'Allocation History' },
    { key: 'maintenance', label: 'Maintenance Status' },
    { key: 'repair', label: 'Repair Cost Report' },
    { key: 'vendor', label: 'Vendor Performance' },
    { key: 'financial', label: 'Asset Valuation' },
    { key: 'consumables', label: 'Consumables Report' },
  ];

  const getName = (list: any[], id: string) => list.find((i: any) => i.id === id)?.name || 'N/A';

  const exportReport = () => {
    switch (activeReport) {
      case 'inventory':
        exportToCSV(assets.map(a => ({ Tag: a.assetTag, Name: a.name, Type: a.type, Category: a.category, Brand: a.brand, Model: a.model, Status: a.status, Location: getName(locations, a.locationId), Department: getName(departments, a.departmentId), Cost: a.purchaseCost })), 'inventory-report');
        break;
      case 'allocation':
        exportToCSV(allocations.map(a => ({ Asset: getName(assets, a.assetId), Employee: getName(users, a.employeeId), Department: getName(departments, a.departmentId), StartDate: a.startDate, EndDate: a.endDate || '', Status: a.status })), 'allocation-report');
        break;
      case 'maintenance':
        exportToCSV(maintenance.map(m => ({ Asset: getName(assets, m.assetId), Type: m.type, Scheduled: m.scheduledDate, Completed: m.completedDate || '', Technician: getName(users, m.technicianId), Status: m.status, Cost: m.cost })), 'maintenance-report');
        break;
      case 'repair':
        exportToCSV(repairs.map(r => ({ Asset: getName(assets, r.assetId), Issue: r.issue, Vendor: getName(vendors, r.vendorId), Technician: getName(users, r.technicianId), Status: r.status, Cost: r.cost, LaborHours: r.laborHours })), 'repair-report');
        break;
      case 'vendor':
        exportToCSV(vendors.map(v => ({ Name: v.name, Contact: v.contactPerson, Email: v.email, Services: v.services.join('; '), Rating: v.rating, Warranty: v.warrantyCovered ? 'Yes' : 'No' })), 'vendor-report');
        break;
      case 'financial':
        exportToCSV(assets.map(a => { const dep = calculateStraightLineDepreciation(a); const last = dep[dep.length-1]; return { Tag: a.assetTag, Name: a.name, OriginalCost: a.purchaseCost, SalvageValue: a.salvageValue, UsefulLife: a.usefulLifeYears, BookValue: last?.bookValue ?? a.purchaseCost }; }), 'financial-report');
        break;
      case 'consumables':
        exportToCSV(consumables.map(c => ({ Name: c.name, Category: c.category, Stock: c.stock, Threshold: c.threshold, Unit: c.unit, CostPerUnit: c.costPerUnit, Department: getName(departments, c.departmentId) })), 'consumables-report');
        break;
    }
  };

  // Chart data
  const assetsByStatus = useMemo(() => {
    const counts: Record<string, number> = {};
    assets.forEach(a => { counts[a.status] = (counts[a.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), value }));
  }, [assets]);

  const maintenanceByCost = useMemo(() =>
    departments.map(d => ({
      name: d.name.length > 12 ? d.name.substring(0, 12) + '...' : d.name,
      cost: maintenance.filter(m => assets.find(a => a.id === m.assetId)?.departmentId === d.id).reduce((s, m) => s + m.cost, 0),
    })), [departments, maintenance, assets]);

  const repairsByVendor = useMemo(() =>
    vendors.map(v => ({
      name: v.name.length > 15 ? v.name.substring(0, 15) + '...' : v.name,
      cost: repairs.filter(r => r.vendorId === v.id).reduce((s, r) => s + r.cost, 0),
      count: repairs.filter(r => r.vendorId === v.id).length,
    })).filter(v => v.count > 0), [vendors, repairs]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader title="Reports & Analytics" subtitle="Generate and export comprehensive reports"
        action={
          <button onClick={exportReport}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
            <Download className="w-4 h-4" /> Export Current Report
          </button>
        }
      />

      {/* Report tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {reports.map(r => (
          <button key={r.key} onClick={() => setActiveReport(r.key)}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${activeReport === r.key ? 'bg-indigo-500 text-white shadow-sm' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:border-gray-300 dark:hover:border-slate-600'}`}>
            {r.label}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Assets</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{assets.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Asset Value</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(assets.reduce((s, a) => s + a.purchaseCost, 0))}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Maintenance Cost</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(maintenance.reduce((s, m) => s + m.cost, 0))}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Repair Cost</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(repairs.reduce((s, r) => s + r.cost, 0))}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Asset Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={assetsByStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value"
                label={({ name, percent }: any) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                {assetsByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            {activeReport === 'repair' ? 'Repair Cost by Vendor' : 'Maintenance Cost by Department'}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={activeReport === 'repair' ? repairsByVendor : maintenanceByCost}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={v => `$${v}`} />
              <Tooltip formatter={(value: any) => formatCurrency(value)} />
              <Bar dataKey="cost" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Report Data Preview */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Report Preview</h3>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {activeReport === 'inventory' && `${assets.length} assets`}
            {activeReport === 'allocation' && `${allocations.length} allocations`}
            {activeReport === 'maintenance' && `${maintenance.length} records`}
            {activeReport === 'repair' && `${repairs.length} repairs`}
            {activeReport === 'vendor' && `${vendors.length} vendors`}
            {activeReport === 'consumables' && `${consumables.length} items`}
          </span>
        </div>
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700">
                {activeReport === 'inventory' && ['Tag', 'Name', 'Type', 'Status', 'Location', 'Cost'].map(h => <th key={h} className="text-left px-3 py-2 font-medium text-gray-600 dark:text-gray-400">{h}</th>)}
                {activeReport === 'allocation' && ['Asset', 'Employee', 'Department', 'Start', 'Status'].map(h => <th key={h} className="text-left px-3 py-2 font-medium text-gray-600 dark:text-gray-400">{h}</th>)}
                {activeReport === 'maintenance' && ['Asset', 'Type', 'Scheduled', 'Technician', 'Status', 'Cost'].map(h => <th key={h} className="text-left px-3 py-2 font-medium text-gray-600 dark:text-gray-400">{h}</th>)}
                {activeReport === 'repair' && ['Asset', 'Issue', 'Vendor', 'Status', 'Cost'].map(h => <th key={h} className="text-left px-3 py-2 font-medium text-gray-600 dark:text-gray-400">{h}</th>)}
                {activeReport === 'vendor' && ['Name', 'Contact', 'Services', 'Rating'].map(h => <th key={h} className="text-left px-3 py-2 font-medium text-gray-600 dark:text-gray-400">{h}</th>)}
                {activeReport === 'financial' && ['Tag', 'Name', 'Original Cost', 'Useful Life', 'Salvage Value'].map(h => <th key={h} className="text-left px-3 py-2 font-medium text-gray-600 dark:text-gray-400">{h}</th>)}
                {activeReport === 'consumables' && ['Name', 'Category', 'Stock', 'Threshold', 'Cost/Unit'].map(h => <th key={h} className="text-left px-3 py-2 font-medium text-gray-600 dark:text-gray-400">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {activeReport === 'inventory' && assets.slice(0, 10).map(a => (
                <tr key={a.id} className="border-b border-gray-50 dark:border-slate-700"><td className="px-3 py-2">{a.assetTag}</td><td className="px-3 py-2">{a.name}</td><td className="px-3 py-2 capitalize">{a.type.replace(/_/g,' ')}</td><td className="px-3 py-2 capitalize">{a.status.replace(/_/g,' ')}</td><td className="px-3 py-2">{getName(locations, a.locationId)}</td><td className="px-3 py-2">{formatCurrency(a.purchaseCost)}</td></tr>
              ))}
              {activeReport === 'allocation' && allocations.slice(0, 10).map(a => (
                <tr key={a.id} className="border-b border-gray-50 dark:border-slate-700"><td className="px-3 py-2">{getName(assets, a.assetId)}</td><td className="px-3 py-2">{getName(users, a.employeeId)}</td><td className="px-3 py-2">{getName(departments, a.departmentId)}</td><td className="px-3 py-2">{a.startDate}</td><td className="px-3 py-2 capitalize">{a.status}</td></tr>
              ))}
              {activeReport === 'maintenance' && maintenance.slice(0, 10).map(m => (
                <tr key={m.id} className="border-b border-gray-50 dark:border-slate-700"><td className="px-3 py-2">{getName(assets, m.assetId)}</td><td className="px-3 py-2 capitalize">{m.type}</td><td className="px-3 py-2">{m.scheduledDate}</td><td className="px-3 py-2">{getName(users, m.technicianId)}</td><td className="px-3 py-2 capitalize">{m.status.replace(/_/g,' ')}</td><td className="px-3 py-2">{formatCurrency(m.cost)}</td></tr>
              ))}
              {activeReport === 'repair' && repairs.slice(0, 10).map(r => (
                <tr key={r.id} className="border-b border-gray-50 dark:border-slate-700"><td className="px-3 py-2">{getName(assets, r.assetId)}</td><td className="px-3 py-2 truncate max-w-[200px]">{r.issue}</td><td className="px-3 py-2">{getName(vendors, r.vendorId)}</td><td className="px-3 py-2 capitalize">{r.status.replace(/_/g,' ')}</td><td className="px-3 py-2">{formatCurrency(r.cost)}</td></tr>
              ))}
              {activeReport === 'vendor' && vendors.slice(0, 10).map(v => (
                <tr key={v.id} className="border-b border-gray-50 dark:border-slate-700"><td className="px-3 py-2">{v.name}</td><td className="px-3 py-2">{v.contactPerson}</td><td className="px-3 py-2">{v.services.slice(0, 2).join(', ')}</td><td className="px-3 py-2">{v.rating}/5</td></tr>
              ))}
              {activeReport === 'financial' && assets.slice(0, 10).map(a => (
                <tr key={a.id} className="border-b border-gray-50 dark:border-slate-700"><td className="px-3 py-2">{a.assetTag}</td><td className="px-3 py-2">{a.name}</td><td className="px-3 py-2">{formatCurrency(a.purchaseCost)}</td><td className="px-3 py-2">{a.usefulLifeYears}y</td><td className="px-3 py-2">{formatCurrency(a.salvageValue)}</td></tr>
              ))}
              {activeReport === 'consumables' && consumables.slice(0, 10).map(c => (
                <tr key={c.id} className="border-b border-gray-50 dark:border-slate-700"><td className="px-3 py-2">{c.name}</td><td className="px-3 py-2">{c.category}</td><td className="px-3 py-2">{c.stock} {c.unit}</td><td className="px-3 py-2">{c.threshold}</td><td className="px-3 py-2">{formatCurrency(c.costPerUnit)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
