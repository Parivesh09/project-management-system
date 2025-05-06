import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { useGetCurrentUserQuery, useUpdateUserMutation } from '../redux/services/api';

const UserSettings = () => {
  const { data: currentUser, isLoading } = useGetCurrentUserQuery();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    smtpHost: '',
    smtpPort: '',
    smtpSecure: true,
    smtpUser: '',
    smtpPass: '',
    smtpFrom: '',
    useCustomEmail: false,
    notificationPref: 'IN_APP'
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Initialize form data when user data is loaded
  React.useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name: currentUser.name || '',
        email: currentUser.email || '',
        smtpHost: currentUser.smtpHost || '',
        smtpPort: currentUser.smtpPort || '',
        smtpSecure: currentUser.smtpSecure || true,
        smtpUser: currentUser.smtpUser || '',
        smtpFrom: currentUser.smtpFrom || '',
        useCustomEmail: currentUser.useCustomEmail || false,
        notificationPref: currentUser.notificationPref || 'IN_APP'
      }));
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: e.target.type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await updateUser(formData).unwrap();
      setSuccess('Settings updated successfully!');
    } catch (err) {
      setError(err.data?.message || 'Failed to update settings');
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Paper className="dark:bg-dark-secondary p-6">
        <Typography variant="h5" gutterBottom className="dark:text-white">
          User Settings
        </Typography>

        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" className="mb-4">
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Profile Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom className="dark:text-white">
                Profile Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="dark:text-white"
                    InputLabelProps={{
                      className: "dark:text-gray-300"
                    }}
                    InputProps={{
                      className: "dark:text-white dark:border-gray-600"
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="dark:text-white"
                    InputLabelProps={{
                      className: "dark:text-gray-300"
                    }}
                    InputProps={{
                      className: "dark:text-white dark:border-gray-600"
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Divider className="dark:border-gray-600" />
            </Grid>

            {/* Email Settings Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom className="dark:text-white">
                Email Settings
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.useCustomEmail}
                    onChange={handleChange}
                    name="useCustomEmail"
                    className="dark:text-white"
                  />
                }
                label="Use my email to send invitations"
                className="dark:text-white mb-4 block"
              />

              {formData.useCustomEmail && (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="SMTP Host"
                      name="smtpHost"
                      value={formData.smtpHost}
                      onChange={handleChange}
                      className="dark:text-white"
                      InputLabelProps={{
                        className: "dark:text-gray-300"
                      }}
                      InputProps={{
                        className: "dark:text-white dark:border-gray-600"
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="SMTP Port"
                      name="smtpPort"
                      value={formData.smtpPort}
                      onChange={handleChange}
                      className="dark:text-white"
                      InputLabelProps={{
                        className: "dark:text-gray-300"
                      }}
                      InputProps={{
                        className: "dark:text-white dark:border-gray-600"
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="SMTP Username"
                      name="smtpUser"
                      value={formData.smtpUser}
                      onChange={handleChange}
                      className="dark:text-white"
                      InputLabelProps={{
                        className: "dark:text-gray-300"
                      }}
                      InputProps={{
                        className: "dark:text-white dark:border-gray-600"
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="SMTP Password"
                      name="smtpPass"
                      type="password"
                      value={formData.smtpPass}
                      onChange={handleChange}
                      className="dark:text-white"
                      InputLabelProps={{
                        className: "dark:text-gray-300"
                      }}
                      InputProps={{
                        className: "dark:text-white dark:border-gray-600"
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="From Email Address"
                      name="smtpFrom"
                      value={formData.smtpFrom}
                      onChange={handleChange}
                      helperText="The email address that will appear in the 'From' field"
                      className="dark:text-white"
                      InputLabelProps={{
                        className: "dark:text-gray-300"
                      }}
                      InputProps={{
                        className: "dark:text-white dark:border-gray-600"
                      }}
                      FormHelperTextProps={{
                        className: "dark:text-gray-400"
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.smtpSecure}
                          onChange={handleChange}
                          name="smtpSecure"
                          className="dark:text-white"
                        />
                      }
                      label="Use Secure Connection (SSL/TLS)"
                      className="dark:text-white"
                    />
                  </Grid>
                </Grid>
              )}
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isUpdating}
                className="dark:bg-primary dark:text-white"
              >
                {isUpdating ? <CircularProgress size={24} /> : 'Save Settings'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default UserSettings; 