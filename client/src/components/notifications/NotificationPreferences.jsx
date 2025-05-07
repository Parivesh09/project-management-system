import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Switch,
  FormGroup,
  FormControlLabel,
  Divider,
  Box,
  Button,
  Alert,
} from '@mui/material';
import { useUpdateNotificationPreferencesMutation } from '../../redux/api/notificationApi';

const NotificationPreferences = ({ preferences, refetch }) => {
  const [localPreferences, setLocalPreferences] = useState({
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
  });

  const [updatePreferences, { isLoading, isSuccess, isError }] = useUpdateNotificationPreferencesMutation();

  useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  }, [preferences]);

  const handleToggle = (category, type) => {
    setLocalPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [type]: !prev[category][type],
      },
    }));
  };

  const handleSave = async () => {
    try {
      await updatePreferences(localPreferences).unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  return (
    <Card className="dark:bg-gray-800 dark:text-white">
      <CardContent>
        <Typography className="dark:text-white" variant="h6" gutterBottom>
          Notification Preferences
        </Typography>

        {/* Email Notifications */}
        <Box mb={3}>
          <Typography className="dark:text-white" variant="subtitle1" gutterBottom>
            Email Notifications
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={localPreferences.email?.enabled}
                  onChange={() => handleToggle('email', 'enabled')}
                />
              }
              label="Enable Email Notifications"
            />
            {localPreferences.email?.enabled && (
              <>
                <FormControlLabel
                  control={
                    <Switch
                      checked={localPreferences.email?.taskAssigned}
                      onChange={() => handleToggle('email', 'taskAssigned')}
                    />
                  }
                  label="Task Assigned"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={localPreferences.email?.taskUpdated}
                      onChange={() => handleToggle('email', 'taskUpdated')}
                    />
                  }
                  label="Task Updated"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={localPreferences.email?.taskCompleted}
                      onChange={() => handleToggle('email', 'taskCompleted')}
                    />
                  }
                  label="Task Completed"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={localPreferences.email?.taskCommented}
                      onChange={() => handleToggle('email', 'taskCommented')}
                    />
                  }
                  label="Task Comments"
                />
              </>
            )}
          </FormGroup>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* In-App Notifications */}
        <Box mb={3}>
          <Typography className="dark:text-white" variant="subtitle1" gutterBottom>
            In-App Notifications
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={localPreferences.inApp?.enabled}
                  onChange={() => handleToggle('inApp', 'enabled')}
                />
              }
              label="Enable In-App Notifications"
            />
            {localPreferences.inApp?.enabled && (
              <>
                <FormControlLabel
                  control={
                    <Switch
                      checked={localPreferences.inApp?.taskAssigned}
                      onChange={() => handleToggle('inApp', 'taskAssigned')}
                    />
                  }
                  label="Task Assigned"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={localPreferences.inApp?.taskUpdated}
                      onChange={() => handleToggle('inApp', 'taskUpdated')}
                    />
                  }
                  label="Task Updated"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={localPreferences.inApp?.taskCompleted}
                      onChange={() => handleToggle('inApp', 'taskCompleted')}
                    />
                  }
                  label="Task Completed"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={localPreferences.inApp?.taskCommented}
                      onChange={() => handleToggle('inApp', 'taskCommented')}
                    />
                  }
                  label="Task Comments"
                />
              </>
            )}
          </FormGroup>
        </Box>

        {isSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Preferences updated successfully
          </Alert>
        )}

        {isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to update preferences
          </Alert>
        )}

        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={isLoading}
        >
          Save Preferences
        </Button>
      </CardContent>
    </Card>
  );
};

export default NotificationPreferences; 