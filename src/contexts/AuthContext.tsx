import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';
import { seedData } from '../data/seedData';

const LS_USERS = 'oatms_users';
const LS_SESSION = 'oatms_currentUser';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  authLoading: boolean;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getUsers(): User[] {
  // Ensure users exist in localStorage (AuthProvider loads before DataProvider)
  let raw = localStorage.getItem(LS_USERS);
  if (!raw) {
    localStorage.setItem(LS_USERS, JSON.stringify(seedData.users));
    raw = localStorage.getItem(LS_USERS);
  }
  return raw ? JSON.parse(raw) : [];
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem(LS_SESSION);
    if (storedUserId) {
      const users = getUsers();
      const found = users.find(u => u.id === storedUserId);
      if (found && found.isActive) setUser(found);
    }
    setAuthLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    const users = getUsers();
    const found = users.find(u => u.email === username && u.password === password && u.isActive);
    if (!found) return false;
    setUser(found);
    localStorage.setItem(LS_SESSION, found.id);
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(LS_SESSION);
  }, []);

  const hasRole = useCallback((roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  }, [user]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-slate-950">
        <div className="w-10 h-10 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, authLoading, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
