import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Box,
} from '@mui/material';
import { Delete, Done } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import {
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation,
  useClearAllNotificationsMutation,
} from '../../redux/api/notificationApi';

const NotificationList = ({ notifications }) => {
  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();
  const [clearAll] = useClearAllNotificationsMutation();

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId).unwrap();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification(notificationId).unwrap();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAll().unwrap();
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
    }
  };

  return (
    <Card className="dark:bg-gray-800 dark:text-white">
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Recent Notifications</Typography>
          <Box>
            <Button
              variant="outlined"
              onClick={handleMarkAllAsRead}
              className="dark:text-white"
              sx={{ mr: 1 }}
            >
              Mark All as Read
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleClearAll}
              className="dark:text-white"
            >
              Clear All
            </Button>
          </Box>
        </Box>

        {notifications?.length > 0 ? (
          <List>
            {notifications.map((notification) => (
              <ListItem
                key={notification.id}
                sx={{
                  bgcolor: notification.read ? 'transparent' : 'action.hover',
                  mb: 1,
                  borderRadius: 1,
                }}
              >
                <ListItemText
                  primary={notification.title}
                  secondary={
                    <>
                      <Typography component="span" variant="body2">
                        {notification.message}
                      </Typography>
                      <br />
                      <Typography component="span" variant="caption" color="text.secondary">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </Typography>
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  {!notification.read && (
                    <IconButton
                      edge="end"
                      aria-label="mark as read"
                      onClick={() => handleMarkAsRead(notification.id)}
                      sx={{ mr: 1 }}
                    >
                      <Done />
                    </IconButton>
                  )}
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDelete(notification.id)}
                  >
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            className="dark:text-white"
            sx={{ py: 4 }}
          >
            No notifications
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationList; 