import type {
  User, Department, Location, Asset, Allocation, Maintenance, Repair,
  Vendor, Consumable, ConsumableAllocation, Procurement, DepreciationRecord,
  AuditLog, Notification, Document, SystemConfig, Organization,
} from '../types';

// ── Locations ──────────────────────────────────────────────
const locations: Location[] = [
  { id: 'loc-1', name: '1XL HQ - Main Tower', address: 'Business Bay, Tower A, Floor 22', city: 'Dubai', state: 'Dubai', country: 'UAE', isActive: true, createdAt: '2024-01-10T08:00:00Z' },
  { id: 'loc-2', name: '1XL Tech Park', address: 'Masdar City, Building C3', city: 'Abu Dhabi', state: 'Abu Dhabi', country: 'UAE', isActive: true, createdAt: '2024-01-10T08:00:00Z' },
  { id: 'loc-3', name: '1XL Operations Center', address: 'Industrial Area 12, Block B', city: 'Sharjah', state: 'Sharjah', country: 'UAE', isActive: true, createdAt: '2024-03-15T08:00:00Z' },
  { id: 'loc-4', name: '1XL Remote Office', address: 'Al Jurf District, Suite 5', city: 'Ajman', state: 'Ajman', country: 'UAE', isActive: true, createdAt: '2024-06-01T08:00:00Z' },
];

// ── Users ──────────────────────────────────────────────────
const users: User[] = [
  { id: 'user-1', name: 'Ateeb Ahmed', email: 'admin', password: 'Asset@1xl.2026', role: 'admin', departmentId: 'dept-1', phone: '+971-50-123-4567', isActive: true, createdAt: '2024-01-10T08:00:00Z', updatedAt: '2024-01-10T08:00:00Z' },
  { id: 'user-2', name: 'Sarah Mitchell', email: 'sarah@1xlinfra.com', password: 'pass123', role: 'manager', departmentId: 'dept-2', phone: '+971-50-234-5678', isActive: true, createdAt: '2024-01-15T08:00:00Z', updatedAt: '2024-01-15T08:00:00Z' },
  { id: 'user-3', name: 'Omar Hassan', email: 'omar@1xlinfra.com', password: 'pass123', role: 'technician', departmentId: 'dept-6', phone: '+971-55-345-6789', isActive: true, createdAt: '2024-02-01T08:00:00Z', updatedAt: '2024-02-01T08:00:00Z' },
  { id: 'user-4', name: 'Priya Sharma', email: 'priya@1xlinfra.com', password: 'pass123', role: 'manager', departmentId: 'dept-3', phone: '+971-50-456-7890', isActive: true, createdAt: '2024-02-10T08:00:00Z', updatedAt: '2024-02-10T08:00:00Z' },
  { id: 'user-5', name: 'James Wilson', email: 'james@1xlinfra.com', password: 'pass123', role: 'employee', departmentId: 'dept-4', phone: '+971-56-567-8901', isActive: true, createdAt: '2024-03-01T08:00:00Z', updatedAt: '2024-03-01T08:00:00Z' },
  { id: 'user-6', name: 'Fatima Al-Rashid', email: 'fatima@1xlinfra.com', password: 'pass123', role: 'auditor', departmentId: 'dept-5', phone: '+971-50-678-9012', isActive: true, createdAt: '2024-03-15T08:00:00Z', updatedAt: '2024-03-15T08:00:00Z' },
  { id: 'user-7', name: 'Raj Patel', email: 'raj@1xlinfra.com', password: 'pass123', role: 'employee', departmentId: 'dept-2', phone: '+971-55-789-0123', isActive: true, createdAt: '2024-04-01T08:00:00Z', updatedAt: '2024-04-01T08:00:00Z' },
  { id: 'user-8', name: 'Elena Torres', email: 'elena@1xlinfra.com', password: 'pass123', role: 'employee', departmentId: 'dept-4', phone: '+971-56-890-1234', isActive: true, createdAt: '2024-05-01T08:00:00Z', updatedAt: '2024-05-01T08:00:00Z' },
];

// ── Departments ────────────────────────────────────────────
const departments: Department[] = [
  { id: 'dept-1', name: 'Executive Management', managerId: 'user-1', locationId: 'loc-1', description: 'C-suite and executive leadership', createdAt: '2024-01-10T08:00:00Z' },
  { id: 'dept-2', name: 'Information Technology', managerId: 'user-2', locationId: 'loc-1', description: 'IT infrastructure and software', createdAt: '2024-01-10T08:00:00Z' },
  { id: 'dept-3', name: 'Human Resources', managerId: 'user-4', locationId: 'loc-1', description: 'People operations and recruitment', createdAt: '2024-01-10T08:00:00Z' },
  { id: 'dept-4', name: 'Operations', managerId: 'user-5', locationId: 'loc-2', description: 'Day-to-day business operations', createdAt: '2024-01-10T08:00:00Z' },
  { id: 'dept-5', name: 'Finance & Accounting', managerId: 'user-6', locationId: 'loc-1', description: 'Financial planning and auditing', createdAt: '2024-01-10T08:00:00Z' },
  { id: 'dept-6', name: 'Engineering', managerId: 'user-3', locationId: 'loc-2', description: 'Technical engineering team', createdAt: '2024-02-01T08:00:00Z' },
];

