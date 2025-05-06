'use client';

import React, { useState, useMemo } from 'react';
import {
  useGetProjectsQuery,
  useGetTeamsQuery,
  useCreateProjectMutation,
  useGetCurrentUserQuery,
} from '../../redux/services/api';
import Header from '../../components/Header';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
} from '@mui/x-data-grid';
import AddBoxIcon from '@mui/icons-material/AddBox';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { dataGridClassNames, dataGridSxStyles } from '../../lib/utils';
import { useAppSelector } from '../redux';
import Loader from '../../components/Loader';

const CustomToolbar = () => (
  <GridToolbarContainer className="toolbar flex gap-2">
    <GridToolbarFilterButton />
    <GridToolbarExport />
  </GridToolbarContainer>
);

const ProjectsPage = () => {
  const { data: projects, isLoading: isLoadingProjects } = useGetProjectsQuery();
  const { data: teams, isLoading: isLoadingTeams } = useGetTeamsQuery();
  const { data: currentUser } = useGetCurrentUserQuery();
  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    teamId: '',
    managerId: ''
  });

  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  // Get team admins and managers for the selected team
  const selectedTeamAdmins = useMemo(() => {
    if (!teams || !newProject.teamId) return [];
    const selectedTeam = teams.find(team => team.id === newProject.teamId);
    if (!selectedTeam) return [];
    
    return selectedTeam.members
      .filter(member => ['ADMIN', 'MANAGER'].includes(member.role))
      .map(member => member.user);
  }, [teams, newProject.teamId]);

  const columns = [
    { field: 'name', headerName: 'Project Name', width: 200 },
    { field: 'description', headerName: 'Description', width: 300 },
    {
      field: 'startDate',
      headerName: 'Start Date',
      width: 150,
      renderCell: (params) => {
        if (!params.row.startDate) return 'Not set';
        return new Date(params.row.startDate).toLocaleDateString();
      }
    },
    {
      field: 'endDate',
      headerName: 'End Date',
      width: 150,
      renderCell: (params) => {
        if (!params.row.endDate) return 'Not set';
        return new Date(params.row.endDate).toLocaleDateString();
      }
    },
    {
      field: 'teams',
      headerName: 'Teams',
      width: 200,
      renderCell: (params) => {
        const teams = params.row.teams || [];
        return (
          <div className="flex gap-1">
            <span>{teams.length > 0 ? teams.map(t => t.name).join(', ') : 'No Team'}</span>
          </div>
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => handleProjectClick(params.row)}
        >
          View Details
        </Button>
      ),
    },
  ];

  const handleCreateProject = async () => {
    try {
      if (!currentUser?.id) {
        throw new Error('No user logged in');
      }

      const formattedProject = {
        name: newProject.name,
        description: newProject.description,
        startDate: newProject.startDate || undefined,
        endDate: newProject.endDate || undefined,
        ownerId: currentUser.id,
        managerId: newProject.managerId || undefined,
        teamIds: newProject.teamId ? [newProject.teamId] : []
      };
      await createProject(formattedProject).unwrap();
      setIsCreateModalOpen(false);
      setNewProject({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        teamId: '',
        managerId: ''
      });
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleProjectClick = (project) => {
    // Navigate to project details page
    window.location.href = `/projects/${project.id}`;
  };

  if (isLoadingProjects) {
    return <Loader fullScreen />;
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <Header name="Projects" />
        <Button
          variant="contained"
          color="primary"
          className="bg-primary text-white font-bold w-full max-w-max"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <div className="flex items-center gap-2">
            <AddBoxIcon />
            New Project
          </div>
        </Button>
      </div>

      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={projects || []}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          className={dataGridClassNames}
          sx={dataGridSxStyles(isDarkMode)}
          components={{
            Toolbar: CustomToolbar,
          }}
        />
      </div>

      {/* Create Project Modal */}
      <Dialog 
        open={isCreateModalOpen} 
        onClose={() => !isCreating && setIsCreateModalOpen(false)}
      >
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Project Name"
            fullWidth
            value={newProject.name}
            onChange={(e) =>
              setNewProject({ ...newProject, name: e.target.value })
            }
            disabled={isCreating}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={newProject.description}
            onChange={(e) =>
              setNewProject({ ...newProject, description: e.target.value })
            }
            disabled={isCreating}
          />
          <TextField
            margin="dense"
            label="Start Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newProject.startDate}
            onChange={(e) =>
              setNewProject({ ...newProject, startDate: e.target.value })
            }
            disabled={isCreating}
          />
          <TextField
            margin="dense"
            label="End Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newProject.endDate}
            onChange={(e) =>
              setNewProject({ ...newProject, endDate: e.target.value })
            }
            disabled={isCreating}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Team</InputLabel>
            <Select
              value={newProject.teamId}
              onChange={(e) => {
                setNewProject({ 
                  ...newProject, 
                  teamId: e.target.value,
                  managerId: '' // Reset manager when team changes
                });
              }}
              label="Team"
              disabled={isCreating || isLoadingTeams}
            >
              {teams?.map((team) => (
                <MenuItem key={team.id} value={team.id}>
                  {team.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Manager Selection - Only show if team is selected */}
          {newProject.teamId && selectedTeamAdmins.length > 0 && (
            <FormControl fullWidth margin="dense">
              <InputLabel>Project Manager</InputLabel>
              <Select
                value={newProject.managerId}
                onChange={(e) =>
                  setNewProject({ ...newProject, managerId: e.target.value })
                }
                label="Project Manager"
                disabled={isCreating}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {selectedTeamAdmins.map((admin) => (
                  <MenuItem key={admin.id} value={admin.id}>
                    {admin.name} ({admin.role})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {isCreating && (
            <div className="mt-4">
              <Loader />
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setIsCreateModalOpen(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateProject} 
            variant="contained" 
            color="primary"
            disabled={isCreating}
          >
            {isCreating ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProjectsPage; 