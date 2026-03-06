import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { PageHeader, ConfirmDialog } from '../components/ui';
import { SystemConfig } from '../types';
import { Save, RotateCcw, Database, Bell, Calculator, Shield } from 'lucide-react';

export default function Settings() {
  const data = useData();
  const [config, setConfig] = useState<SystemConfig>(data.systemConfig.get());
  const [saved, setSaved] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const handleSave = async () => {
    await data.systemConfig.save(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = async () => {
    await data.refresh();
    setConfig(data.systemConfig.get());
    setShowReset(false);
    window.location.reload();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader title="System Configuration" subtitle="Manage system-wide settings and preferences"
        action={
          <div className="flex gap-2">
            <button onClick={() => setShowReset(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100">
              <RotateCcw className="w-4 h-4" /> Reset All Data
            </button>
            <button onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-500 rounded-lg hover:bg-indigo-600">
              <Save className="w-4 h-4" /> Save Settings
            </button>
          </div>
        }
      />

      {saved && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">Settings saved successfully!</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-semibold text-gray-800 dark:text-white">General Settings</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name</label>
              <input type="text" value={config.companyName} onChange={e => setConfig({...config, companyName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency</label>
              <select value={config.currency} onChange={e => setConfig({...config, currency: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white">
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="INR">INR - Indian Rupee</option>
                <option value="AED">AED - UAE Dirham</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Format</label>
              <select value={config.dateFormat} onChange={e => setConfig({...config, dateFormat: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white">
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-orange-600" />
            <h3 className="text-base font-semibold text-gray-800 dark:text-white">Notification Settings</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Maintenance Reminder (days before due)</label>
              <input type="number" min={1} max={30} value={config.maintenanceReminderDays}
                onChange={e => setConfig({...config, maintenanceReminderDays: parseInt(e.target.value) || 7})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Warranty Alert (days before expiry)</label>
              <input type="number" min={1} max={90} value={config.warrantyAlertDays}
                onChange={e => setConfig({...config, warrantyAlertDays: parseInt(e.target.value) || 30})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white" />
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={config.stockAlertEnabled}
                  onChange={e => setConfig({...config, stockAlertEnabled: e.target.checked})}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Low Stock Alerts</span>
              </label>
            </div>
          </div>
        </div>

        {/* Depreciation Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="w-5 h-5 text-green-600" />
            <h3 className="text-base font-semibold text-gray-800 dark:text-white">Depreciation Settings</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Depreciation Method</label>
              <select value={config.depreciationMethod}
                onChange={e => setConfig({...config, depreciationMethod: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white">
                <option value="straight_line">Straight Line</option>
                <option value="declining_balance">Declining Balance</option>
              </select>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {config.depreciationMethod === 'straight_line'
                ? 'Straight Line: Equal depreciation each year over the useful life of the asset.'
                : 'Declining Balance: Higher depreciation in early years, declining over time.'}
            </p>
          </div>
        </div>

        {/* Backup Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-purple-600" />
            <h3 className="text-base font-semibold text-gray-800 dark:text-white">Backup & Data</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={config.autoBackupEnabled}
                  onChange={e => setConfig({...config, autoBackupEnabled: e.target.checked})}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Auto Backup</span>
              </label>
            </div>
            {config.autoBackupEnabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Backup Frequency</label>
                <select value={config.backupFrequency}
                  onChange={e => setConfig({...config, backupFrequency: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            )}
            <div className="pt-2">
              <button onClick={() => {
                const backupData = JSON.stringify(localStorage, null, 2);
                const blob = new Blob([backupData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }} className="w-full px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100">
                Export Backup (JSON)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4">System Information</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div><p className="text-xs text-gray-500 dark:text-gray-400">Version</p><p className="text-sm font-medium">1.0.0</p></div>
          <div><p className="text-xs text-gray-500 dark:text-gray-400">Total Users</p><p className="text-sm font-medium">{data.users.getAll().length}</p></div>
          <div><p className="text-xs text-gray-500 dark:text-gray-400">Total Assets</p><p className="text-sm font-medium">{data.assets.getAll().length}</p></div>
          <div><p className="text-xs text-gray-500 dark:text-gray-400">Data Storage</p><p className="text-sm font-medium">Supabase</p></div>
        </div>
      </div>

      <ConfirmDialog isOpen={showReset} onClose={() => setShowReset(false)} onConfirm={handleReset}
        title="Reset All Data" message="This will reset all data back to the demo defaults. All changes you've made will be lost. This cannot be undone." />
    </div>
  );
}