// ── Vendors ────────────────────────────────────────────────
const vendors: Vendor[] = [
  { id: 'vendor-1', name: 'TechServ Solutions', contactPerson: 'Ali Mahmoud', email: 'ali@techserv.ae', phone: '+971-4-555-0101', address: 'Dubai Silicon Oasis, Building 7', services: ['IT Support', 'Hardware Repair', 'Network Setup'], warrantyCovered: true, rating: 4.5, isActive: true, createdAt: '2024-01-10T08:00:00Z' },
  { id: 'vendor-2', name: 'Office Furnish Pro', contactPerson: 'Karen Lee', email: 'karen@officefurnish.ae', phone: '+971-4-555-0202', address: 'Al Quoz Industrial Area 3', services: ['Furniture Supply', 'Interior Design', 'Installation'], warrantyCovered: true, rating: 4.2, isActive: true, createdAt: '2024-01-10T08:00:00Z' },
  { id: 'vendor-3', name: 'FleetCare Motors', contactPerson: 'Hassan Noor', email: 'hassan@fleetcare.ae', phone: '+971-4-555-0303', address: 'Ras Al Khor Industrial Area', services: ['Vehicle Maintenance', 'Fleet Management', 'Roadside Assistance'], warrantyCovered: false, rating: 4.7, isActive: true, createdAt: '2024-02-01T08:00:00Z' },
  { id: 'vendor-4', name: 'NetWorks IT', contactPerson: 'David Chen', email: 'david@networksit.ae', phone: '+971-4-555-0404', address: 'Internet City, Building 3', services: ['Networking', 'Server Maintenance', 'Cloud Solutions'], warrantyCovered: true, rating: 4.0, isActive: true, createdAt: '2024-03-01T08:00:00Z' },
  { id: 'vendor-5', name: 'CleanTech Supplies', contactPerson: 'Mariam Saleh', email: 'mariam@cleantech.ae', phone: '+971-4-555-0505', address: 'Jebel Ali Free Zone', services: ['Office Supplies', 'Cleaning Equipment', 'Hygiene Products'], warrantyCovered: false, rating: 3.8, isActive: true, createdAt: '2024-03-15T08:00:00Z' },
];

