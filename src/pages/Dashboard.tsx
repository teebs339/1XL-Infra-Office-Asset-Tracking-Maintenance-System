import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { StatCard, StatusBadge, PageHeader } from '../components/ui';
import { formatCurrency, formatDate, isExpiringSoon } from '../utils/helpers';
import {
  Package, Users, Wrench, AlertTriangle, TrendingDown, ShoppingCart,
  ArrowLeftRight, BoxesIcon, Bell, CheckCircle, Clock, XCircle, ArrowRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';

const COLORS = ['#6366f1', '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
  const { user } = useAuth();
  const data = useData();
  const navigate = useNavigate();
  const assets = data.assets.getAll();
  const allocations = data.allocations.getAll();
  const maintenance = data.maintenance.getAll();
  const repairs = data.repairs.getAll();
  const consumables = data.consumables.getAll();
  const procurements = data.procurements.getAll();
  const notifications = data.notifications.getAll().filter(n => n.userId === user?.id && !n.isRead);
  const users = data.users.getAll();
  const departments = data.departments.getAll();

  const totalAssets = assets.length;
  const allocatedAssets = assets.filter(a => a.status === 'allocated').length;
  const availableAssets = assets.filter(a => a.status === 'available').length;
  const maintenanceAssets = assets.filter(a => a.status === 'under_maintenance').length;
  const retiredAssets = assets.filter(a => a.status === 'retired').length;
  const allocationRate = totalAssets > 0 ? Math.round((allocatedAssets / totalAssets) * 100) : 0;

  const maintenanceScheduled = maintenance.filter(m => m.status === 'scheduled').length;
  const maintenanceOverdue = maintenance.filter(m => m.status === 'overdue').length;
  const maintenanceCompleted = maintenance.filter(m => m.status === 'completed').length;
  const maintenanceTotal = maintenance.length;
  const maintenanceCompletionRate = maintenanceTotal > 0 ? Math.round((maintenanceCompleted / maintenanceTotal) * 100) : 0;

  const repairsPending = repairs.filter(r => r.status === 'pending' || r.status === 'in_progress').length;
  const repairsCompleted = repairs.filter(r => r.status === 'completed').length;

  const lowStockItems = consumables.filter(c => c.stock <= c.threshold).length;
  const totalAssetValue = assets.reduce((sum, a) => sum + a.purchaseCost, 0);
  const totalMaintenanceCost = maintenance.reduce((sum, m) => sum + m.cost, 0);
  const totalRepairCost = repairs.reduce((sum, r) => sum + r.cost, 0);
  const warrantyExpiring = assets.filter(a => isExpiringSoon(a.warrantyEnd, 90)).length;
  const pendingAllocations = allocations.filter(a => a.status === 'pending').length;
  const pendingProcurements = procurements.filter(p => p.status === 'requested').length;

  const assetsByStatus = [
    { name: 'Allocated', value: allocatedAssets },
    { name: 'Available', value: availableAssets },
    { name: 'Maintenance', value: maintenanceAssets },
    { name: 'Retired', value: retiredAssets },
  ].filter(d => d.value > 0);

  const assetsByType = Object.entries(
    assets.reduce<Record<string, number>>((acc, a) => {
      const type = a.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const assetsByDept = departments.map(d => ({
    name: d.name.length > 15 ? d.name.substring(0, 15) + '...' : d.name,
    assets: assets.filter(a => a.departmentId === d.id).length,
  }));

  const monthlyMaintenance = (() => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months.map((month, idx) => {
      const cost = maintenance
        .filter(m => {
          const d = new Date(m.completedDate || m.scheduledDate);
          return d.getMonth() === idx;
        })
        .reduce((s, m) => s + m.cost, 0);
      return { month, cost };
    });
  })();

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Here's an overview of your assets and operations</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Assets" value={totalAssets} icon={<Package className="w-6 h-6 text-indigo-600" />} iconBg="bg-indigo-100" subtitle={`${formatCurrency(totalAssetValue)} value`} />
        <StatCard title="Allocated" value={`${allocatedAssets} (${allocationRate}%)`} icon={<ArrowLeftRight className="w-6 h-6 text-emerald-600" />} iconBg="bg-emerald-100" />
        <StatCard title="Maintenance Due" value={maintenanceScheduled + maintenanceOverdue} icon={<Wrench className="w-6 h-6 text-amber-600" />} iconBg="bg-amber-100" subtitle={`${maintenanceOverdue} overdue`} />
        <StatCard title="Active Repairs" value={repairsPending} icon={<AlertTriangle className="w-6 h-6 text-red-600" />} iconBg="bg-red-100" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Users" value={users.filter(u => u.isActive).length} icon={<Users className="w-6 h-6 text-violet-600" />} iconBg="bg-violet-100" />
        <StatCard title="Low Stock Items" value={lowStockItems} icon={<BoxesIcon className="w-6 h-6 text-orange-600" />} iconBg="bg-orange-100" />
        <StatCard title="Pending Approvals" value={pendingAllocations + pendingProcurements} icon={<Clock className="w-6 h-6 text-sky-600" />} iconBg="bg-sky-100" />
        <StatCard title="Warranty Expiring" value={warrantyExpiring} icon={<Bell className="w-6 h-6 text-pink-600" />} iconBg="bg-pink-100" subtitle="Within 90 days" />
      </div>

      {/* Performance Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">Maintenance Compliance</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{maintenanceCompletionRate}%</p>
          <div className="mt-3 w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2">
            <div className="bg-indigo-500 rounded-full h-2 transition-all" style={{ width: `${maintenanceCompletionRate}%` }} />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Maintenance Cost</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(totalMaintenanceCost)}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{formatCurrency(totalAssets > 0 ? totalMaintenanceCost / totalAssets : 0)} per asset avg</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Repair Cost</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(totalRepairCost)}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{repairsCompleted} repairs completed</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Assets by Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={assetsByStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {assetsByStatus.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Assets by Department</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assetsByDept}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="assets" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Maintenance Cost Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyMaintenance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={v => `$${v}`} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: any) => [`$${value}`, 'Cost']} />
                <Line type="monotone" dataKey="cost" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Assets by Type</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={assetsByType} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {assetsByType.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Recent Allocations</h3>
            <button onClick={() => navigate('/allocations')} className="text-sm text-indigo-500 hover:text-indigo-600 font-medium flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {allocations.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">No allocations yet</div>
            ) : (
              allocations.slice(-5).reverse().map(a => {
                const asset = data.assets.getById(a.assetId);
                const emp = data.users.getById(a.employeeId);
                return (
                  <div key={a.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{asset?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{emp?.name || 'Unknown'} &middot; {formatDate(a.createdAt)}</p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Unread Notifications</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {notifications.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">No unread notifications</div>
            ) : (
              notifications.slice(0, 5).map(n => (
                <div key={n.id} className="px-6 py-3 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.priority === 'critical' ? 'bg-red-500' : n.priority === 'high' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{n.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
