export type UserRole = 'admin' | 'manager' | 'employee' | 'technician' | 'vendor' | 'auditor';

export type AssetStatus = 'available' | 'allocated' | 'under_maintenance' | 'retired' | 'disposed';
export type AssetType = 'furniture' | 'it_equipment' | 'vehicle' | 'electronics' | 'office_equipment' | 'other';
export type AssetCategory = 'laptop' | 'desktop' | 'monitor' | 'printer' | 'chair' | 'desk' | 'phone' | 'projector' | 'vehicle' | 'server' | 'networking' | 'other';

export type AllocationStatus = 'pending' | 'approved' | 'rejected' | 'returned' | 'active';
export type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
export type RepairStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
export type ProcurementStatus = 'requested' | 'approved' | 'ordered' | 'received' | 'rejected' | 'cancelled';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  departmentId: string;
  phone: string;
  isActive: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  managerId: string;
  locationId: string;
  description: string;
  createdAt: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  isActive: boolean;
  createdAt: string;
}

export interface Asset {
  id: string;
  assetTag: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface Allocation {
  id: string;
  assetId: string;
  employeeId: string;
  departmentId: string;
  startDate: string;
  endDate: string | null;
  status: AllocationStatus;
  approvedBy: string | null;
  approvalDate: string | null;
  returnDate: string | null;
  returnCondition: string | null;
  notes: string;
  createdAt: string;
}

export interface Maintenance {
  id: string;
  assetId: string;
  scheduledDate: string;
  completedDate: string | null;
  technicianId: string;
  status: MaintenanceStatus;
  type: 'preventive' | 'corrective';
  cost: number;
  notes: string;
  checklist: string[];
  createdAt: string;
}

export interface Repair {
  id: string;
  assetId: string;
  vendorId: string;
  technicianId: string;
  issue: string;
  status: RepairStatus;
  priority: Priority;
  cost: number;
  partsUsed: string;
  laborHours: number;
  completionDate: string | null;
  notes: string;
  createdAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  services: string[];
  warrantyCovered: boolean;
  rating: number;
  isActive: boolean;
  createdAt: string;
}

export interface Consumable {
  id: string;
  name: string;
  category: string;
  stock: number;
  threshold: number;
  unit: string;
  costPerUnit: number;
  departmentId: string;
  locationId: string;
  lastRestocked: string;
  createdAt: string;
}

export interface ConsumableAllocation {
  id: string;
  consumableId: string;
  employeeId: string;
  departmentId: string;
  quantity: number;
  date: string;
}

export interface Procurement {
  id: string;
  assetName: string;
  assetType: AssetType;
  category: AssetCategory;
  requestedBy: string;
  departmentId: string;
  vendorId: string;
  quantity: number;
  estimatedCost: number;
  actualCost: number | null;
  status: ProcurementStatus;
  approvedBy: string | null;
  approvalDate: string | null;
  expectedDelivery: string;
  receivedDate: string | null;
  notes: string;
  createdAt: string;
}

export interface DepreciationRecord {
  id: string;
  assetId: string;
  year: number;
  depreciationAmount: number;
  accumulatedDepreciation: number;
  bookValue: number;
  method: 'straight_line' | 'declining_balance';
  date: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  entityId: string;
  entityType: string;
  details: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'maintenance' | 'repair' | 'allocation' | 'warranty' | 'stock' | 'procurement' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  priority: Priority;
  link?: string;
  createdAt: string;
}

export interface Document {
  id: string;
  assetId: string;
  name: string;
  type: 'warranty' | 'invoice' | 'manual' | 'service_report' | 'purchase_order' | 'other';
  description: string;
  fileSize: string;
  uploadedBy: string;
  createdAt: string;
}

export interface SystemConfig {
  companyName: string;
  currency: string;
  dateFormat: string;
  maintenanceReminderDays: number;
  warrantyAlertDays: number;
  stockAlertEnabled: boolean;
  depreciationMethod: 'straight_line' | 'declining_balance';
  autoBackupEnabled: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
}

export interface KPIData {
  assetAllocationRate: number;
  idleAssetPercentage: number;
  maintenanceComplianceRate: number;
  maintenanceCompletionRate: number;
  avgDowntimePerAsset: number;
  maintenanceCostPerAsset: number;
  repairCompletionRate: number;
  avgVendorResponseTime: number;
  stockAvailabilityRate: number;
  totalAssetValue: number;
  totalDepreciation: number;
  budgetAdherence: number;
  approvalTurnaroundTime: number;
}
