import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { objectToSnake, objectToCamel, arrayToCamel } from '../lib/caseMapper';
import {
  User, Department, Location, Asset, Allocation, Maintenance, Repair, Vendor,
  Consumable, ConsumableAllocation, Procurement, DepreciationRecord, AuditLog,
  Notification, Document, SystemConfig
} from '../types';

// ---- helpers ----
type TableName =
  | 'users' | 'departments' | 'locations' | 'assets' | 'allocations'
  | 'maintenance' | 'repairs' | 'vendors' | 'consumables' | 'consumable_allocations'
  | 'procurements' | 'depreciation' | 'audit_logs' | 'notifications' | 'documents';

async function fetchTable<T>(table: TableName): Promise<T[]> {
  const { data, error } = await supabase.from(table).select('*');
  if (error) { console.error(`Error fetching ${table}:`, error); return []; }
  return arrayToCamel<T>(data ?? []);
}

// Convert "" → null for UUID FK fields (_id) and optional date fields
function sanitize(obj: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === '' && (k.endsWith('_id') || k.endsWith('_date') || k.endsWith('_start') || k.endsWith('_end'))) {
      out[k] = null;
    } else {
      out[k] = v;
    }
  }
  return out;
}

// ---- CRUD wrapper ----
interface CrudOps<T extends { id: string }> {
  getAll: () => T[];
  getById: (id: string) => T | undefined;
  create: (item: Omit<T, 'id'>) => Promise<T>;
  update: (id: string, updates: Partial<T>) => Promise<T | undefined>;
  remove: (id: string) => Promise<boolean>;
}

function makeCrud<T extends { id: string }>(
  table: TableName,
  cache: React.MutableRefObject<T[]>,
  setCache: (items: T[]) => void
): CrudOps<T> {
  return {
    getAll: () => cache.current,
    getById: (id: string) => cache.current.find(i => i.id === id),
    create: async (item: Omit<T, 'id'>) => {
      const snaked = sanitize(objectToSnake(item as Record<string, any>));
      const { data, error } = await supabase.from(table).insert(snaked).select().single();
      if (error) throw error;
      const created = objectToCamel<T>(data);
      const next = [...cache.current, created];
      cache.current = next;
      setCache(next);
      return created;
    },
    update: async (id: string, updates: Partial<T>) => {
      const snaked = sanitize(objectToSnake(updates as Record<string, any>));
      const { data, error } = await supabase.from(table).update(snaked).eq('id', id).select().single();
      if (error) throw error;
      const updated = objectToCamel<T>(data);
      const next = cache.current.map(i => (i.id === id ? updated : i));
      cache.current = next;
      setCache(next);
      return updated;
    },
    remove: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      const next = cache.current.filter(i => i.id !== id);
      cache.current = next;
      setCache(next);
      return true;
    },
  };
}

// ---- Context shape ----
interface DataContextType {
  loading: boolean;
  users: CrudOps<User>;
  departments: CrudOps<Department>;
  locations: CrudOps<Location>;
  assets: CrudOps<Asset>;
  allocations: CrudOps<Allocation>;
  maintenance: CrudOps<Maintenance>;
  repairs: CrudOps<Repair>;
  vendors: CrudOps<Vendor>;
  consumables: CrudOps<Consumable>;
  consumableAllocations: CrudOps<ConsumableAllocation>;
  procurements: CrudOps<Procurement>;
  depreciation: CrudOps<DepreciationRecord>;
  auditLogs: CrudOps<AuditLog>;
  notifications: CrudOps<Notification>;
  documents: CrudOps<Document>;
  systemConfig: { get: () => SystemConfig; save: (c: SystemConfig) => Promise<void> };
  addAuditLog: (userId: string, userName: string, action: string, module: string, entityId: string, entityType: string, details: string) => Promise<void>;
  addNotification: (userId: string, type: Notification['type'], title: string, message: string, priority?: Notification['priority']) => Promise<void>;
  refresh: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const defaultConfig: SystemConfig = {
  companyName: '1XL Infrastructure',
  currency: 'USD',
  dateFormat: 'MM/DD/YYYY',
  maintenanceReminderDays: 7,
  warrantyAlertDays: 30,
  stockAlertEnabled: true,
  depreciationMethod: 'straight_line',
  autoBackupEnabled: true,
  backupFrequency: 'weekly',
};

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  // State arrays (trigger re-renders)
  const [, setUsersState] = useState<User[]>([]);
  const [, setDepartmentsState] = useState<Department[]>([]);
  const [, setLocationsState] = useState<Location[]>([]);
  const [, setAssetsState] = useState<Asset[]>([]);
  const [, setAllocationsState] = useState<Allocation[]>([]);
  const [, setMaintenanceState] = useState<Maintenance[]>([]);
  const [, setRepairsState] = useState<Repair[]>([]);
  const [, setVendorsState] = useState<Vendor[]>([]);
  const [, setConsumablesState] = useState<Consumable[]>([]);
  const [, setConsumableAllocationsState] = useState<ConsumableAllocation[]>([]);
  const [, setProcurementsState] = useState<Procurement[]>([]);
  const [, setDepreciationState] = useState<DepreciationRecord[]>([]);
  const [, setAuditLogsState] = useState<AuditLog[]>([]);
  const [, setNotificationsState] = useState<Notification[]>([]);
  const [, setDocumentsState] = useState<Document[]>([]);
  const [configState, setConfigState] = useState<SystemConfig>(defaultConfig);

