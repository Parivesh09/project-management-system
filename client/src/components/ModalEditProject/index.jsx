import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
} from '@mui/material';
import { useUpdateProjectMutation, useGetTeamsQuery } from '../../redux/services/api';
import { formatISO } from 'date-fns';

const ModalEditProject = ({ isOpen, onClose, project }) => {
  const [updateProject, { isLoading }] = useUpdateProjectMutation();
  const { data: teams } = useGetTeamsQuery();
  const [error, setError] = useState('');
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    teamIds: [],
  });

  useEffect(() => {
    if (project) {
      setProjectData({
        name: project.name || '',
        description: project.description || '',
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
        endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
        teamIds: project.teams?.map(team => team.id) || [],
      });
    }
  }, [project]);

  const handleSubmit = async () => {
    try {
      setError('');
      if (!projectData.name) {
        setError('Project name is required');
        return;
      }

      const formattedProject = {
        id: project.id,
        name: projectData.name,
        description: projectData.description,
        startDate: projectData.startDate ? formatISO(new Date(projectData.startDate)) : undefined,
        endDate: projectData.endDate ? formatISO(new Date(projectData.endDate)) : undefined,
        teamIds: projectData.teamIds,
      };

      await updateProject(formattedProject).unwrap();
      onClose();
    } catch (error) {
      console.error('Failed to update project:', error);
      setError(error.data?.message || 'Failed to update project');
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Project</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Project Name"
            fullWidth
            value={projectData.name}
            onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
            error={!!error}
            helperText={error}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={projectData.description}
            onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Start Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={projectData.startDate}
            onChange={(e) => setProjectData({ ...projectData, startDate: e.target.value })}
          />
          <TextField
            margin="dense"
            label="End Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={projectData.endDate}
            onChange={(e) => setProjectData({ ...projectData, endDate: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Teams</InputLabel>
            <Select
              multiple
              value={projectData.teamIds}
              onChange={(e) => setProjectData({ ...projectData, teamIds: e.target.value })}
              label="Teams"
            >
              {teams?.map((team) => (
                <MenuItem key={team.id} value={team.id}>
                  {team.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalEditProject; 