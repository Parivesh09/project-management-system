import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
  unreadCount: 0,
  preferences: {
    email: {
      enabled: true,
      taskAssigned: true,
      taskUpdated: true,
      taskCompleted: true,
      taskCommented: true,
    },
    inApp: {
      enabled: true,
      taskAssigned: true,
      taskUpdated: true,
      taskCompleted: true,
      taskCommented: true,
    },
  },
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state, action) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => !n.read).length;
    },
    markAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
        state.unreadCount = state.notifications.filter(n => !n.read).length;
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(n => n.read = true);
      state.unreadCount = 0;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    removeNotification: (state, action) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1) {
        if (!state.notifications[index].read) {
          state.unreadCount -= 1;
        }
        state.notifications.splice(index, 1);
      }
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    setPreferences: (state, action) => {
      state.preferences = action.payload;
    },
    updatePreferences: (state, action) => {
      state.preferences = {
        ...state.preferences,
        ...action.payload,
      };
    },
  },
});

export const {
  setNotifications,
  markAsRead,
  markAllAsRead,
  addNotification,
  removeNotification,
  clearNotifications,
  setPreferences,
  updatePreferences,
} = notificationSlice.actions;

// Selectors
export const selectNotifications = (state) => state.notifications.notifications;
export const selectUnreadCount = (state) => state.notifications.unreadCount;
export const selectNotificationPreferences = (state) => state.notifications.preferences;

export default notificationSlice.reducer; 