// ── Assets (20) ────────────────────────────────────────────
const assets: Asset[] = [
  // IT Equipment — Laptops
  { id: 'asset-1', assetTag: 'IT-LAP-001', name: 'Dell Latitude 5540', type: 'it_equipment', category: 'laptop', brand: 'Dell', model: 'Latitude 5540', serialNumber: 'DL5540-A1B2C3', locationId: 'loc-1', departmentId: 'dept-2', purchaseDate: '2024-02-15', purchaseCost: 4800, warrantyStart: '2024-02-15', warrantyEnd: '2027-02-15', status: 'allocated', vendorId: 'vendor-1', description: 'i7-1365U, 16GB RAM, 512GB SSD', usefulLifeYears: 4, salvageValue: 500, createdAt: '2024-02-15T08:00:00Z', updatedAt: '2024-02-15T08:00:00Z' },
  { id: 'asset-2', assetTag: 'IT-LAP-002', name: 'MacBook Pro 14"', type: 'it_equipment', category: 'laptop', brand: 'Apple', model: 'MacBook Pro 14 M3', serialNumber: 'MBP14-X9Y8Z7', locationId: 'loc-1', departmentId: 'dept-1', purchaseDate: '2024-03-01', purchaseCost: 8200, warrantyStart: '2024-03-01', warrantyEnd: '2027-03-01', status: 'allocated', vendorId: 'vendor-1', description: 'M3 Pro, 18GB RAM, 512GB SSD', usefulLifeYears: 5, salvageValue: 1000, createdAt: '2024-03-01T08:00:00Z', updatedAt: '2024-03-01T08:00:00Z' },
  { id: 'asset-3', assetTag: 'IT-LAP-003', name: 'HP EliteBook 840 G10', type: 'it_equipment', category: 'laptop', brand: 'HP', model: 'EliteBook 840 G10', serialNumber: 'HPE840-D4E5F6', locationId: 'loc-2', departmentId: 'dept-6', purchaseDate: '2024-04-10', purchaseCost: 4200, warrantyStart: '2024-04-10', warrantyEnd: '2027-04-10', status: 'allocated', vendorId: 'vendor-1', description: 'i5-1345U, 16GB RAM, 256GB SSD', usefulLifeYears: 4, salvageValue: 400, createdAt: '2024-04-10T08:00:00Z', updatedAt: '2024-04-10T08:00:00Z' },
  { id: 'asset-4', assetTag: 'IT-LAP-004', name: 'Lenovo ThinkPad X1 Carbon', type: 'it_equipment', category: 'laptop', brand: 'Lenovo', model: 'ThinkPad X1 Carbon Gen 11', serialNumber: 'LNV-X1C-G7H8I9', locationId: 'loc-1', departmentId: 'dept-5', purchaseDate: '2024-06-20', purchaseCost: 5500, warrantyStart: '2024-06-20', warrantyEnd: '2027-06-20', status: 'allocated', vendorId: 'vendor-1', description: 'i7-1365U, 32GB RAM, 1TB SSD', usefulLifeYears: 4, salvageValue: 600, createdAt: '2024-06-20T08:00:00Z', updatedAt: '2024-06-20T08:00:00Z' },
  // IT Equipment — Desktops
  { id: 'asset-5', assetTag: 'IT-DES-001', name: 'Dell OptiPlex 7010', type: 'it_equipment', category: 'desktop', brand: 'Dell', model: 'OptiPlex 7010 SFF', serialNumber: 'DO7010-J1K2L3', locationId: 'loc-1', departmentId: 'dept-3', purchaseDate: '2023-08-15', purchaseCost: 3200, warrantyStart: '2023-08-15', warrantyEnd: '2026-08-15', status: 'allocated', vendorId: 'vendor-1', description: 'i5-13500, 16GB RAM, 512GB SSD', usefulLifeYears: 5, salvageValue: 300, createdAt: '2023-08-15T08:00:00Z', updatedAt: '2023-08-15T08:00:00Z' },
  { id: 'asset-6', assetTag: 'IT-DES-002', name: 'HP Z2 Tower G9', type: 'it_equipment', category: 'desktop', brand: 'HP', model: 'Z2 Tower G9', serialNumber: 'HPZ2-M4N5O6', locationId: 'loc-2', departmentId: 'dept-6', purchaseDate: '2023-10-01', purchaseCost: 5800, warrantyStart: '2023-10-01', warrantyEnd: '2026-10-01', status: 'allocated', vendorId: 'vendor-1', description: 'i7-13700, 32GB RAM, 1TB SSD, RTX A2000', usefulLifeYears: 5, salvageValue: 600, createdAt: '2023-10-01T08:00:00Z', updatedAt: '2023-10-01T08:00:00Z' },
  { id: 'asset-7', assetTag: 'IT-DES-003', name: 'iMac 24"', type: 'it_equipment', category: 'desktop', brand: 'Apple', model: 'iMac 24 M3', serialNumber: 'IMAC24-P7Q8R9', locationId: 'loc-1', departmentId: 'dept-1', purchaseDate: '2024-01-20', purchaseCost: 6800, warrantyStart: '2024-01-20', warrantyEnd: '2027-01-20', status: 'available', vendorId: 'vendor-1', description: 'M3, 16GB RAM, 512GB SSD', usefulLifeYears: 5, salvageValue: 800, createdAt: '2024-01-20T08:00:00Z', updatedAt: '2024-01-20T08:00:00Z' },
  // IT Equipment — Monitors
  { id: 'asset-8', assetTag: 'IT-MON-001', name: 'Dell UltraSharp U2723QE', type: 'it_equipment', category: 'monitor', brand: 'Dell', model: 'U2723QE', serialNumber: 'DU27-S1T2U3', locationId: 'loc-1', departmentId: 'dept-2', purchaseDate: '2024-02-15', purchaseCost: 2200, warrantyStart: '2024-02-15', warrantyEnd: '2027-02-15', status: 'allocated', vendorId: 'vendor-1', description: '27" 4K IPS, USB-C Hub', usefulLifeYears: 6, salvageValue: 200, createdAt: '2024-02-15T08:00:00Z', updatedAt: '2024-02-15T08:00:00Z' },
  { id: 'asset-9', assetTag: 'IT-MON-002', name: 'LG UltraWide 34WN80C', type: 'it_equipment', category: 'monitor', brand: 'LG', model: '34WN80C-B', serialNumber: 'LG34-V4W5X6', locationId: 'loc-2', departmentId: 'dept-6', purchaseDate: '2024-03-20', purchaseCost: 1800, warrantyStart: '2024-03-20', warrantyEnd: '2027-03-20', status: 'allocated', vendorId: 'vendor-1', description: '34" UltraWide WQHD IPS', usefulLifeYears: 6, salvageValue: 150, createdAt: '2024-03-20T08:00:00Z', updatedAt: '2024-03-20T08:00:00Z' },
  // Office Equipment — Printers
  { id: 'asset-10', assetTag: 'OE-PRT-001', name: 'HP LaserJet Pro MFP M428fdn', type: 'office_equipment', category: 'printer', brand: 'HP', model: 'LaserJet Pro M428fdn', serialNumber: 'HPLJ-Y7Z8A9', locationId: 'loc-1', departmentId: 'dept-3', purchaseDate: '2023-06-10', purchaseCost: 1500, warrantyStart: '2023-06-10', warrantyEnd: '2025-06-10', status: 'allocated', vendorId: 'vendor-1', description: 'Mono laser, duplex, ADF, network', usefulLifeYears: 5, salvageValue: 100, createdAt: '2023-06-10T08:00:00Z', updatedAt: '2023-06-10T08:00:00Z' },
  { id: 'asset-11', assetTag: 'OE-PRT-002', name: 'Canon imageRUNNER C3530i', type: 'office_equipment', category: 'printer', brand: 'Canon', model: 'imageRUNNER C3530i', serialNumber: 'CIR-B1C2D3', locationId: 'loc-2', departmentId: 'dept-4', purchaseDate: '2023-09-01', purchaseCost: 8500, warrantyStart: '2023-09-01', warrantyEnd: '2026-09-01', status: 'allocated', vendorId: 'vendor-1', description: 'Color MFP, 30ppm, staple finisher', usefulLifeYears: 7, salvageValue: 500, createdAt: '2023-09-01T08:00:00Z', updatedAt: '2023-09-01T08:00:00Z' },
  // Electronics — Phones & Projector
  { id: 'asset-12', assetTag: 'EL-PHN-001', name: 'Cisco IP Phone 8845', type: 'electronics', category: 'phone', brand: 'Cisco', model: 'IP Phone 8845', serialNumber: 'CIP-E4F5G6', locationId: 'loc-1', departmentId: 'dept-1', purchaseDate: '2023-11-15', purchaseCost: 1200, warrantyStart: '2023-11-15', warrantyEnd: '2025-11-15', status: 'allocated', vendorId: 'vendor-4', description: 'HD Voice, 5" display, PoE', usefulLifeYears: 5, salvageValue: 80, createdAt: '2023-11-15T08:00:00Z', updatedAt: '2023-11-15T08:00:00Z' },
  { id: 'asset-13', assetTag: 'EL-PHN-002', name: 'Poly CCX 600', type: 'electronics', category: 'phone', brand: 'Poly', model: 'CCX 600', serialNumber: 'POLY-H7I8J9', locationId: 'loc-2', departmentId: 'dept-4', purchaseDate: '2024-01-10', purchaseCost: 950, warrantyStart: '2024-01-10', warrantyEnd: '2026-01-10', status: 'available', vendorId: 'vendor-4', description: 'Teams-certified, touchscreen', usefulLifeYears: 5, salvageValue: 60, createdAt: '2024-01-10T08:00:00Z', updatedAt: '2024-01-10T08:00:00Z' },
  { id: 'asset-14', assetTag: 'EL-PRJ-001', name: 'Epson EB-L260F', type: 'electronics', category: 'projector', brand: 'Epson', model: 'EB-L260F', serialNumber: 'EPSON-K1L2M3', locationId: 'loc-1', departmentId: 'dept-1', purchaseDate: '2024-05-01', purchaseCost: 3500, warrantyStart: '2024-05-01', warrantyEnd: '2027-05-01', status: 'allocated', vendorId: 'vendor-1', description: 'Full HD laser, 4600 lumens', usefulLifeYears: 6, salvageValue: 300, createdAt: '2024-05-01T08:00:00Z', updatedAt: '2024-05-01T08:00:00Z' },
  // Furniture
  { id: 'asset-15', assetTag: 'FR-CHR-001', name: 'Herman Miller Aeron', type: 'furniture', category: 'chair', brand: 'Herman Miller', model: 'Aeron Size B', serialNumber: 'HM-N4O5P6', locationId: 'loc-1', departmentId: 'dept-1', purchaseDate: '2024-01-10', purchaseCost: 5200, warrantyStart: '2024-01-10', warrantyEnd: '2036-01-10', status: 'allocated', vendorId: 'vendor-2', description: 'Graphite frame, PostureFit SL', usefulLifeYears: 12, salvageValue: 500, createdAt: '2024-01-10T08:00:00Z', updatedAt: '2024-01-10T08:00:00Z' },
  { id: 'asset-16', assetTag: 'FR-CHR-002', name: 'Steelcase Leap V2', type: 'furniture', category: 'chair', brand: 'Steelcase', model: 'Leap V2', serialNumber: 'SC-Q7R8S9', locationId: 'loc-2', departmentId: 'dept-6', purchaseDate: '2024-02-20', purchaseCost: 4100, warrantyStart: '2024-02-20', warrantyEnd: '2036-02-20', status: 'available', vendorId: 'vendor-2', description: 'Black frame, 4-way arms, lumbar support', usefulLifeYears: 12, salvageValue: 400, createdAt: '2024-02-20T08:00:00Z', updatedAt: '2024-02-20T08:00:00Z' },
  { id: 'asset-17', assetTag: 'FR-DSK-001', name: 'IKEA BEKANT Standing Desk', type: 'furniture', category: 'desk', brand: 'IKEA', model: 'BEKANT 160x80', serialNumber: 'IK-T1U2V3', locationId: 'loc-1', departmentId: 'dept-2', purchaseDate: '2024-03-05', purchaseCost: 2400, warrantyStart: '2024-03-05', warrantyEnd: '2034-03-05', status: 'allocated', vendorId: 'vendor-2', description: 'Electric sit/stand, white top, 160x80cm', usefulLifeYears: 10, salvageValue: 200, createdAt: '2024-03-05T08:00:00Z', updatedAt: '2024-03-05T08:00:00Z' },
  { id: 'asset-18', assetTag: 'FR-DSK-002', name: 'Uplift V2 Standing Desk', type: 'furniture', category: 'desk', brand: 'Uplift', model: 'V2 72x30', serialNumber: 'UP-W4X5Y6', locationId: 'loc-2', departmentId: 'dept-6', purchaseDate: '2024-04-15', purchaseCost: 3100, warrantyStart: '2024-04-15', warrantyEnd: '2039-04-15', status: 'under_maintenance', vendorId: 'vendor-2', description: 'Walnut top, commercial frame, 72x30', usefulLifeYears: 15, salvageValue: 300, createdAt: '2024-04-15T08:00:00Z', updatedAt: '2024-04-15T08:00:00Z' },
  // Server
  { id: 'asset-19', assetTag: 'IT-SRV-001', name: 'Dell PowerEdge R760', type: 'it_equipment', category: 'server', brand: 'Dell', model: 'PowerEdge R760', serialNumber: 'DPE-Z7A8B9', locationId: 'loc-1', departmentId: 'dept-2', purchaseDate: '2024-01-05', purchaseCost: 28000, warrantyStart: '2024-01-05', warrantyEnd: '2029-01-05', status: 'allocated', vendorId: 'vendor-4', description: 'Dual Xeon Gold 6438Y, 256GB DDR5, 8x 2.4TB SAS', usefulLifeYears: 7, salvageValue: 2000, createdAt: '2024-01-05T08:00:00Z', updatedAt: '2024-01-05T08:00:00Z' },
  // Vehicle
  { id: 'asset-20', assetTag: 'VH-SUV-001', name: 'Toyota Land Cruiser 300', type: 'vehicle', category: 'vehicle', brand: 'Toyota', model: 'Land Cruiser 300 GXR', serialNumber: 'TLC-C1D2E3F4', locationId: 'loc-1', departmentId: 'dept-4', purchaseDate: '2023-05-20', purchaseCost: 245000, warrantyStart: '2023-05-20', warrantyEnd: '2026-05-20', status: 'allocated', vendorId: 'vendor-3', description: '3.3L V6 Diesel, White, Company fleet', usefulLifeYears: 8, salvageValue: 80000, createdAt: '2023-05-20T08:00:00Z', updatedAt: '2023-05-20T08:00:00Z' },
];

