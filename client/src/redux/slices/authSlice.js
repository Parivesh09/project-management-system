import { createSlice } from '@reduxjs/toolkit';
import { api } from '../services/api';

const initialState = {
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, { payload: { user, token } }) => {
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
    },
    updateUser: (state, { payload }) => {
      state.user = { ...state.user, ...payload };
    }
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        api.endpoints.login.matchFulfilled,
        (state, { payload }) => {
          console.log('Login successful:', payload);
          state.token = payload.token;
          state.user = payload.user;
          state.isAuthenticated = true;
        }
      )
      .addMatcher(
        api.endpoints.register.matchFulfilled,
        (state, { payload }) => {
          console.log('Registration successful:', payload);
          state.token = payload.token;
          state.user = payload.user;
          state.isAuthenticated = true;
        }
      )
      .addMatcher(
        api.endpoints.getCurrentUser.matchFulfilled,
        (state, { payload }) => {
          console.log('Got current user:', payload);
          state.user = payload;
          state.isAuthenticated = true;
        }
      )
      .addMatcher(
        api.endpoints.logout.matchFulfilled,
        (state) => {
          console.log('Logout successful');
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
        }
      );
  },
});

export const { setCredentials, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectToken = (state) => state.auth.token; 