  // Refs for synchronous reads
  const usersRef = useRef<User[]>([]);
  const departmentsRef = useRef<Department[]>([]);
  const locationsRef = useRef<Location[]>([]);
  const assetsRef = useRef<Asset[]>([]);
  const allocationsRef = useRef<Allocation[]>([]);
  const maintenanceRef = useRef<Maintenance[]>([]);
  const repairsRef = useRef<Repair[]>([]);
  const vendorsRef = useRef<Vendor[]>([]);
  const consumablesRef = useRef<Consumable[]>([]);
  const consumableAllocationsRef = useRef<ConsumableAllocation[]>([]);
  const procurementsRef = useRef<Procurement[]>([]);
  const depreciationRef = useRef<DepreciationRecord[]>([]);
  const auditLogsRef = useRef<AuditLog[]>([]);
  const notificationsRef = useRef<Notification[]>([]);
  const documentsRef = useRef<Document[]>([]);

  const loadAll = useCallback(async () => {
    const [
      users, departments, locations, assets, allocations,
      maintenance, repairs, vendors, consumables, consumableAllocations,
      procurements, depreciation, auditLogs, notifications, documents, configRes
    ] = await Promise.all([
      fetchTable<User>('users'),
      fetchTable<Department>('departments'),
      fetchTable<Location>('locations'),
      fetchTable<Asset>('assets'),
      fetchTable<Allocation>('allocations'),
      fetchTable<Maintenance>('maintenance'),
      fetchTable<Repair>('repairs'),
      fetchTable<Vendor>('vendors'),
      fetchTable<Consumable>('consumables'),
      fetchTable<ConsumableAllocation>('consumable_allocations'),
      fetchTable<Procurement>('procurements'),
      fetchTable<DepreciationRecord>('depreciation'),
      fetchTable<AuditLog>('audit_logs'),
      fetchTable<Notification>('notifications'),
      fetchTable<Document>('documents'),
      supabase.from('system_config').select('*').single(),
    ]);

    usersRef.current = users; setUsersState(users);
    departmentsRef.current = departments; setDepartmentsState(departments);
    locationsRef.current = locations; setLocationsState(locations);
    assetsRef.current = assets; setAssetsState(assets);
    allocationsRef.current = allocations; setAllocationsState(allocations);
    maintenanceRef.current = maintenance; setMaintenanceState(maintenance);
    repairsRef.current = repairs; setRepairsState(repairs);
    vendorsRef.current = vendors; setVendorsState(vendors);
    consumablesRef.current = consumables; setConsumablesState(consumables);
    consumableAllocationsRef.current = consumableAllocations; setConsumableAllocationsState(consumableAllocations);
    procurementsRef.current = procurements; setProcurementsState(procurements);
    depreciationRef.current = depreciation; setDepreciationState(depreciation);
    auditLogsRef.current = auditLogs; setAuditLogsState(auditLogs);
    notificationsRef.current = notifications; setNotificationsState(notifications);
    documentsRef.current = documents; setDocumentsState(documents);

    if (configRes.data) {
      const c = objectToCamel<SystemConfig>(configRes.data);
      setConfigState(c);
    }

    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Build CRUD ops
  const users = makeCrud<User>('users', usersRef, setUsersState);
  const departments = makeCrud<Department>('departments', departmentsRef, setDepartmentsState);
  const locations = makeCrud<Location>('locations', locationsRef, setLocationsState);
  const assets = makeCrud<Asset>('assets', assetsRef, setAssetsState);
  const allocations = makeCrud<Allocation>('allocations', allocationsRef, setAllocationsState);
  const maintenance = makeCrud<Maintenance>('maintenance', maintenanceRef, setMaintenanceState);
  const repairs = makeCrud<Repair>('repairs', repairsRef, setRepairsState);
  const vendors = makeCrud<Vendor>('vendors', vendorsRef, setVendorsState);
  const consumables = makeCrud<Consumable>('consumables', consumablesRef, setConsumablesState);
  const consumableAllocations = makeCrud<ConsumableAllocation>('consumable_allocations', consumableAllocationsRef, setConsumableAllocationsState);
  const procurements = makeCrud<Procurement>('procurements', procurementsRef, setProcurementsState);
  const depreciation = makeCrud<DepreciationRecord>('depreciation', depreciationRef, setDepreciationState);
  const auditLogs = makeCrud<AuditLog>('audit_logs', auditLogsRef, setAuditLogsState);
  const notifications = makeCrud<Notification>('notifications', notificationsRef, setNotificationsState);
  const documents = makeCrud<Document>('documents', documentsRef, setDocumentsState);

  const systemConfig = {
    get: () => configState,
    save: async (c: SystemConfig) => {
      const snaked = objectToSnake(c as Record<string, any>);
      await supabase.from('system_config').update(snaked).eq('id', 1);
      setConfigState(c);
    },
  };

  const addAuditLog = async (userId: string, userName: string, action: string, module: string, entityId: string, entityType: string, details: string) => {
    await auditLogs.create({
      userId,
      userName,
      action,
      module,
      entityId,
      entityType,
      details,
      timestamp: new Date().toISOString(),
    } as Omit<AuditLog, 'id'>);
  };

  const addNotification = async (userId: string, type: Notification['type'], title: string, message: string, priority: Notification['priority'] = 'medium') => {
    await notifications.create({
      userId,
      type,
      title,
      message,
      isRead: false,
      priority,
      createdAt: new Date().toISOString(),
    } as Omit<Notification, 'id'>);
  };

  const value: DataContextType = {
    loading,
    users, departments, locations, assets, allocations,
    maintenance, repairs, vendors, consumables, consumableAllocations,
    procurements, depreciation, auditLogs, notifications, documents,
    systemConfig, addAuditLog, addNotification, refresh: loadAll,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Loading data...</p>
        </div>
      </div>
    );
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