// ── Allocations ────────────────────────────────────────────
const allocations: Allocation[] = [
  { id: 'alloc-1', assetId: 'asset-1', employeeId: 'user-2', departmentId: 'dept-2', startDate: '2024-02-16', endDate: null, status: 'active', approvedBy: 'user-1', approvalDate: '2024-02-16', returnDate: null, returnCondition: null, notes: 'Primary work laptop', createdAt: '2024-02-16T08:00:00Z' },
  { id: 'alloc-2', assetId: 'asset-2', employeeId: 'user-1', departmentId: 'dept-1', startDate: '2024-03-02', endDate: null, status: 'active', approvedBy: 'user-1', approvalDate: '2024-03-02', returnDate: null, returnCondition: null, notes: 'CEO laptop', createdAt: '2024-03-02T08:00:00Z' },
  { id: 'alloc-3', assetId: 'asset-3', employeeId: 'user-3', departmentId: 'dept-6', startDate: '2024-04-11', endDate: null, status: 'active', approvedBy: 'user-2', approvalDate: '2024-04-11', returnDate: null, returnCondition: null, notes: 'Engineering workstation', createdAt: '2024-04-11T08:00:00Z' },
  { id: 'alloc-4', assetId: 'asset-5', employeeId: 'user-4', departmentId: 'dept-3', startDate: '2023-08-20', endDate: null, status: 'active', approvedBy: 'user-1', approvalDate: '2023-08-20', returnDate: null, returnCondition: null, notes: 'HR department desktop', createdAt: '2023-08-20T08:00:00Z' },
  { id: 'alloc-5', assetId: 'asset-6', employeeId: 'user-3', departmentId: 'dept-6', startDate: '2023-10-05', endDate: null, status: 'active', approvedBy: 'user-2', approvalDate: '2023-10-05', returnDate: null, returnCondition: null, notes: 'CAD workstation', createdAt: '2023-10-05T08:00:00Z' },
  { id: 'alloc-6', assetId: 'asset-8', employeeId: 'user-7', departmentId: 'dept-2', startDate: '2024-02-16', endDate: null, status: 'active', approvedBy: 'user-2', approvalDate: '2024-02-16', returnDate: null, returnCondition: null, notes: 'Developer monitor', createdAt: '2024-02-16T08:00:00Z' },
  { id: 'alloc-7', assetId: 'asset-20', employeeId: 'user-5', departmentId: 'dept-4', startDate: '2023-06-01', endDate: null, status: 'active', approvedBy: 'user-1', approvalDate: '2023-06-01', returnDate: null, returnCondition: null, notes: 'Operations fleet vehicle', createdAt: '2023-06-01T08:00:00Z' },
  { id: 'alloc-8', assetId: 'asset-4', employeeId: 'user-6', departmentId: 'dept-5', startDate: '2024-06-21', endDate: null, status: 'active', approvedBy: 'user-1', approvalDate: '2024-06-21', returnDate: null, returnCondition: null, notes: 'Finance laptop', createdAt: '2024-06-21T08:00:00Z' },
  { id: 'alloc-9', assetId: 'asset-17', employeeId: 'user-7', departmentId: 'dept-2', startDate: '2024-03-06', endDate: null, status: 'pending', approvedBy: null, approvalDate: null, returnDate: null, returnCondition: null, notes: 'Requested standing desk', createdAt: '2024-03-06T08:00:00Z' },
  { id: 'alloc-10', assetId: 'asset-10', employeeId: 'user-4', departmentId: 'dept-3', startDate: '2023-06-15', endDate: '2025-01-10', status: 'returned', approvedBy: 'user-1', approvalDate: '2023-06-15', returnDate: '2025-01-10', returnCondition: 'Good - minor wear', notes: 'Returned after office reorganization', createdAt: '2023-06-15T08:00:00Z' },
];

