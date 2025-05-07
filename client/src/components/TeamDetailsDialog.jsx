import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Snackbar,
  Alert,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import { 
  useGetCurrentUserQuery, 
  useGetTeamByIdQuery,
  useGetTeamInviteCodeQuery,
  useCreateTeamInviteMutation
} from '../redux/services/api';

const TeamDetailsDialog = ({ open, onClose, teamId }) => {
  const { data: currentUser } = useGetCurrentUserQuery();
  const { data: team, isLoading } = useGetTeamByIdQuery(teamId, { skip: !teamId });
  const { data: inviteCodeData, refetch: refetchInviteCode } = useGetTeamInviteCodeQuery(teamId, {
    skip: !teamId || !open
  });
  const [createTeamInvite] = useCreateTeamInviteMutation();

  const [openInviteDialog, setOpenInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleInvite = async () => {
    try {
      await createTeamInvite({ teamId, email: inviteEmail }).unwrap();
      setInviteEmail('');
      setOpenInviteDialog(false);
      setSnackbar({
        open: true,
        message: 'Invitation sent successfully!',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.data?.message || 'Failed to send invite',
        severity: 'error'
      });
    }
  };

  const copyInviteCode = () => {
    if (inviteCodeData?.inviteCode) {
      navigator.clipboard.writeText(inviteCodeData.inviteCode);
      setSnackbar({
        open: true,
        message: 'Invite code copied to clipboard!',
        severity: 'success'
      });
    }
  };

  if (isLoading) return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogContent>
        <Box display="flex" justifyContent="center" p={3}>
          <Typography>Loading...</Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );

  if (!team) return null;

  const isAdmin = team.members.some(member => 
    member.user.id === currentUser?.id && ['ADMIN', 'MANAGER'].includes(member.role)
  );

  console.log("team.members", team.members);

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          className: "dark:bg-dark-secondary",
        }}
      >
        <DialogTitle className="dark:bg-dark-secondary">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" className="dark:text-white">{team.name}</Typography>
            <IconButton onClick={onClose} className="dark:text-white">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent className="dark:bg-dark-secondary">
          <Box mb={3}>
            <Typography variant="body1" className="dark:text-gray-300">
              {team.description}
            </Typography>

            {isAdmin && (
              <Box mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    refetchInviteCode();
                    setOpenInviteDialog(true);
                  }}
                  className="dark:bg-primary dark:text-white"
                >
                  Invite Members
                </Button>
              </Box>
            )}
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom className="dark:text-white">
                Team Members
              </Typography>
              <TableContainer component={Paper} className="dark:bg-dark-tertiary">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell className="dark:text-white dark:border-gray-700">Name</TableCell>
                      <TableCell className="dark:text-white dark:border-gray-700">Email</TableCell>
                      <TableCell className="dark:text-white dark:border-gray-700">Role</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {team.members.map((member) => (
                      <TableRow key={member.id} className="dark:border-gray-700">
                        <TableCell className="dark:text-gray-300">{member.user.name}</TableCell>
                        <TableCell className="dark:text-gray-300">{member.user.email}</TableCell>
                        <TableCell className="dark:text-gray-300">{member.role}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom className="dark:text-white">
                Projects
              </Typography>
              <TableContainer component={Paper} className="dark:bg-dark-tertiary">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell className="dark:text-white dark:border-gray-700">Name</TableCell>
                      <TableCell className="dark:text-white dark:border-gray-700">Owner</TableCell>
                      <TableCell className="dark:text-white dark:border-gray-700">Manager</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {team.projects.map((project) => (
                      <TableRow key={project.id} className="dark:border-gray-700">
                        <TableCell className="dark:text-gray-300">{project.name}</TableCell>
                        <TableCell className="dark:text-gray-300">{project.owner.name}</TableCell>
                        <TableCell className="dark:text-gray-300">{project.manager?.name || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className="dark:bg-dark-secondary">
          <Button onClick={onClose} className="dark:text-gray-300">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={openInviteDialog} 
        onClose={() => setOpenInviteDialog(false)}
        PaperProps={{
          className: "dark:bg-dark-secondary"
        }}
      >
        <DialogTitle className="dark:text-white">Invite Team Members</DialogTitle>
        <DialogContent className="dark:bg-dark-secondary">
          {inviteCodeData?.inviteCode && (
            <Box mb={3}>
              <Typography variant="subtitle1" gutterBottom className="dark:text-white">
                Share this invite code:
              </Typography>
              <Box display="flex" alignItems="center">
                <TextField
                  fullWidth
                  value={inviteCodeData.inviteCode}
                  InputProps={{ 
                    readOnly: true,
                    className: "dark:text-white dark:border-gray-600"
                  }}
                  className="dark:text-white"
                />
                <IconButton onClick={copyInviteCode} className="dark:text-gray-300">
                  <ContentCopyIcon />
                </IconButton>
              </Box>
            </Box>
          )}
          <Typography variant="subtitle1" gutterBottom className="dark:text-white">
            Or invite by email:
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="dark:text-white"
            InputLabelProps={{
              className: "dark:text-gray-300"
            }}
            InputProps={{
              className: "dark:text-white dark:border-gray-600"
            }}
          />
        </DialogContent>
        <DialogActions className="dark:bg-dark-secondary">
          <Button onClick={() => setOpenInviteDialog(false)} className="dark:text-gray-300">
            Cancel
          </Button>
          <Button 
            onClick={handleInvite} 
            color="primary"
            variant="contained"
            className="dark:bg-primary dark:text-white"
          >
            Send Invite
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TeamDetailsDialog; 