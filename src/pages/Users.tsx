import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { PageHeader, DataTable, Modal, StatusBadge, ConfirmDialog } from '../components/ui';
import { exportToCSV } from '../utils/helpers';
import { User, UserRole } from '../types';
import { Plus, Download, Edit, UserX, UserCheck, Shield } from 'lucide-react';

export default function Users() {
  const { user: currentUser } = useAuth();
  const data = useData();
  const [refresh, setRefresh] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [roleFilter, setRoleFilter] = useState('all');

  const emptyForm = { name: '', email: '', password: 'password', role: 'employee' as UserRole, departmentId: '', phone: '' };
  const [form, setForm] = useState(emptyForm);

  const users = data.users.getAll();
  const departments = data.departments.getAll();

  const filtered = roleFilter === 'all' ? users : users.filter(u => u.role === roleFilter);
  const getDeptName = (id: string) => departments.find(d => d.id === id)?.name || 'N/A';

  const openEdit = (u: User) => {
    setEditing(u);
    setForm({ name: u.name, email: u.email, password: '', role: u.role, departmentId: u.departmentId, phone: u.phone });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email) return;
    if (editing) {
      const updates: Partial<User> = { name: form.name, email: form.email, role: form.role, departmentId: form.departmentId, phone: form.phone, updatedAt: new Date().toISOString().split('T')[0] };
      if (form.password) updates.password = form.password;
      await data.users.update(editing.id, updates);
      await data.addAuditLog(currentUser!.id, currentUser!.name, 'UPDATE', 'Users', editing.id, 'User', `Updated user: ${form.name}`);
    } else {
      await data.users.create({
        name: form.name, email: form.email, password: form.password || 'password',
        role: form.role, departmentId: form.departmentId, phone: form.phone,
        isActive: true, createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      });
      await data.addAuditLog(currentUser!.id, currentUser!.name, 'CREATE', 'Users', '', 'User', `Created user: ${form.name}`);
    }
    setShowForm(false); setEditing(null); setForm(emptyForm); setRefresh(r => r + 1);
  };

  const toggleActive = async (u: User) => {
    await data.users.update(u.id, { isActive: !u.isActive });
    await data.addAuditLog(currentUser!.id, currentUser!.name, 'UPDATE', 'Users', u.id, 'User', `${u.isActive ? 'Deactivated' : 'Activated'} user: ${u.name}`);
    setRefresh(r => r + 1);
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-100 text-red-700',
      manager: 'bg-purple-100 text-purple-700',
      employee: 'bg-blue-100 text-blue-700',
      technician: 'bg-orange-100 text-orange-700',
      vendor: 'bg-green-100 text-green-700',
      auditor: 'bg-indigo-100 text-indigo-700',
    };
    return colors[role] || 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300';
  };

  const columns = [
    { key: 'name', label: 'Name', render: (u: any) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold">{u.name.charAt(0)}</div>
        <div><p className="font-medium">{u.name}</p><p className="text-xs text-gray-400 dark:text-gray-500">{u.email}</p></div>
      </div>
    )},
    { key: 'role', label: 'Role', render: (u: any) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getRoleColor(u.role)}`}>
        {u.role}
      </span>
    )},
    { key: 'departmentId', label: 'Department', render: (u: any) => getDeptName(u.departmentId) },
    { key: 'phone', label: 'Phone' },
    { key: 'isActive', label: 'Status', render: (u: any) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {u.isActive ? 'Active' : 'Inactive'}
      </span>
    )},
    { key: 'actions', label: 'Actions', render: (u: any) => (
      <div className="flex gap-1">
        <button onClick={(e) => { e.stopPropagation(); openEdit(u); }} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded" title="Edit"><Edit className="w-4 h-4 text-gray-500 dark:text-gray-400" /></button>
        <button onClick={(e) => { e.stopPropagation(); toggleActive(u); }} className={`p-1.5 rounded ${u.isActive ? 'hover:bg-red-50' : 'hover:bg-green-50'}`} title={u.isActive ? 'Deactivate' : 'Activate'}>
          {u.isActive ? <UserX className="w-4 h-4 text-red-500" /> : <UserCheck className="w-4 h-4 text-green-500" />}
        </button>
      </div>
    )},
  ];

  const roles = ['all', 'admin', 'manager', 'employee', 'technician', 'vendor', 'auditor'];

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader title="User Management" subtitle={`${users.length} users (${users.filter(u => u.isActive).length} active)`}
        action={
          <div className="flex gap-2">
            <button onClick={() => exportToCSV(users.map(u => ({ Name: u.name, Email: u.email, Role: u.role, Department: getDeptName(u.departmentId), Phone: u.phone, Status: u.isActive ? 'Active' : 'Inactive' })), 'users')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50"><Download className="w-4 h-4" /> Export</button>
            <button onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-500 rounded-lg hover:bg-indigo-600"><Plus className="w-4 h-4" /> Add User</button>
          </div>
        }
      />

      <div className="flex gap-2 mb-4 flex-wrap">
        {roles.map(r => (
          <button key={r} onClick={() => setRoleFilter(r)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg capitalize ${roleFilter === r ? 'bg-indigo-500 text-white' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}>
            {r === 'all' ? 'All' : r}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-5">
        <DataTable columns={columns} data={filtered} />
      </div>

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditing(null); }} title={editing ? 'Edit User' : 'Add User'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{editing ? 'New Password (leave blank to keep)' : 'Password *'}</label>
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder={editing ? 'Leave blank to keep current' : 'Enter password'}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value as UserRole})} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white">
                {['admin','manager','employee','technician','vendor','auditor'].map(r => <option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
              <select value={form.departmentId} onChange={e => setForm({...form, departmentId: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white">
                <option value="">Select department</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-indigo-500 rounded-lg hover:bg-indigo-600">{editing ? 'Save Changes' : 'Create User'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
