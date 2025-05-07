import Modal from "../../components/Modal";
import {
  useCreateTaskMutation,
  useGetUsersQuery,
  useGetCurrentUserQuery,
  useGetProjectsQuery,
} from "../../redux/services/api";
import { Priority } from "../../constants/priority";
import { sendingStatus } from "../../constants/status";
import React, { useState, useEffect } from "react";
import { formatISO } from "date-fns";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Alert,
  FormControlLabel,
  Switch,
} from "@mui/material";

const ModalNewTask = ({
  task,
  isOpen,
  onClose,
  projectId,
  allowPersonal = false,
}) => {
  const [createTask, { isLoading }] = useCreateTaskMutation();
  const { data: users, isLoading: isLoadingUsers } = useGetUsersQuery();
  const { data: projects, isLoading: isLoadingProjects } =
    useGetProjectsQuery();
  const { data: currentUser, isLoading: isLoadingCurrentUser } =
    useGetCurrentUserQuery();
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(sendingStatus.ToDo);
  const [priority, setPriority] = useState(Priority.Medium);
  const [dueDate, setDueDate] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [isPersonal, setIsPersonal] = useState(!projectId);
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || "");

  // Set current user as default assignee when component mounts
  useEffect(() => {
    if (currentUser && !assigneeId) {
      setAssigneeId(currentUser.id);
    }
  }, [currentUser, assigneeId]);

  // Update selected project when projectId prop changes
  useEffect(() => {
    if (projectId) {
      setSelectedProjectId(projectId);
      setIsPersonal(false);
    } else {
      setIsPersonal(allowPersonal);
    }
  }, [projectId, allowPersonal]);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      setPriority(task.priority);
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
      setAssigneeId(task.assignee?.id || '');
    }
  }, [task, assigneeId]);

  const handleSubmit = async () => {
    if (!title || !dueDate) return;
    if (!isPersonal && !selectedProjectId) return;

    setError("");

    try {
      const result = await createTask({
        title,
        description,
        status,
        priority,
        dueDate: formatISO(new Date(dueDate)),
        projectId: isPersonal ? undefined : selectedProjectId,
        assigneeId: assigneeId || currentUser?.id, // Default to current user if no assignee selected
      }).unwrap();

      if (result) {
        onClose();
        // Reset form
        setTitle("");
        setDescription("");
        setStatus(sendingStatus.ToDo);
        setPriority(Priority.Medium);
        setDueDate("");
        setAssigneeId(currentUser?.id || ""); // Reset to current user
        setIsPersonal(!projectId);
        setSelectedProjectId(projectId || "");
      }
    } catch (error) {
      console.error("Failed to create task:", error);
      setError(error.data?.error || "Failed to create task. Please try again.");
    }
  };

  const isFormValid = () => {
    return title && dueDate && (isPersonal || selectedProjectId);
  };

  if (isLoadingUsers || isLoadingCurrentUser || isLoadingProjects) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <div>Please log in to create tasks.</div>;
  }

  const onModalClose = () => {
    setTitle("");
    setDescription("");
    setStatus(sendingStatus.ToDo);
    setPriority(Priority.Medium);
    setDueDate("");
    setAssigneeId("");
    setIsPersonal(!projectId);
    setSelectedProjectId(projectId || "");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onModalClose} name="Create New Task">
      <form
        className="mt-4 space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Title"
          variant="outlined"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="dark:text-white"
          InputLabelProps={{
            className: "dark:text-gray-300",
          }}
          InputProps={{
            className: "dark:text-white dark:border-gray-600",
          }}
        />

        <TextField
          fullWidth
          label="Description"
          variant="outlined"
          multiline
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="dark:text-white"
          InputLabelProps={{
            className: "dark:text-gray-300",
          }}
          InputProps={{
            className: "dark:text-white dark:border-gray-600",
          }}
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e) => setStatus(sendingStatus[e.target.value])}
              className="dark:text-white"
              InputLabelProps={{
                className: "dark:text-gray-300",
              }}
              MenuProps={{
                PaperProps: {
                  className: "dark:bg-dark-secondary dark:text-white",
                },
              }}
              InputProps={{
                className: "dark:text-white dark:border-gray-600",
              }}
            >
              <MenuItem value={sendingStatus.ToDo}>To Do</MenuItem>
              <MenuItem value={sendingStatus.WorkInProgress}>
                In Progress
              </MenuItem>
              <MenuItem value={sendingStatus.Completed}>Completed</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={priority}
              label="Priority"
              onChange={(e) => setPriority(e.target.value)}
              className="dark:text-white"
              InputLabelProps={{
                className: "dark:text-gray-300",
              }}
              MenuProps={{
                PaperProps: {
                  className: "dark:bg-dark-secondary dark:text-white",
                },
              }}
              InputProps={{
                className: "dark:text-white dark:border-gray-600",
              }}
            >
              <MenuItem value={Priority.Urgent}>Urgent</MenuItem>
              <MenuItem value={Priority.High}>High</MenuItem>
              <MenuItem value={Priority.Medium}>Medium</MenuItem>
              <MenuItem value={Priority.Low}>Low</MenuItem>
              <MenuItem value={Priority.Backlog}>Backlog</MenuItem>
            </Select>
          </FormControl>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <TextField
            type="date"
            label="Due Date"
            required
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="dark:text-white"
            InputLabelProps={{
              className: "dark:text-gray-300",
              shrink: true,
            }}
            MenuProps={{
              PaperProps: {
                className: "dark:bg-dark-secondary dark:text-white",
              },
            }}
            InputProps={{
              className: "dark:text-white dark:border-gray-600",
            }}
          />

          <FormControl fullWidth>
            <InputLabel className="dark:text-white">Assign To</InputLabel>
            <Select
              value={assigneeId}
              label="Assign To"
              onChange={(e) => setAssigneeId(e.target.value)}
              className="dark:text-white"
              InputLabelProps={{
                className: "dark:text-gray-300",
              }}
              disabled={isPersonal || allowPersonal}
              MenuProps={{
                PaperProps: {
                  className: "dark:bg-dark-secondary dark:text-white",
                },
              }}
              InputProps={{
                className: "dark:text-white dark:border-gray-600",
              }}
            >
              {/* Current user is always first in the list */}
              {currentUser && (
                <MenuItem value={currentUser.id}>
                  {currentUser.name} (yourself)
                </MenuItem>
              )}
              {/* Then show other users */}
              {users
                ?.filter((user) => user.id !== currentUser?.id)
                .map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </div>

        {allowPersonal && (
          <div>
            <FormControlLabel
              className="dark:text-white"
              control={
                <Switch
                  checked={isPersonal}
                  onChange={() => {
                    setIsPersonal(!isPersonal);
                    if (!isPersonal) {
                      setSelectedProjectId("");
                    }
                  }}
                />
              }
              label="Personal Task (not linked to a project)"
            />
          </div>
        )}

        {!isPersonal && (
          <FormControl fullWidth>
            <InputLabel className="dark:text-white">Project</InputLabel>
            <Select
              value={selectedProjectId}
              label="Project"
              required={!isPersonal}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="dark:text-white" 
              InputLabelProps={{
                className: "dark:text-gray-300",
              }}
              MenuProps={{
                PaperProps: {
                  className: "dark:bg-dark-secondary dark:text-white",
                },
              }}
              InputProps={{
                className: "dark:text-white dark:border-white",
              }}
            >
              <MenuItem value="">
                <em>Select a project</em>
              </MenuItem>
              {projects?.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <button
          type="submit"
          className={`focus-offset-2 mt-4 flex w-full justify-center rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
            !isFormValid() || isLoading ? "cursor-not-allowed opacity-50" : ""
          }`}
          disabled={!isFormValid() || isLoading}
        >
          {isLoading ? "Creating..." : "Create Task"}
        </button>
      </form>
    </Modal>
  );
};

export default ModalNewTask;