// ── Maintenance ────────────────────────────────────────────
const maintenance: Maintenance[] = [
  { id: 'maint-1', assetId: 'asset-19', scheduledDate: '2025-01-15', completedDate: '2025-01-15', technicianId: 'user-3', status: 'completed', type: 'preventive', cost: 450, notes: 'Quarterly server health check and firmware update', checklist: ['Check RAID status', 'Update firmware', 'Clean dust filters', 'Verify backups'], createdAt: '2025-01-10T08:00:00Z' },
  { id: 'maint-2', assetId: 'asset-20', scheduledDate: '2025-02-01', completedDate: '2025-02-03', technicianId: 'user-3', status: 'completed', type: 'preventive', cost: 1200, notes: 'Annual vehicle service - 40,000 km', checklist: ['Oil change', 'Tire rotation', 'Brake inspection', 'AC service'], createdAt: '2025-01-25T08:00:00Z' },
  { id: 'maint-3', assetId: 'asset-10', scheduledDate: '2025-02-15', completedDate: '2025-02-15', technicianId: 'user-3', status: 'completed', type: 'corrective', cost: 180, notes: 'Toner replacement and paper jam fix', checklist: ['Replace toner', 'Clear paper path', 'Test print'], createdAt: '2025-02-10T08:00:00Z' },
  { id: 'maint-4', assetId: 'asset-18', scheduledDate: '2025-03-01', completedDate: null, technicianId: 'user-3', status: 'in_progress', type: 'corrective', cost: 0, notes: 'Motor noise during height adjustment', checklist: ['Inspect motor', 'Check gears', 'Lubricate mechanism'], createdAt: '2025-02-28T08:00:00Z' },
  { id: 'maint-5', assetId: 'asset-11', scheduledDate: '2025-03-15', completedDate: null, technicianId: 'user-3', status: 'scheduled', type: 'preventive', cost: 0, notes: 'Quarterly MFP maintenance', checklist: ['Clean rollers', 'Replace waste toner', 'Calibrate colors'], createdAt: '2025-03-01T08:00:00Z' },
  { id: 'maint-6', assetId: 'asset-19', scheduledDate: '2025-04-15', completedDate: null, technicianId: 'user-3', status: 'scheduled', type: 'preventive', cost: 0, notes: 'Q2 server maintenance window', checklist: ['Check RAID status', 'Update firmware', 'Clean dust filters', 'Test failover'], createdAt: '2025-03-01T08:00:00Z' },
  { id: 'maint-7', assetId: 'asset-5', scheduledDate: '2025-01-20', completedDate: null, technicianId: 'user-3', status: 'overdue', type: 'preventive', cost: 0, notes: 'Annual desktop cleanup and OS update', checklist: ['Dust internal', 'Update OS', 'Check thermals'], createdAt: '2025-01-05T08:00:00Z' },
  { id: 'maint-8', assetId: 'asset-12', scheduledDate: '2025-02-20', completedDate: null, technicianId: 'user-3', status: 'cancelled', type: 'corrective', cost: 0, notes: 'Cancelled - issue resolved itself after reboot', checklist: ['Diagnose audio issue'], createdAt: '2025-02-18T08:00:00Z' },
];

