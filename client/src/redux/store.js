import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { api } from './services/api';
import globalReducer from './slices/globalSlice';
import authReducer from './slices/authSlice';
import notificationReducer from './slices/notificationSlice';

// Create a storage object that falls back to a noop storage when window is not available
const createNoopStorage = () => {
  return {
    getItem() {
      return Promise.resolve(null);
    },
    setItem(key, value) {
      return Promise.resolve(value);
    },
    removeItem() {
      return Promise.resolve();
    },
  };
};

const persistStorage = typeof window !== 'undefined' ? storage : createNoopStorage();

// Configure persist for specific reducers
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['token', 'user', 'isAuthenticated'],
  // Add blacklist for transient state
  blacklist: ['loading', 'error'],
  // Add merge strategy
  stateReconciler: (inboundState, originalState) => ({
    ...originalState,
    ...inboundState,
    // Ensure we don't persist loading states
    loading: false,
    error: null
  })
};

const globalPersistConfig = {
  key: 'global',
  storage,
  whitelist: ['isDarkMode', 'isSidebarCollapsed']
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedGlobalReducer = persistReducer(globalPersistConfig, globalReducer);

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    notifications: notificationReducer,
    auth: persistedAuthReducer,
    global: persistedGlobalReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
          // Ignore RTK Query actions
          ...Object.keys(api.endpoints).flatMap(
            endpoint => [
              api.endpoints[endpoint].matchPending,
              api.endpoints[endpoint].matchFulfilled,
              api.endpoints[endpoint].matchRejected
            ].map(matcher => matcher.type)
          )
        ]
      }
    }).concat(api.middleware),
  devTools: process.env.NODE_ENV !== 'production'
});

export const persistor = persistStore(store);

// Typed hooks for use throughout the app
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector; 