'use client';

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import { selectIsAuthenticated, logout, setCredentials } from '../redux/slices/authSlice';
import { useGetCurrentUserQuery } from '../redux/services/api';
import Loader from '../components/Loader';

const PUBLIC_PATHS = ['/login', '/register'];

const AuthProvider = ({ children }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const pathname = usePathname();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { data: user, isLoading, error, isError } = useGetCurrentUserQuery(undefined, {
    skip: !isAuthenticated,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(setCredentials({ token }));
      router.push('/');
    }
  }, [dispatch, router]);

  useEffect(() => {
    let mounted = true;
    
    const handleAuth = async () => {
      if (!mounted || isLoading) return;

      // If getCurrentUser fails or returns user not found, logout
      if (isError || (isAuthenticated && !user)) {
        console.error('Auth error or user not found:', error);
        dispatch(logout());
        if (pathname !== '/login') {
          router.replace('/login?error=user_not_found');
        }
        return;
      }

      const isPublicPath = PUBLIC_PATHS.includes(pathname);
      
      if (!isAuthenticated && !isPublicPath) {
        // Prevent multiple redirects by checking current path
        if (pathname !== '/login') {
          router.replace('/login');
        }
      } else if (isAuthenticated && isPublicPath) {
        // Prevent multiple redirects by checking current path
        if (pathname !== '/') {
          router.replace('/');
        }
      }
    };

    handleAuth();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, isLoading, pathname, user, isError, error]);

  // Show loading state only during initial data fetch
  if (isLoading && isAuthenticated && !isError) {
    return (
      <Loader fullScreen />
    );
  }

  // Allow rendering children for public paths even when not authenticated
  if (!isAuthenticated && !PUBLIC_PATHS.includes(pathname)) {
    return null;
  }

  return <>{children}</>;
};

export default AuthProvider;