// ── Repairs ────────────────────────────────────────────────
const repairs: Repair[] = [
  { id: 'repair-1', assetId: 'asset-1', vendorId: 'vendor-1', technicianId: 'user-3', issue: 'Screen flickering intermittently during heavy workloads', status: 'completed', priority: 'high', cost: 350, partsUsed: 'Display cable replacement', laborHours: 2, completionDate: '2025-01-25', notes: 'Replaced faulty display cable. Issue resolved.', createdAt: '2025-01-20T08:00:00Z' },
  { id: 'repair-2', assetId: 'asset-10', vendorId: 'vendor-1', technicianId: 'user-3', issue: 'Paper jam sensor malfunction', status: 'completed', priority: 'medium', cost: 120, partsUsed: 'Paper feed sensor', laborHours: 1, completionDate: '2025-02-10', notes: 'Sensor replaced during maintenance visit.', createdAt: '2025-02-05T08:00:00Z' },
  { id: 'repair-3', assetId: 'asset-6', vendorId: 'vendor-1', technicianId: 'user-3', issue: 'GPU driver crashes causing blue screens', status: 'in_progress', priority: 'critical', cost: 0, partsUsed: '', laborHours: 0, completionDate: null, notes: 'Investigating potential GPU failure. Running diagnostics.', createdAt: '2025-02-28T08:00:00Z' },
  { id: 'repair-4', assetId: 'asset-14', vendorId: 'vendor-1', technicianId: 'user-3', issue: 'Projector lamp dimming prematurely', status: 'pending', priority: 'low', cost: 0, partsUsed: '', laborHours: 0, completionDate: null, notes: 'Awaiting replacement lamp from vendor.', createdAt: '2025-03-01T08:00:00Z' },
  { id: 'repair-5', assetId: 'asset-20', vendorId: 'vendor-3', technicianId: 'user-3', issue: 'AC compressor not cooling efficiently', status: 'assigned', priority: 'medium', cost: 0, partsUsed: '', laborHours: 0, completionDate: null, notes: 'Assigned to FleetCare Motors for inspection.', createdAt: '2025-03-02T08:00:00Z' },
];

// ── Consumables ────────────────────────────────────────────
const consumables: Consumable[] = [
  { id: 'cons-1', name: 'A4 Copy Paper (Ream)', category: 'Paper', stock: 150, threshold: 50, unit: 'reams', costPerUnit: 12, departmentId: 'dept-3', locationId: 'loc-1', lastRestocked: '2025-02-15', createdAt: '2024-01-10T08:00:00Z' },
  { id: 'cons-2', name: 'HP Toner 58A Black', category: 'Printer Supplies', stock: 12, threshold: 5, unit: 'cartridges', costPerUnit: 280, departmentId: 'dept-2', locationId: 'loc-1', lastRestocked: '2025-01-20', createdAt: '2024-01-10T08:00:00Z' },
  { id: 'cons-3', name: 'Canon Color Toner Set', category: 'Printer Supplies', stock: 8, threshold: 3, unit: 'sets', costPerUnit: 450, departmentId: 'dept-4', locationId: 'loc-2', lastRestocked: '2025-02-01', createdAt: '2024-02-01T08:00:00Z' },
  { id: 'cons-4', name: 'Whiteboard Markers (Pack of 4)', category: 'Stationery', stock: 45, threshold: 20, unit: 'packs', costPerUnit: 15, departmentId: 'dept-1', locationId: 'loc-1', lastRestocked: '2025-02-10', createdAt: '2024-01-10T08:00:00Z' },
  { id: 'cons-5', name: 'USB-C to USB-C Cables 1m', category: 'IT Accessories', stock: 3, threshold: 10, unit: 'cables', costPerUnit: 25, departmentId: 'dept-2', locationId: 'loc-1', lastRestocked: '2024-11-01', createdAt: '2024-03-01T08:00:00Z' },
  { id: 'cons-6', name: 'HDMI Cables 2m', category: 'IT Accessories', stock: 15, threshold: 5, unit: 'cables', costPerUnit: 18, departmentId: 'dept-2', locationId: 'loc-1', lastRestocked: '2025-01-15', createdAt: '2024-03-01T08:00:00Z' },
  { id: 'cons-7', name: 'Hand Sanitizer 500ml', category: 'Hygiene', stock: 24, threshold: 10, unit: 'bottles', costPerUnit: 8, departmentId: 'dept-3', locationId: 'loc-1', lastRestocked: '2025-02-20', createdAt: '2024-01-10T08:00:00Z' },
  { id: 'cons-8', name: 'Sticky Notes 76x76mm (Pack)', category: 'Stationery', stock: 60, threshold: 25, unit: 'packs', costPerUnit: 5, departmentId: 'dept-3', locationId: 'loc-1', lastRestocked: '2025-02-25', createdAt: '2024-01-10T08:00:00Z' },
];

// ── Consumable Allocations ─────────────────────────────────
const consumableAllocations: ConsumableAllocation[] = [
  { id: 'calloc-1', consumableId: 'cons-1', employeeId: 'user-4', departmentId: 'dept-3', quantity: 10, date: '2025-02-20' },
  { id: 'calloc-2', consumableId: 'cons-5', employeeId: 'user-7', departmentId: 'dept-2', quantity: 2, date: '2025-02-25' },
  { id: 'calloc-3', consumableId: 'cons-7', employeeId: 'user-5', departmentId: 'dept-4', quantity: 4, date: '2025-02-22' },
  { id: 'calloc-4', consumableId: 'cons-2', employeeId: 'user-2', departmentId: 'dept-2', quantity: 1, date: '2025-01-25' },
  { id: 'calloc-5', consumableId: 'cons-4', employeeId: 'user-1', departmentId: 'dept-1', quantity: 3, date: '2025-02-12' },
];

