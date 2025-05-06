import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useGetUsersQuery, useCreateTeamInviteMutation, useUpdateTeamMutation } from '../../redux/services/api';

const TeamManagementModal = ({ team, onClose }) => {
  const { data: users } = useGetUsersQuery();
  const [createTeamInvite] = useCreateTeamInviteMutation();
  const [updateTeam] = useUpdateTeamMutation();
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('USER');

  const handleInviteMember = async () => {
    try {
      await createTeamInvite({
        teamId: team.id,
        email: inviteEmail,
        role: selectedRole,
      }).unwrap();
      setInviteEmail('');
      setSelectedRole('USER');
    } catch (error) {
      console.error('Failed to invite member:', error);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await updateTeam({
        id: team.id,
        members: team.members.filter((m) => m.id !== memberId),
      }).unwrap();
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Manage Team: {team.name}</DialogTitle>
      <DialogContent>
        <div className="mb-4">
          <h3 className="mb-2 text-lg font-semibold">Current Members</h3>
          <List>
            {team.members?.map((member) => (
              <ListItem key={member.id}>
                <ListItemText
                  primary={member.user.name}
                  secondary={`${member.user.email} - ${member.role}`}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </div>

        <div className="mt-4">
          <h3 className="mb-2 text-lg font-semibold">Invite New Member</h3>
          <div className="flex gap-2">
            <TextField
              label="Email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              fullWidth
            />
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                label="Role"
              >
                <MenuItem value="USER">User</MenuItem>
                <MenuItem value="MANAGER">Manager</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              color="primary"
              onClick={handleInviteMember}
              disabled={!inviteEmail}
            >
              Invite
            </Button>
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeamManagementModal; 