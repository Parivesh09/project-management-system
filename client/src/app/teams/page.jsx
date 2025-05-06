"use client";
import {
  useGetCurrentUserQuery,
  useGetTeamsQuery,
  useCreateTeamMutation,
  useGetUsersQuery,
  useGetProjectsQuery,
  useDeleteTeamMutation,
  useUpdateTeamMutation,
} from "../../redux/services/api";
import React, { useState } from "react";
import { useAppSelector } from "../redux";
import Header from "../../components/Header";
import TeamDetailsDialog from "../../components/TeamDetailsDialog";
import JoinTeamDialog from "../../components/JoinTeamDialog";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
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
  Chip,
  Box,
  OutlinedInput,
  Typography,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import InfoIcon from "@mui/icons-material/Info";
import { dataGridClassNames, dataGridSxStyles } from "../../lib/utils";

const CustomToolbar = () => (
  <GridToolbarContainer className="toolbar flex gap-2">
    <GridToolbarFilterButton />
    <GridToolbarExport />
  </GridToolbarContainer>
);

const TeamsPage = () => {
  const { data: teams, isLoading } = useGetTeamsQuery();
  const { data: users } = useGetUsersQuery();
  const { data: projects } = useGetProjectsQuery();
  const { data: currentUser } = useGetCurrentUserQuery();
  const [createTeam] = useCreateTeamMutation();
  const [updateTeam] = useUpdateTeamMutation();
  const [deleteTeam] = useDeleteTeamMutation();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isJoinTeamModalOpen, setIsJoinTeamModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [error, setError] = useState("");

  const [newTeam, setNewTeam] = useState({
    name: "",
    description: "",
    memberIds: [],
    projectIds: [],
  });

  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const handleCreateTeam = async () => {
    try {
      setError("");
      if (!newTeam.name) {
        setError("Team name is required");
        return;
      }

      await createTeam({
        name: newTeam.name,
        description: newTeam.description,
        memberIds: newTeam.memberIds,
        projectIds: newTeam.projectIds,
      }).unwrap();

      setIsCreateModalOpen(false);
      setNewTeam({ name: "", description: "", memberIds: [], projectIds: [] });
    } catch (error) {
      console.error("Failed to create team:", error);
      setError(error.data?.message || "Failed to create team");
    }
  };

  const handleUpdateTeam = async () => {
    try {
      setError("");
      if (!selectedTeam.name) {
        setError("Team name is required");
        return;
      }

      await updateTeam({
        id: selectedTeam.id,
        name: selectedTeam.name,
        description: selectedTeam.description,
        members: selectedTeam.members,
        projectIds: selectedTeam.projectIds,
      }).unwrap();

      setIsEditModalOpen(false);
      setSelectedTeam(null);
    } catch (error) {
      console.error("Failed to update team:", error);
      setError(error.data?.message || "Failed to update team");
    }
  };

  const handleDeleteTeam = async (teamId) => {
    try {
      await deleteTeam(teamId).unwrap();
    } catch (error) {
      console.error("Failed to delete team:", error);
      setError(error.data?.message || "Failed to delete team");
    }
  };

  const handleRowClick = (params) => {
    setSelectedTeam(params.row);
    setIsDetailsModalOpen(true);
  };

  const columns = [
    { field: "name", headerName: "Team Name", width: 200 },
    { field: "description", headerName: "Description", width: 300 },
    {
      field: "members",
      headerName: "Members",
      width: 200,
      renderCell: (params) => {
        const members = params.row.members || [];
        return (
          <div className="flex gap-1">
            {members.length > 0 ? (
              <Tooltip title={members.map((m) => m.user.name).join(", ")}>
                <span>{members.length}</span>
                {/* <InfoIcon fontSize="small" /> */}
              </Tooltip>
            ) : (
              <span>0</span>
            )}
          </div>
        );
      },
    },
    {
      field: "projects",
      headerName: "Projects",
      width: 200,
      renderCell: (params) => {
        const projects = params.row.projects || [];
        return (
          <div className="flex gap-1">
            {projects.length > 0 ? (
              <Tooltip title={projects.map((p) => p.name).join(", ")}>
                <span>{projects.length}</span>
                {/* <InfoIcon fontSize="small" /> */}
              </Tooltip>
            ) : (
              <span>0</span>
            )}
          </div>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => (
        <div className="flex gap-2">
          <IconButton
            color="primary"
            size="small"
            onClick={(e) => {
              e.stopPropagation(); // Prevent row selection
              setSelectedTeam(params.row);
              setIsEditModalOpen(true);
            }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            size="small"
            onClick={(e) => {
              e.stopPropagation(); // Prevent row selection
              handleDeleteTeam(params.row.id);
            }}
          >
            <DeleteIcon />
          </IconButton>
        </div>
      ),
    },
  ];

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <Header name="Teams" />
        <div className="flex gap-2 w-full max-w-max">
          <Button
            variant="outlined"
            color="primary"
            className="w-full max-w-max font-bold"
            onClick={() => setIsJoinTeamModalOpen(true)}
          >
            <div className="flex items-center gap-2">
              <GroupAddIcon />
              Join Team
            </div>
          </Button>
          <Button
            variant="contained"
            color="primary"
            className="bg-primary w-full max-w-max font-bold text-white"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <div className="flex items-center gap-2">
              <PersonAddAltIcon />
              Create New Team
            </div>
          </Button>
        </div>
      </div>

      <div style={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={teams || []}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          className={dataGridClassNames}
          sx={dataGridSxStyles(isDarkMode)}
          components={{
            Toolbar: CustomToolbar,
          }}
          onRowClick={handleRowClick}
        />
      </div>

      {/* Team Details Dialog */}
      <TeamDetailsDialog
        open={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedTeam(null);
        }}
        teamId={selectedTeam?.id}
      />

      {/* Create Team Modal */}
      <Dialog
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        maxWidth="md"
        className="dark:text-white"
        fullWidth
        PaperProps={{
          className: "dark:bg-dark-secondary",
        }}
      >
        <DialogTitle className="dark:text-white">Create New Team</DialogTitle>
        <DialogContent className="dark:bg-dark-secondary">
          {error && (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Team Name"
            fullWidth
            required
            value={newTeam.name}
            onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
            className="dark:text-white"
            InputLabelProps={{
              className: "dark:text-gray-300",
            }}
            InputProps={{
              className: "dark:text-white dark:border-gray-600",
            }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={newTeam.description}
            onChange={(e) =>
              setNewTeam({ ...newTeam, description: e.target.value })
            }
            className="dark:text-white"
            InputLabelProps={{
              className: "dark:text-gray-300",
            }}
            InputProps={{
              className: "dark:text-white dark:border-gray-600",
            }}
          />

          {/* Member Selection Section */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" className="mb-1 dark:text-white">
              Team Members
            </Typography>

            {/* Show current user as admin */}
            {currentUser && (
              <Chip
                label={`${currentUser.name} (Admin)`}
                color="primary"
                sx={{ mb: 2 }}
                className="dark:border-gray-600"
              />
            )}

            <div className="mb-2 flex flex-wrap gap-2">
              {newTeam.memberIds.map((userId) => {
                const user = users?.find((u) => u.id === userId);
                return user ? (
                  <Chip
                    key={userId}
                    label={`${user.name} (Member)`}
                    onDelete={() => {
                      setNewTeam((prev) => ({
                        ...prev,
                        memberIds: prev.memberIds.filter((id) => id !== userId),
                      }));
                    }}
                    color="primary"
                    variant="outlined"
                    className="dark:border-gray-600 dark:text-white"
                  />
                ) : null;
              })}
            </div>
            <FormControl fullWidth>
              <InputLabel className="dark:text-gray-300">Add Member</InputLabel>
              <Select
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    setNewTeam((prev) => ({
                      ...prev,
                      memberIds: [...prev.memberIds, e.target.value],
                    }));
                  }
                }}
                input={
                  <OutlinedInput
                    label="Add Member"
                    className="dark:border-gray-600 dark:text-white"
                  />
                }
                className="dark:text-white"
                MenuProps={{
                  PaperProps: {
                    className: "dark:bg-dark-secondary",
                  },
                }}
              >
                {users
                  ?.filter(
                    (user) =>
                      user.id !== currentUser?.id && // Exclude current user
                      !newTeam.memberIds.includes(user.id), // Exclude already added users
                  )
                  .map((user) => (
                    <MenuItem
                      key={user.id}
                      value={user.id}
                      className="dark:text-white dark:hover:bg-dark-tertiary"
                    >
                      {user.name} ({user.email})
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Box>

          {/* Project Selection Section */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" className="mb-1 dark:text-white">
              Assign Projects (Optional)
            </Typography>
            <div className="mb-2 flex flex-wrap gap-2">
              {newTeam.projectIds.map((projectId) => {
                const project = projects?.find((p) => p.id === projectId);
                return project ? (
                  <Chip
                    key={projectId}
                    label={project.name}
                    onDelete={() => {
                      setNewTeam((prev) => ({
                        ...prev,
                        projectIds: prev.projectIds.filter(
                          (id) => id !== projectId,
                        ),
                      }));
                    }}
                    color="secondary"
                    variant="outlined"
                    className="dark:border-gray-600 dark:text-white"
                  />
                ) : null;
              })}
            </div>
            <FormControl fullWidth>
              <InputLabel className="dark:text-gray-300">
                Add Project
              </InputLabel>
              <Select
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    setNewTeam((prev) => ({
                      ...prev,
                      projectIds: [...prev.projectIds, e.target.value],
                    }));
                  }
                }}
                input={
                  <OutlinedInput
                    label="Add Project"
                    className="dark:border-gray-600 dark:text-white"
                  />
                }
                className="dark:text-white"
                MenuProps={{
                  PaperProps: {
                    className: "dark:bg-dark-secondary",
                  },
                }}
              >
                {projects
                  ?.filter(
                    (project) => !newTeam.projectIds.includes(project.id),
                  )
                  .map((project) => (
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
          </Box>
        </DialogContent>
        <DialogActions className="dark:bg-dark-secondary">
          <Button
            onClick={() => setIsCreateModalOpen(false)}
            className="dark:text-gray-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateTeam}
            variant="contained"
            color="primary"
            className="dark:bg-primary dark:text-white disabled:dark:bg-gray-600 disabled:dark:text-gray-400"
            disabled={!newTeam.name}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Team Modal */}
      <Dialog
        open={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTeam(null);
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          className: "dark:bg-dark-secondary",
        }}
      >
        <DialogTitle className="dark:text-white">Edit Team</DialogTitle>
        <DialogContent className="dark:bg-dark-secondary">
          {error && (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          )}
          {selectedTeam && (
            <>
              <TextField
                autoFocus
                margin="dense"
                label="Team Name"
                fullWidth
                required
                value={selectedTeam.name}
                onChange={(e) =>
                  setSelectedTeam({ ...selectedTeam, name: e.target.value })
                }
                className="dark:text-white"
                InputLabelProps={{
                  className: "dark:text-gray-300",
                }}
                InputProps={{
                  className: "dark:text-white dark:border-gray-600",
                }}
              />
              <TextField
                margin="dense"
                label="Description"
                fullWidth
                multiline
                rows={4}
                value={selectedTeam.description}
                onChange={(e) =>
                  setSelectedTeam({
                    ...selectedTeam,
                    description: e.target.value,
                  })
                }
                className="dark:text-white"
                InputLabelProps={{
                  className: "dark:text-gray-300",
                }}
                InputProps={{
                  className: "dark:text-white dark:border-gray-600",
                }}
              />

              {/* Member Management */}
              <Box sx={{ mt: 2 }}>
                <Typography
                  variant="subtitle1"
                  className="mb-1 dark:text-white"
                >
                  Team Members
                </Typography>
                <List>
                  {selectedTeam.members?.map((member) => (
                    <ListItem key={member.user.id} className="dark:text-white">
                      <ListItemText
                        primary={member.user.name}
                        secondary={member.role}
                        className="dark:text-white"
                        secondaryTypographyProps={{
                          className: "dark:text-gray-400",
                        }}
                      />
                      <ListItemSecondaryAction>
                        <Select
                          value={member.role}
                          onChange={(e) => {
                            const updatedMembers = selectedTeam.members.map(
                              (m) =>
                                m.user.id === member.user.id
                                  ? { ...m, role: e.target.value }
                                  : m,
                            );
                            setSelectedTeam({
                              ...selectedTeam,
                              members: updatedMembers,
                            });
                          }}
                          size="small"
                          className="dark:text-white"
                          MenuProps={{
                            PaperProps: {
                              className: "dark:bg-dark-secondary",
                            },
                          }}
                        >
                          <MenuItem
                            value="ADMIN"
                            className="dark:text-white dark:hover:bg-dark-tertiary"
                          >
                            Admin
                          </MenuItem>
                          <MenuItem
                            value="USER"
                            className="dark:text-white dark:hover:bg-dark-tertiary"
                          >
                            User
                          </MenuItem>
                          <MenuItem
                            value="MANAGER"
                            className="dark:text-white dark:hover:bg-dark-tertiary"
                          >
                            Manager
                          </MenuItem>
                        </Select>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => {
                            const updatedMembers = selectedTeam.members.filter(
                              (m) => m.user.id !== member.user.id,
                            );
                            setSelectedTeam({
                              ...selectedTeam,
                              members: updatedMembers,
                            });
                          }}
                          className="dark:text-gray-300"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>

                {/* Add New Member */}
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel className="dark:text-gray-300">
                    Add Member
                  </InputLabel>
                  <Select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        const newMember = {
                          user: users.find((u) => u.id === e.target.value),
                          role: "USER",
                        };
                        setSelectedTeam({
                          ...selectedTeam,
                          members: [...selectedTeam.members, newMember],
                        });
                      }
                    }}
                    input={
                      <OutlinedInput
                        label="Add Member"
                        className="dark:border-gray-600 dark:text-white"
                      />
                    }
                    className="dark:text-white"
                    MenuProps={{
                      PaperProps: {
                        className: "dark:bg-dark-secondary",
                      },
                    }}
                  >
                    {users
                      ?.filter(
                        (user) =>
                          !selectedTeam.members.some(
                            (m) => m.user.id === user.id,
                          ),
                      )
                      .map((user) => (
                        <MenuItem
                          key={user.id}
                          value={user.id}
                          className="dark:text-white dark:hover:bg-dark-tertiary"
                        >
                          {user.name} ({user.email})
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Project Management */}
              <Box sx={{ mt: 2 }}>
                <Typography
                  variant="subtitle1"
                  className="mb-1 dark:text-white"
                >
                  Assigned Projects
                </Typography>
                <div className="mb-2 flex flex-wrap gap-2">
                  {selectedTeam.projects?.map((project) => (
                    <Chip
                      key={project.id}
                      label={project.name}
                      onDelete={() => {
                        setSelectedTeam({
                          ...selectedTeam,
                          projects: selectedTeam.projects.filter(
                            (p) => p.id !== project.id,
                          ),
                          projectIds: selectedTeam.projectIds.filter(
                            (id) => id !== project.id,
                          ),
                        });
                      }}
                      color="secondary"
                      variant="outlined"
                      className="dark:border-gray-600 dark:text-white"
                    />
                  ))}
                </div>
                <FormControl fullWidth>
                  <InputLabel className="dark:text-gray-300">
                    Add Project
                  </InputLabel>
                  <Select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        const newProject = projects.find(
                          (p) => p.id === e.target.value,
                        );
                        setSelectedTeam({
                          ...selectedTeam,
                          projects: [
                            ...(selectedTeam.projects || []),
                            newProject,
                          ],
                          projectIds: [
                            ...(selectedTeam.projectIds || []),
                            e.target.value,
                          ],
                        });
                      }
                    }}
                    input={
                      <OutlinedInput
                        label="Add Project"
                        className="dark:border-gray-600 dark:text-white"
                      />
                    }
                    className="dark:text-white"
                    MenuProps={{
                      PaperProps: {
                        className: "dark:bg-dark-secondary",
                      },
                    }}
                  >
                    {projects
                      ?.filter(
                        (project) =>
                          !selectedTeam.projects?.some(
                            (p) => p.id === project.id,
                          ),
                      )
                      .map((project) => (
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
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions className="dark:bg-dark-secondary">
          <Button
            onClick={() => {
              setIsEditModalOpen(false);
              setSelectedTeam(null);
            }}
            className="dark:text-gray-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateTeam}
            variant="contained"
            color="primary"
            disabled={!selectedTeam?.name}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Join Team Dialog */}
      <JoinTeamDialog
        open={isJoinTeamModalOpen}
        onClose={() => setIsJoinTeamModalOpen(false)}
      />
    </div>
  );
};

export default TeamsPage;