// ── Procurements ───────────────────────────────────────────
const procurements: Procurement[] = [
  { id: 'proc-1', assetName: 'Dell Latitude 5550', assetType: 'it_equipment', category: 'laptop', requestedBy: 'user-2', departmentId: 'dept-2', vendorId: 'vendor-1', quantity: 5, estimatedCost: 25000, actualCost: 23500, status: 'received', approvedBy: 'user-1', approvalDate: '2025-01-10', expectedDelivery: '2025-02-01', receivedDate: '2025-01-28', notes: 'New hire laptops for Q1', createdAt: '2025-01-05T08:00:00Z' },
  { id: 'proc-2', assetName: 'Steelcase Series 2 Chair', assetType: 'furniture', category: 'chair', requestedBy: 'user-4', departmentId: 'dept-3', vendorId: 'vendor-2', quantity: 10, estimatedCost: 18000, actualCost: null, status: 'ordered', approvedBy: 'user-1', approvalDate: '2025-02-15', expectedDelivery: '2025-03-20', receivedDate: null, notes: 'Ergonomic chairs for HR floor', createdAt: '2025-02-10T08:00:00Z' },
  { id: 'proc-3', assetName: 'Cisco Meraki MR46 AP', assetType: 'it_equipment', category: 'networking', requestedBy: 'user-2', departmentId: 'dept-2', vendorId: 'vendor-4', quantity: 8, estimatedCost: 12000, actualCost: null, status: 'approved', approvedBy: 'user-1', approvalDate: '2025-03-01', expectedDelivery: '2025-03-25', receivedDate: null, notes: 'WiFi 6 upgrade for all offices', createdAt: '2025-02-25T08:00:00Z' },
  { id: 'proc-4', assetName: 'HP DesignJet T650', assetType: 'office_equipment', category: 'printer', requestedBy: 'user-3', departmentId: 'dept-6', vendorId: 'vendor-1', quantity: 1, estimatedCost: 6500, actualCost: null, status: 'requested', approvedBy: null, approvalDate: null, expectedDelivery: '2025-04-15', receivedDate: null, notes: 'Large format printer for engineering blueprints', createdAt: '2025-03-03T08:00:00Z' },
  { id: 'proc-5', assetName: 'Standing Desk Converters', assetType: 'furniture', category: 'desk', requestedBy: 'user-5', departmentId: 'dept-4', vendorId: 'vendor-2', quantity: 4, estimatedCost: 4800, actualCost: null, status: 'rejected', approvedBy: 'user-1', approvalDate: '2025-02-20', expectedDelivery: '', receivedDate: null, notes: 'Rejected - full standing desks preferred', createdAt: '2025-02-18T08:00:00Z' },
];

// ── Depreciation ───────────────────────────────────────────
const depreciation: DepreciationRecord[] = [
  { id: 'dep-1', assetId: 'asset-19', year: 2024, depreciationAmount: 3714, accumulatedDepreciation: 3714, bookValue: 24286, method: 'straight_line', date: '2024-12-31' },
  { id: 'dep-2', assetId: 'asset-19', year: 2025, depreciationAmount: 3714, accumulatedDepreciation: 7429, bookValue: 20571, method: 'straight_line', date: '2025-12-31' },
  { id: 'dep-3', assetId: 'asset-20', year: 2023, depreciationAmount: 20625, accumulatedDepreciation: 20625, bookValue: 224375, method: 'straight_line', date: '2023-12-31' },
  { id: 'dep-4', assetId: 'asset-20', year: 2024, depreciationAmount: 20625, accumulatedDepreciation: 41250, bookValue: 203750, method: 'straight_line', date: '2024-12-31' },
  { id: 'dep-5', assetId: 'asset-2', year: 2024, depreciationAmount: 1440, accumulatedDepreciation: 1440, bookValue: 6760, method: 'straight_line', date: '2024-12-31' },
  { id: 'dep-6', assetId: 'asset-6', year: 2024, depreciationAmount: 1040, accumulatedDepreciation: 1040, bookValue: 4760, method: 'straight_line', date: '2024-12-31' },
];

// ── Audit Logs ─────────────────────────────────────────────
const auditLogs: AuditLog[] = [
  { id: 'log-1', userId: 'user-1', userName: 'Ateeb Ahmed', action: 'CREATE', module: 'Assets', entityId: 'asset-1', entityType: 'Asset', details: 'Created asset: Dell Latitude 5540', timestamp: '2024-02-15T09:00:00Z' },
  { id: 'log-2', userId: 'user-1', userName: 'Ateeb Ahmed', action: 'APPROVE', module: 'Allocations', entityId: 'alloc-1', entityType: 'Allocation', details: 'Approved allocation of Dell Latitude 5540 to Sarah Mitchell', timestamp: '2024-02-16T10:00:00Z' },
  { id: 'log-3', userId: 'user-2', userName: 'Sarah Mitchell', action: 'CREATE', module: 'Maintenance', entityId: 'maint-1', entityType: 'Maintenance', details: 'Scheduled server maintenance for PowerEdge R760', timestamp: '2025-01-10T11:00:00Z' },
  { id: 'log-4', userId: 'user-3', userName: 'Omar Hassan', action: 'UPDATE', module: 'Maintenance', entityId: 'maint-1', entityType: 'Maintenance', details: 'Completed server maintenance - all checks passed', timestamp: '2025-01-15T14:00:00Z' },
  { id: 'log-5', userId: 'user-1', userName: 'Ateeb Ahmed', action: 'CREATE', module: 'Procurement', entityId: 'proc-1', entityType: 'Procurement', details: 'Approved procurement: 5x Dell Latitude 5550', timestamp: '2025-01-10T09:30:00Z' },
  { id: 'log-6', userId: 'user-3', userName: 'Omar Hassan', action: 'UPDATE', module: 'Repairs', entityId: 'repair-1', entityType: 'Repair', details: 'Completed repair: Screen flickering on Dell Latitude 5540', timestamp: '2025-01-25T16:00:00Z' },
  { id: 'log-7', userId: 'user-4', userName: 'Priya Sharma', action: 'CREATE', module: 'Consumables', entityId: 'calloc-1', entityType: 'ConsumableAllocation', details: 'Allocated 10 reams of A4 paper to HR department', timestamp: '2025-02-20T10:00:00Z' },
  { id: 'log-8', userId: 'user-1', userName: 'Ateeb Ahmed', action: 'UPDATE', module: 'Users', entityId: 'user-8', entityType: 'User', details: 'Updated user: Elena Torres - assigned to Operations', timestamp: '2025-02-22T08:00:00Z' },
  { id: 'log-9', userId: 'user-2', userName: 'Sarah Mitchell', action: 'CREATE', module: 'Assets', entityId: 'asset-19', entityType: 'Asset', details: 'Registered new server: Dell PowerEdge R760', timestamp: '2024-01-05T09:00:00Z' },
  { id: 'log-10', userId: 'user-1', userName: 'Ateeb Ahmed', action: 'DELETE', module: 'Documents', entityId: 'doc-old', entityType: 'Document', details: 'Deleted outdated warranty document', timestamp: '2025-03-01T11:00:00Z' },
];

