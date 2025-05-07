import { io } from 'socket.io-client';
import { store } from '../redux/store';
import { addNotification } from '../redux/slices/notificationSlice';
import { selectNotificationPreferences } from '../redux/slices/notificationSlice';

let socket = null;

export const initializeSocket = (token) => {
  if (socket) {
    socket.disconnect();
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  
  socket = io(baseUrl, {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    auth: {
      token,
    },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 60000,
    forceNew: true,
  });

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('notification', (notification) => {
    const state = store.getState();
    const preferences = selectNotificationPreferences(state);

    // Check if user wants to receive this type of notification
    if (preferences[notification.type]) {
      store.dispatch(addNotification(notification));

      // Show browser notification if enabled
      if (preferences.inApp && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/logo.png',
        });
      }
    }
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket; 