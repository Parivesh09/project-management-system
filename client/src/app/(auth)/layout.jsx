'use client';

import React from 'react';

const AuthLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full">{children}</div>
    </div>
  );
};

export default AuthLayout; 