// ── Notifications ──────────────────────────────────────────
const notifications: Notification[] = [
  { id: 'notif-1', userId: 'user-1', type: 'maintenance', title: 'Maintenance Overdue', message: 'Annual desktop cleanup for Dell OptiPlex 7010 is overdue since Jan 20.', isRead: false, priority: 'high', createdAt: '2025-02-20T08:00:00Z' },
  { id: 'notif-2', userId: 'user-1', type: 'stock', title: 'Low Stock Alert', message: 'USB-C cables stock (3) is below threshold (10). Please reorder.', isRead: false, priority: 'medium', createdAt: '2025-03-01T08:00:00Z' },
  { id: 'notif-3', userId: 'user-1', type: 'procurement', title: 'New Procurement Request', message: 'Omar Hassan requested HP DesignJet T650 for Engineering dept.', isRead: false, priority: 'medium', createdAt: '2025-03-03T09:00:00Z' },
  { id: 'notif-4', userId: 'user-2', type: 'allocation', title: 'Allocation Pending', message: 'Raj Patel requested IKEA BEKANT Standing Desk allocation.', isRead: false, priority: 'low', createdAt: '2025-03-06T08:00:00Z' },
  { id: 'notif-5', userId: 'user-1', type: 'warranty', title: 'Warranty Expiring Soon', message: 'HP LaserJet Pro MFP warranty expires on Jun 10, 2025.', isRead: true, priority: 'medium', createdAt: '2025-02-10T08:00:00Z' },
  { id: 'notif-6', userId: 'user-3', type: 'repair', title: 'Repair Assigned', message: 'You have been assigned to investigate GPU crashes on HP Z2 Tower.', isRead: false, priority: 'critical', createdAt: '2025-02-28T10:00:00Z' },
  { id: 'notif-7', userId: 'user-1', type: 'system', title: 'System Backup Complete', message: 'Weekly automated backup completed successfully.', isRead: true, priority: 'low', createdAt: '2025-03-02T03:00:00Z' },
  { id: 'notif-8', userId: 'user-2', type: 'maintenance', title: 'Maintenance Scheduled', message: 'Quarterly MFP maintenance for Canon imageRUNNER scheduled for Mar 15.', isRead: true, priority: 'low', createdAt: '2025-03-01T08:00:00Z' },
];

// ── Documents ──────────────────────────────────────────────
const documents: Document[] = [
  { id: 'doc-1', assetId: 'asset-19', name: 'Dell PowerEdge R760 Warranty Certificate', type: 'warranty', description: '5-year ProSupport Plus warranty documentation', fileSize: '2.4 MB', uploadedBy: 'user-2', createdAt: '2024-01-05T10:00:00Z' },
  { id: 'doc-2', assetId: 'asset-20', name: 'Toyota Land Cruiser 300 Purchase Invoice', type: 'invoice', description: 'Original purchase invoice from Al Futtaim Motors', fileSize: '1.8 MB', uploadedBy: 'user-1', createdAt: '2023-05-20T10:00:00Z' },
  { id: 'doc-3', assetId: 'asset-2', name: 'MacBook Pro AppleCare+ Certificate', type: 'warranty', description: 'AppleCare+ coverage until March 2027', fileSize: '890 KB', uploadedBy: 'user-1', createdAt: '2024-03-01T10:00:00Z' },
  { id: 'doc-4', assetId: 'asset-11', name: 'Canon imageRUNNER Service Manual', type: 'manual', description: 'Technical service and maintenance manual', fileSize: '15.2 MB', uploadedBy: 'user-3', createdAt: '2023-09-05T10:00:00Z' },
  { id: 'doc-5', assetId: 'asset-1', name: 'Dell Latitude Screen Repair Report', type: 'service_report', description: 'Service report for display cable replacement', fileSize: '540 KB', uploadedBy: 'user-3', createdAt: '2025-01-25T17:00:00Z' },
  { id: 'doc-6', assetId: 'asset-15', name: 'Herman Miller Aeron Purchase Order', type: 'purchase_order', description: 'Bulk PO for executive office furniture', fileSize: '1.1 MB', uploadedBy: 'user-6', createdAt: '2024-01-08T10:00:00Z' },
];

// ── System Config ──────────────────────────────────────────
const systemConfig: SystemConfig = {
  companyName: '1XL Infrastructure',
  currency: 'AED',
  dateFormat: 'MM/DD/YYYY',
  maintenanceReminderDays: 7,
  warrantyAlertDays: 30,
  stockAlertEnabled: true,
  depreciationMethod: 'straight_line',
  autoBackupEnabled: true,
  backupFrequency: 'weekly',
};

// ── Organizations ─────────────────────────────────────────
const organizations: Organization[] = [
  { id: 'org-1', name: '1XL Ventures', shortName: 'VENTURES' },
  { id: 'org-2', name: '1XL Infra', shortName: 'INFRA' },
  { id: 'org-3', name: '1XL Universe', shortName: 'UNIVERSE' },
];

// ── Export ──────────────────────────────────────────────────
export const seedData = {
  users,
  departments,
  locations,
  assets,
  allocations,
  maintenance,
  repairs,
  vendors,
  consumables,
  consumableAllocations,
  procurements,
  depreciation,
  auditLogs,
  notifications,
  documents,
  systemConfig,
  organizations,
};
