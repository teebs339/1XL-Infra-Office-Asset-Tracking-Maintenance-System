import { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  LayoutDashboard, Package, Users, ArrowLeftRight, Wrench, Truck, ShoppingCart,
  TrendingDown, ScrollText, Bell, BarChart3, FileText, Building2, Settings,
  LogOut, Menu, ChevronLeft, ChevronRight, BoxesIcon, Search, X, Sun, Moon,
  ChevronDown, Check
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'employee', 'technician', 'vendor', 'auditor'] },
  { path: '/assets', label: 'Assets', icon: Package, roles: ['admin', 'manager', 'employee', 'auditor'] },
  { path: '/allocations', label: 'Allocations', icon: ArrowLeftRight, roles: ['admin', 'manager', 'employee'] },
  { path: '/maintenance', label: 'Maintenance', icon: Wrench, roles: ['admin', 'manager', 'technician'] },
  { path: '/repairs', label: 'Repairs', icon: Truck, roles: ['admin', 'manager', 'technician', 'vendor'] },
  { path: '/consumables', label: 'Consumables', icon: BoxesIcon, roles: ['admin', 'manager', 'employee'] },
  { path: '/procurement', label: 'Procurement', icon: ShoppingCart, roles: ['admin', 'manager'] },
  { path: '/vendors', label: 'Vendors', icon: Building2, roles: ['admin', 'manager'] },
  { path: '/depreciation', label: 'Depreciation', icon: TrendingDown, roles: ['admin', 'auditor'] },
  { path: '/audit-logs', label: 'Audit Logs', icon: ScrollText, roles: ['admin', 'auditor'] },
  { path: '/reports', label: 'Reports', icon: BarChart3, roles: ['admin', 'manager', 'auditor'] },
  { path: '/documents', label: 'Documents', icon: FileText, roles: ['admin', 'manager'] },
  { path: '/locations', label: 'Locations & Depts', icon: Building2, roles: ['admin'] },
  { path: '/users', label: 'User Management', icon: Users, roles: ['admin'] },
  { path: '/settings', label: 'Settings', icon: Settings, roles: ['admin'] },
];

export default function Layout() {
  const { user, logout, organization, organizations, switchOrg } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const orgDropdownRef = useRef<HTMLDivElement>(null);

  const data = useData();
  const { isDark, toggleTheme } = useTheme();
  const notifications = data.notifications.getAll().filter(n => n.userId === user?.id && !n.isRead);
  const filteredNav = navItems.filter(item => user && item.roles.includes(user.role));

  // Close org dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (orgDropdownRef.current && !orgDropdownRef.current.contains(e.target as Node)) {
        setOrgDropdownOpen(false);
      }
    }
    if (orgDropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [orgDropdownOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  function OrgSwitcher() {
    if (!organization) return null;
    return (
      <div className="px-3 py-2 border-b border-slate-700/50" ref={orgDropdownRef}>
        <button
          onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? organization.name : undefined}
        >
          <div className="w-7 h-7 rounded-md bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 text-left min-w-0">
                <div className="text-xs font-semibold text-white truncate">{organization.name}</div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${orgDropdownOpen ? 'rotate-180' : ''}`} />
            </>
          )}
        </button>
        {orgDropdownOpen && (
          <div className={`mt-1.5 bg-slate-800 border border-slate-700 rounded-lg overflow-hidden shadow-xl shadow-black/30 ${
            collapsed ? 'absolute left-16 top-16 w-48 z-50' : ''
          }`}>
            {organizations.map(org => (
              <button
                key={org.id}
                onClick={() => { switchOrg(org); setOrgDropdownOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${
                  organization.id === org.id
                    ? 'bg-indigo-500/15 text-indigo-300'
                    : 'text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <Building2 className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium flex-1">{org.name}</span>
                {organization.id === org.id && <Check className="w-4 h-4 text-indigo-400" />}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  function SidebarContent() {
    return (
      <>
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3 min-w-0">
            <img src={`${import.meta.env.BASE_URL}logo.jpg`} alt="1XL" className="w-9 h-9 rounded-lg flex-shrink-0 object-contain" />
            {!collapsed && (
              <span className="text-lg font-bold tracking-tight whitespace-nowrap text-white">1XL Assets</span>
            )}
          </div>
        </div>

        {/* Organization Switcher */}
        <OrgSwitcher />

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {filteredNav.map(item => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-400'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
                {item.path === '/notifications' && notifications.length > 0 && (
                  <span className={`${collapsed ? 'absolute -top-1 -right-1' : 'ml-auto'} bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center`}>
                    {notifications.length}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User info + collapse */}
        <div className="border-t border-slate-700/50 p-3">
          {!collapsed && user && (
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 capitalize">{user.role}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-white/5 hover:text-red-400 transition-colors w-full"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              {!collapsed && <span>Logout</span>}
            </button>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors flex-shrink-0"
              title={collapsed ? 'Expand' : 'Collapse'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-950">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex ${collapsed ? 'w-20' : 'w-64'} bg-slate-900 text-white flex-col transition-all duration-300 h-full`}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-slate-900 text-white flex flex-col animate-slideIn">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search assets, users..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 lg:w-80 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Org badge in header */}
            {organization && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/20 rounded-lg">
                <Building2 className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-300">{organization.name}</span>
              </div>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => navigate('/notifications')}
              className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
            {user && (
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-slate-700">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold text-white">
                  {user.name.charAt(0)}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="animate-fadeIn">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
