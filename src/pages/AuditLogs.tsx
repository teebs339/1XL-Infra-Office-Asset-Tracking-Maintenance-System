import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { PageHeader, DataTable } from '../components/ui';
import { formatDateTime, exportToCSV } from '../utils/helpers';
import { Download, ScrollText } from 'lucide-react';

export default function AuditLogs() {
  const data = useData();
  const [moduleFilter, setModuleFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');

  const logs = data.auditLogs.getAll().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const modules = [...new Set(logs.map(l => l.module))];
  const actions = [...new Set(logs.map(l => l.action))];

  const filtered = logs.filter(l =>
    (moduleFilter === 'all' || l.module === moduleFilter) &&
    (actionFilter === 'all' || l.action === actionFilter)
  );

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      CREATE: 'bg-green-100 text-green-700',
      UPDATE: 'bg-indigo-100 text-indigo-700',
      DELETE: 'bg-red-100 text-red-700',
      APPROVE: 'bg-emerald-100 text-emerald-700',
      REJECT: 'bg-red-100 text-red-700',
      ALLOCATE: 'bg-purple-100 text-purple-700',
    };
    return colors[action] || 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300';
  };

  const columns = [
    { key: 'timestamp', label: 'Timestamp', render: (l: any) => <span className="text-xs">{formatDateTime(l.timestamp)}</span> },
    { key: 'userName', label: 'User', render: (l: any) => <span className="font-medium">{l.userName}</span> },
    { key: 'action', label: 'Action', render: (l: any) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getActionColor(l.action)}`}>{l.action}</span>
    )},
    { key: 'module', label: 'Module', render: (l: any) => (
      <span className="px-2 py-0.5 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 rounded text-xs">{l.module}</span>
    )},
    { key: 'entityType', label: 'Entity Type' },
    { key: 'details', label: 'Details', render: (l: any) => <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[300px] block">{l.details}</span> },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader title="Audit & Compliance Logs" subtitle={`${filtered.length} log entries`}
        action={
          <button onClick={() => exportToCSV(filtered.map(l => ({
            Timestamp: l.timestamp, User: l.userName, Action: l.action, Module: l.module,
            EntityType: l.entityType, EntityId: l.entityId, Details: l.details,
          })), 'audit-logs')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
        }
      />

      <div className="flex gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Module:</label>
          <select value={moduleFilter} onChange={e => setModuleFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-white">
            <option value="all">All Modules</option>
            {modules.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Action:</label>
          <select value={actionFilter} onChange={e => setActionFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-white">
            <option value="all">All Actions</option>
            {actions.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
        <DataTable columns={columns} data={filtered} />
      </div>
    </div>
  );
}
