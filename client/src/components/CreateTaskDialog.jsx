import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  OutlinedInput,
} from '@mui/material';
import { useGetProjectsQuery, useGetTeamsQuery, useCreateTaskMutation } from '../redux/services/api';

const CreateTaskDialog = ({ open, onClose, currentUser }) => {
  const [createTask] = useCreateTaskMutation();
  const { data: projects } = useGetProjectsQuery();
  const { data: teams } = useGetTeamsQuery();
  const [error, setError] = useState('');
  
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '',
    projectId: '',
    assigneeId: '',
    isRecurring: false,
    frequency: '',
  });

  const [selectedTeam, setSelectedTeam] = useState('');
  const [availableAssignees, setAvailableAssignees] = useState([]);

  useEffect(() => {
    if (selectedTeam && teams) {
      const team = teams.find(t => t.id === selectedTeam);
      if (team) {
        setAvailableAssignees(team.members.map(member => member.user));
      }
    } else {
      setAvailableAssignees([currentUser]); // Default to just the current user
    }
  }, [selectedTeam, teams, currentUser]);

  const handleSubmit = async () => {
    try {
      setError('');
      if (!taskData.title) {
        setError('Task title is required');
        return;
      }

      const formattedTask = {
        ...taskData,
        creatorId: currentUser.id,
        dueDate: new Date(taskData.dueDate).toISOString(),
      };

      await createTask(formattedTask).unwrap();
      onClose();
      setTaskData({
        title: '',
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: '',
        projectId: '',
        assigneeId: '',
        isRecurring: false,
        frequency: '',
      });
    } catch (error) {
      console.error('Failed to create task:', error);
      setError(error.data?.message || 'Failed to create task');
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        className: "dark:bg-dark-secondary"
      }}
    >
      <DialogTitle className="dark:text-white">Create New Task</DialogTitle>
      <DialogContent className="dark:bg-dark-secondary">
        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}
        
        <TextField
          autoFocus
          margin="dense"
          label="Task Title"
          fullWidth
          required
          value={taskData.title}
          onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
          className="dark:text-white"
          InputLabelProps={{
            className: "dark:text-gray-300"
          }}
          InputProps={{
            className: "dark:text-white dark:border-gray-600"
          }}
        />

        <TextField
          margin="dense"
          label="Description"
          fullWidth
          multiline
          rows={4}
          value={taskData.description}
          onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
          className="dark:text-white"
          InputLabelProps={{
            className: "dark:text-gray-300"
          }}
          InputProps={{
            className: "dark:text-white dark:border-gray-600"
          }}
        />

        <FormControl fullWidth margin="dense">
          <InputLabel className="dark:text-gray-300">Status</InputLabel>
          <Select
            value={taskData.status}
            onChange={(e) => setTaskData({ ...taskData, status: e.target.value })}
            label="Status"
            className="dark:text-white"
            input={
              <OutlinedInput
                label="Status"
                className="dark:border-gray-600 dark:text-white"
              />
            }
            MenuProps={{
              PaperProps: {
                className: "dark:bg-dark-secondary"
              }
            }}
          >
            <MenuItem value="TODO" className="dark:text-white dark:hover:bg-dark-tertiary">To Do</MenuItem>
            <MenuItem value="IN_PROGRESS" className="dark:text-white dark:hover:bg-dark-tertiary">In Progress</MenuItem>
            <MenuItem value="DONE" className="dark:text-white dark:hover:bg-dark-tertiary">Done</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth margin="dense">
          <InputLabel className="dark:text-gray-300">Priority</InputLabel>
          <Select
            value={taskData.priority}
            onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
            label="Priority"
            className="dark:text-white"
            input={
              <OutlinedInput
                label="Priority"
                className="dark:border-gray-600 dark:text-white"
              />
            }
            MenuProps={{
              PaperProps: {
                className: "dark:bg-dark-secondary"
              }
            }}
          >
            <MenuItem value="LOW" className="dark:text-white dark:hover:bg-dark-tertiary">Low</MenuItem>
            <MenuItem value="MEDIUM" className="dark:text-white dark:hover:bg-dark-tertiary">Medium</MenuItem>
            <MenuItem value="HIGH" className="dark:text-white dark:hover:bg-dark-tertiary">High</MenuItem>
          </Select>
        </FormControl>

        <TextField
          margin="dense"
          label="Due Date"
          type="datetime-local"
          fullWidth
          InputLabelProps={{ 
            shrink: true,
            className: "dark:text-gray-300"
          }}
          value={taskData.dueDate}
          onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
          className="dark:text-white"
          InputProps={{
            className: "dark:text-white dark:border-gray-600"
          }}
        />

        <FormControl fullWidth margin="dense">
          <InputLabel className="dark:text-gray-300">Project (Optional)</InputLabel>
          <Select
            value={taskData.projectId}
            onChange={(e) => {
              const project = projects?.find(p => p.id === e.target.value);
              setTaskData({ ...taskData, projectId: e.target.value });
              if (project) {
                const projectTeams = project.teams || [];
                if (projectTeams.length === 1) {
                  setSelectedTeam(projectTeams[0].id);
                }
              }
            }}
            label="Project (Optional)"
            className="dark:text-white"
            input={
              <OutlinedInput
                label="Project (Optional)"
                className="dark:border-gray-600 dark:text-white"
              />
            }
            MenuProps={{
              PaperProps: {
                className: "dark:bg-dark-secondary"
              }
            }}
          >
            <MenuItem value="" className="dark:text-white dark:hover:bg-dark-tertiary">No Project</MenuItem>
            {projects?.map((project) => (
              <MenuItem 
                key={project.id} 
                value={project.id}
                className="dark:text-white dark:hover:bg-dark-tertiary"
              >
                {project.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="dense">
          <InputLabel className="dark:text-gray-300">Team (Optional)</InputLabel>
          <Select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            label="Team (Optional)"
            className="dark:text-white"
            input={
              <OutlinedInput
                label="Team (Optional)"
                className="dark:border-gray-600 dark:text-white"
              />
            }
            MenuProps={{
              PaperProps: {
                className: "dark:bg-dark-secondary"
              }
            }}
          >
            <MenuItem value="" className="dark:text-white dark:hover:bg-dark-tertiary">No Team</MenuItem>
            {teams?.map((team) => (
              <MenuItem 
                key={team.id} 
                value={team.id}
                className="dark:text-white dark:hover:bg-dark-tertiary"
              >
                {team.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="dense">
          <InputLabel className="dark:text-gray-300">Assignee</InputLabel>
          <Select
            value={taskData.assigneeId}
            onChange={(e) => setTaskData({ ...taskData, assigneeId: e.target.value })}
            label="Assignee"
            className="dark:text-white"
            input={
              <OutlinedInput
                label="Assignee"
                className="dark:border-gray-600 dark:text-white"
              />
            }
            MenuProps={{
              PaperProps: {
                className: "dark:bg-dark-secondary"
              }
            }}
          >
            <MenuItem value={currentUser.id} className="dark:text-white dark:hover:bg-dark-tertiary">Me</MenuItem>
            {availableAssignees
              .filter(user => user.id !== currentUser.id)
              .map((user) => (
                <MenuItem 
                  key={user.id} 
                  value={user.id}
                  className="dark:text-white dark:hover:bg-dark-tertiary"
                >
                  {user.name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Switch
              checked={taskData.isRecurring}
              onChange={(e) => setTaskData({ ...taskData, isRecurring: e.target.checked })}
              className="dark:text-white"
            />
          }
          label="Recurring Task"
          className="dark:text-white"
        />

        {taskData.isRecurring && (
          <FormControl fullWidth margin="dense">
            <InputLabel className="dark:text-gray-300">Frequency</InputLabel>
            <Select
              value={taskData.frequency}
              onChange={(e) => setTaskData({ ...taskData, frequency: e.target.value })}
              label="Frequency"
              className="dark:text-white"
              input={
                <OutlinedInput
                  label="Frequency"
                  className="dark:border-gray-600 dark:text-white"
                />
              }
              MenuProps={{
                PaperProps: {
                  className: "dark:bg-dark-secondary"
                }
              }}
            >
              <MenuItem value="DAILY" className="dark:text-white dark:hover:bg-dark-tertiary">Daily</MenuItem>
              <MenuItem value="WEEKLY" className="dark:text-white dark:hover:bg-dark-tertiary">Weekly</MenuItem>
              <MenuItem value="MONTHLY" className="dark:text-white dark:hover:bg-dark-tertiary">Monthly</MenuItem>
            </Select>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions className="dark:bg-dark-secondary">
        <Button onClick={onClose} className="dark:text-gray-300">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          className="dark:bg-primary dark:text-white disabled:dark:bg-gray-600 disabled:dark:text-gray-400"
        >
          Create Task
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTaskDialog; 