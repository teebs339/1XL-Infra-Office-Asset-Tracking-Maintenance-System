import { format, parseISO, differenceInDays, isAfter, isBefore } from 'date-fns';
import { Asset, DepreciationRecord } from '../types';

export function formatDate(dateStr: string): string {
  if (!dateStr) return 'N/A';
  try {
    return format(parseISO(dateStr), 'MMM dd, yyyy');
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return 'N/A';
  try {
    return format(parseISO(dateStr), 'MMM dd, yyyy HH:mm');
  } catch {
    return dateStr;
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function daysUntil(dateStr: string): number {
  if (!dateStr) return Infinity;
  return differenceInDays(parseISO(dateStr), new Date());
}

export function isExpired(dateStr: string): boolean {
  if (!dateStr) return false;
  return isBefore(parseISO(dateStr), new Date());
}

export function isExpiringSoon(dateStr: string, days: number = 30): boolean {
  if (!dateStr) return false;
  const d = daysUntil(dateStr);
  return d >= 0 && d <= days;
}

export function calculateStraightLineDepreciation(asset: Asset): DepreciationRecord[] {
  const records: DepreciationRecord[] = [];
  const annualDepreciation = (asset.purchaseCost - asset.salvageValue) / asset.usefulLifeYears;
  let accumulated = 0;

  for (let year = 0; year < asset.usefulLifeYears; year++) {
    accumulated += annualDepreciation;
    const purchaseYear = new Date(asset.purchaseDate).getFullYear();
    records.push({
      id: `dep-calc-${asset.id}-${year}`,
      assetId: asset.id,
      year: purchaseYear + year,
      depreciationAmount: Math.round(annualDepreciation * 100) / 100,
      accumulatedDepreciation: Math.round(accumulated * 100) / 100,
      bookValue: Math.round((asset.purchaseCost - accumulated) * 100) / 100,
      method: 'straight_line',
      date: `${purchaseYear + year}-12-31`,
    });
  }
  return records;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    available: 'bg-green-100 text-green-800',
    allocated: 'bg-blue-100 text-blue-800',
    under_maintenance: 'bg-yellow-100 text-yellow-800',
    retired: 'bg-gray-100 text-gray-600',
    disposed: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    active: 'bg-blue-100 text-blue-800',
    returned: 'bg-gray-100 text-gray-600',
    scheduled: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-600',
    assigned: 'bg-purple-100 text-purple-800',
    requested: 'bg-yellow-100 text-yellow-800',
    ordered: 'bg-blue-100 text-blue-800',
    received: 'bg-green-100 text-green-800',
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };
  return colors[priority] || 'bg-gray-100 text-gray-800';
}

export function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(h => {
      const val = row[h];
      const str = val === null || val === undefined ? '' : String(val);
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    }).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
