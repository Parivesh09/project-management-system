import { useEffect } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { useSnackbar } from 'notistack';
import { useDispatch } from 'react-redux';
import { addNotification } from '@/redux/slices/notificationSlice';

export default function NotificationHandler() {
  const socket = useSocket();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!socket) return;

    socket.on('notification', (notification) => {
      // Add notification to Redux store
      dispatch(addNotification(notification));

      // Show snackbar notification
      enqueueSnackbar(notification.message, {
        variant: notification.type === 'ERROR' ? 'error' : 'success',
        autoHideDuration: 5000,
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right',
        },
      });

      // If browser notifications are supported and permitted, show one
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Project Management App', {
          body: notification.message,
          icon: '/icons/icon-192x192.png'
        });
      }
    });

    return () => {
      socket.off('notification');
    };
  }, [socket, dispatch, enqueueSnackbar]);

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return null;
} 