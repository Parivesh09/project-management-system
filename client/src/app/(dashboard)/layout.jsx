'use client';

import React from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useAppSelector } from '../../redux/store';
import AuthProvider from '../authProvider';

const DashboardLayout = ({ children }) => {
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed,
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <AuthProvider>
      <div className="flex min-h-screen w-full bg-gray-50 text-gray-900">
        <Sidebar />
        <main
          className={`flex w-full flex-col bg-gray-50 dark:bg-dark-bg ${
            isSidebarCollapsed ? '' : 'md:pl-64'
          }`}
        >
          <Navbar />
          {children}
        </main>
      </div>
    </AuthProvider>
  );
};

export default DashboardLayout; 