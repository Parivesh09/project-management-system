'use client';

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import { selectIsAuthenticated, logout, setCredentials } from '../redux/slices/authSlice';
import { useGetCurrentUserQuery } from '../redux/services/api';
import { initializeSocket, disconnectSocket } from '../services/socket';
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
      initializeSocket(token);
    }
  }, [dispatch]);

  useEffect(() => {
    if (isError) {
      console.error('Error fetching user:', error);
        dispatch(logout());
      router.push('/login');
        }
  }, [isError, error, dispatch, router]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !PUBLIC_PATHS.includes(pathname)) {
      router.push('/login');
        }
  }, [isLoading, isAuthenticated, pathname, router]);

  if (isLoading) {
    return <Loader />;
  }

  return children;
};

export default AuthProvider;
