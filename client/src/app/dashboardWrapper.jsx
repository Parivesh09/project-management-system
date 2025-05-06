"use client";

import React, { useEffect } from "react";
import Navbar from "../components/Navbar";
// import Sidebar from "../components/Sidebar";
import Sidebar from "../components/Sidebar/index";
import AuthProvider from "./authProvider";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor, useAppSelector } from "../redux/store";
import { usePathname } from "next/navigation";

const DashboardLayout = ({ children }) => {
  const isSidebarCollapsed = useAppSelector(state => state.global.isSidebarCollapsed);

  return (
    <div className="flex min-h-screen w-full bg-gray-50 text-gray-900">
      <Sidebar />
      <main
        className={`flex w-full flex-col bg-gray-50 dark:bg-dark-bg ${
          isSidebarCollapsed ? "" : "md:pl-64"
        }`}
      >
        <Navbar />
        {children}
      </main>
    </div>
  );
};

// Applies the dark class based on Redux state once Provider is in context
const ThemeHandler = () => {
  const isDarkMode = useAppSelector(state => state.global.isDarkMode);
  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDarkMode]);
  return null;
};

const DashboardWrapper = ({ children }) => {
  const pathname = usePathname();
  const PUBLIC_PATHS = ["/login", "/register"];
  const isPublic = PUBLIC_PATHS.includes(pathname);
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthProvider>
          {/* Toggle dark class after store is available */}
          {!isPublic && <ThemeHandler />}
          {isPublic ? children : <DashboardLayout>{children}</DashboardLayout>}
        </AuthProvider>
      </PersistGate>
    </Provider>
  );
};

export default DashboardWrapper;
