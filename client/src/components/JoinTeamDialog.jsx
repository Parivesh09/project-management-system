import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Alert,
  Box,
  CircularProgress
} from '@mui/material';
import { useAcceptTeamInviteMutation } from '../redux/services/api';

const JoinTeamDialog = ({ open, onClose }) => {
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [acceptTeamInvite, { isLoading }] = useAcceptTeamInviteMutation();

  const handleJoinTeam = async () => {
    try {
      setError('');
      if (!inviteCode) {
        setError('Please enter an invite code');
        return;
      }

      await acceptTeamInvite(inviteCode).unwrap();
      setInviteCode('');
      onClose();
    } catch (error) {
      console.error('Failed to join team:', error);
      setError(error.data?.error || 'Failed to join team. Please check your invite code.');
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        className: "dark:bg-dark-secondary"
      }}
    >
      <DialogTitle className="dark:text-white">Join a Team</DialogTitle>
      <DialogContent className="dark:bg-dark-secondary">
        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}
        
        <Box mb={3}>
          <Typography variant="body1" gutterBottom className="dark:text-white">
            Enter the team invite code to join:
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Invite Code"
            fullWidth
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            className="dark:text-white"
            InputLabelProps={{
              className: "dark:text-gray-300"
            }}
            InputProps={{
              className: "dark:text-white dark:border-gray-600"
            }}
          />
        </Box>

        <Typography variant="body2" color="textSecondary" className="dark:text-gray-400">
          Note: If you received an email invitation, you can find the invite code in the email.
        </Typography>
      </DialogContent>
      <DialogActions className="dark:bg-dark-secondary">
        <Button onClick={onClose} className="dark:text-gray-300">
          Cancel
        </Button>
        <Button
          onClick={handleJoinTeam}
          variant="contained"
          color="primary"
          disabled={isLoading || !inviteCode}
          className="dark:bg-primary dark:text-white disabled:dark:bg-gray-600 disabled:dark:text-gray-400"
        >
          {isLoading ? <CircularProgress size={24} /> : 'Join Team'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JoinTeamDialog; 