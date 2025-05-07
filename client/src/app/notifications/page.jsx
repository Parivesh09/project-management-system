"use client";

import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Container,
  Tabs,
  Tab,
  Paper,
} from "@mui/material";
import { Delete, Settings } from "@mui/icons-material";
import {
  selectNotifications,
  selectNotificationPreferences,
  updatePreferences,
  markAllAsRead,
  clearNotifications,
} from "../../redux/slices/notificationSlice";
import { formatDistanceToNow } from "date-fns";
import {
  useGetNotificationsQuery,
  useGetNotificationPreferencesQuery,
} from "../../redux/api/notificationApi";
import NotificationList from "../../components/notifications/NotificationList";
import NotificationPreferences from "../../components/notifications/NotificationPreferences";

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.notifications);
  const preferences = useSelector((state) => state.notificationPreferences);
  const [tabValue, setTabValue] = React.useState(0);
  const {
    data: notificationsData,
    isLoading: notificationsLoading,
    refetch: refetchNotifications,
  } = useGetNotificationsQuery();
  const {
    data: preferencesData,
    isLoading: preferencesLoading,
    refetch: refetchPreferences,
  } = useGetNotificationPreferencesQuery();

  useEffect(() => {
    // Request notification permissions if not already granted
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const handlePreferenceChange = (preference) => {
    dispatch(
      updatePreferences({
        [preference]: !preferences[preference],
      }),
    );
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handleClearAll = () => {
    dispatch(clearNotifications());
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (notificationsLoading || preferencesLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom className="dark:text-white">
        Notifications
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          className="dark:border-white dark:bg-gray-800 dark:text-white"
        >
          <Tab className="dark:text-white" label="Notifications" />
          <Tab className="dark:text-white" label="Preferences" />
        </Tabs>
      </Paper>

      <Box sx={{ mt: 2 }}>
        {tabValue === 0 && (
          <NotificationList notifications={notificationsData} />
        )}
        {tabValue === 1 && (
          <NotificationPreferences
            preferences={preferencesData}
            refetch={() => {
              // Refetch both queries
              refetchNotifications();
              refetchPreferences();
            }}
          />
        )}
      </Box>
    </Container>
  );
};

export default NotificationsPage;
