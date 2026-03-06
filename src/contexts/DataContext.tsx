import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  User, Department, Location, Asset, Allocation, Maintenance, Repair, Vendor,
  Consumable, ConsumableAllocation, Procurement, DepreciationRecord, AuditLog,
  Notification, Document, SystemConfig
} from '../types';
import { seedData } from '../data/seedData';

// ---- localStorage helpers ----
const LS = 'oatms_';

function getStore<T>(key: string): T[] {
  const raw = localStorage.getItem(LS + key);
  return raw ? JSON.parse(raw) : [];
}

function setStore<T>(key: string, items: T[]): void {
  localStorage.setItem(LS + key, JSON.stringify(items));
}

// ---- CRUD wrapper ----
interface CrudOps<T extends { id: string }> {
  getAll: () => T[];
  getById: (id: string) => T | undefined;
  create: (item: Omit<T, 'id'>) => Promise<T>;
  update: (id: string, updates: Partial<T>) => Promise<T | undefined>;
  remove: (id: string) => Promise<boolean>;
}

function makeLocalCrud<T extends { id: string }>(
  key: string,
  cache: React.MutableRefObject<T[]>,
  setCache: (items: T[]) => void
): CrudOps<T> {
  return {
    getAll: () => cache.current,
    getById: (id: string) => cache.current.find(i => i.id === id),
    create: async (item: Omit<T, 'id'>) => {
      const created = { ...item, id: crypto.randomUUID() } as T;
      const next = [...cache.current, created];
      cache.current = next;
      setCache(next);
      setStore(key, next);
      return created;
    },
    update: async (id: string, updates: Partial<T>) => {
      const existing = cache.current.find(i => i.id === id);
      if (!existing) return undefined;
      const updated = { ...existing, ...updates };
      const next = cache.current.map(i => (i.id === id ? updated : i));
      cache.current = next;
      setCache(next);
      setStore(key, next);
      return updated;
    },
    remove: async (id: string) => {
      const next = cache.current.filter(i => i.id !== id);
      cache.current = next;
      setCache(next);
      setStore(key, next);
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
  const [configState, setConfigState] = useState<SystemConfig>(seedData.systemConfig);

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

  const loadAll = useCallback(() => {
    const isFirstLoad = !localStorage.getItem(LS + 'seeded');

    function load<T>(key: string, seed: T[]): T[] {
      if (isFirstLoad) { setStore(key, seed); return seed; }
      return getStore<T>(key);
    }

    const u = load<User>('users', seedData.users);
    const dep = load<Department>('departments', seedData.departments);
    const loc = load<Location>('locations', seedData.locations);
    const ast = load<Asset>('assets', seedData.assets);
    const alloc = load<Allocation>('allocations', seedData.allocations);
    const maint = load<Maintenance>('maintenance', seedData.maintenance);
    const rep = load<Repair>('repairs', seedData.repairs);
    const vend = load<Vendor>('vendors', seedData.vendors);
    const cons = load<Consumable>('consumables', seedData.consumables);
    const calloc = load<ConsumableAllocation>('consumableAllocations', seedData.consumableAllocations);
    const proc = load<Procurement>('procurements', seedData.procurements);
    const depr = load<DepreciationRecord>('depreciation', seedData.depreciation);
    const logs = load<AuditLog>('auditLogs', seedData.auditLogs);
    const notif = load<Notification>('notifications', seedData.notifications);
    const docs = load<Document>('documents', seedData.documents);

    usersRef.current = u; setUsersState(u);
    departmentsRef.current = dep; setDepartmentsState(dep);
    locationsRef.current = loc; setLocationsState(loc);
    assetsRef.current = ast; setAssetsState(ast);
    allocationsRef.current = alloc; setAllocationsState(alloc);
    maintenanceRef.current = maint; setMaintenanceState(maint);
    repairsRef.current = rep; setRepairsState(rep);
    vendorsRef.current = vend; setVendorsState(vend);
    consumablesRef.current = cons; setConsumablesState(cons);
    consumableAllocationsRef.current = calloc; setConsumableAllocationsState(calloc);
    procurementsRef.current = proc; setProcurementsState(proc);
    depreciationRef.current = depr; setDepreciationState(depr);
    auditLogsRef.current = logs; setAuditLogsState(logs);
    notificationsRef.current = notif; setNotificationsState(notif);
    documentsRef.current = docs; setDocumentsState(docs);

    const config: SystemConfig = isFirstLoad
      ? seedData.systemConfig
      : JSON.parse(localStorage.getItem(LS + 'systemConfig') || 'null') ?? seedData.systemConfig;
    if (isFirstLoad) localStorage.setItem(LS + 'systemConfig', JSON.stringify(config));
    setConfigState(config);

    if (isFirstLoad) localStorage.setItem(LS + 'seeded', 'true');
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Build CRUD ops
  const users = makeLocalCrud<User>('users', usersRef, setUsersState);
  const departments = makeLocalCrud<Department>('departments', departmentsRef, setDepartmentsState);
  const locations = makeLocalCrud<Location>('locations', locationsRef, setLocationsState);
  const assets = makeLocalCrud<Asset>('assets', assetsRef, setAssetsState);
  const allocations = makeLocalCrud<Allocation>('allocations', allocationsRef, setAllocationsState);
  const maintenance = makeLocalCrud<Maintenance>('maintenance', maintenanceRef, setMaintenanceState);
  const repairs = makeLocalCrud<Repair>('repairs', repairsRef, setRepairsState);
  const vendors = makeLocalCrud<Vendor>('vendors', vendorsRef, setVendorsState);
  const consumables = makeLocalCrud<Consumable>('consumables', consumablesRef, setConsumablesState);
  const consumableAllocations = makeLocalCrud<ConsumableAllocation>('consumableAllocations', consumableAllocationsRef, setConsumableAllocationsState);
  const procurements = makeLocalCrud<Procurement>('procurements', procurementsRef, setProcurementsState);
  const depreciation = makeLocalCrud<DepreciationRecord>('depreciation', depreciationRef, setDepreciationState);
  const auditLogs = makeLocalCrud<AuditLog>('auditLogs', auditLogsRef, setAuditLogsState);
  const notifications = makeLocalCrud<Notification>('notifications', notificationsRef, setNotificationsState);
  const documents = makeLocalCrud<Document>('documents', documentsRef, setDocumentsState);

  const systemConfig = {
    get: () => configState,
    save: async (c: SystemConfig) => {
      localStorage.setItem(LS + 'systemConfig', JSON.stringify(c));
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

  const refresh = useCallback(async () => {
    // Clear all oatms_ keys so next loadAll re-seeds from defaults
    Object.keys(localStorage)
      .filter(k => k.startsWith(LS))
      .forEach(k => localStorage.removeItem(k));
    loadAll();
  }, [loadAll]);

  const value: DataContextType = {
    loading,
    users, departments, locations, assets, allocations,
    maintenance, repairs, vendors, consumables, consumableAllocations,
    procurements, depreciation, auditLogs, notifications, documents,
    systemConfig, addAuditLog, addNotification, refresh,
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
