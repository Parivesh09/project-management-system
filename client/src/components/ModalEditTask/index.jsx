import Modal from "../../components/Modal";
import {
  useUpdateTaskMutation,
  useGetUsersQuery,
  useGetCurrentUserQuery,
  useDeleteTaskMutation,
} from "../../redux/services/api";
import { Priority } from "../../constants/priority";
import { sendingStatus } from "../../constants/status";
import React, { useState, useEffect, useMemo } from "react";
import { formatISO, parseISO } from "date-fns";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Alert,
  OutlinedInput,
} from "@mui/material";
// import { Status } from "../../constants/status";

const ModalEditTask = ({ isOpen, onClose, task }) => {
  const [updateTask, { isLoading }] = useUpdateTaskMutation();
  const { data: users, isLoading: isLoadingUsers } = useGetUsersQuery();
  const { data: currentUser, isLoading: isLoadingCurrentUser } =
    useGetCurrentUserQuery();
  const [error, setError] = useState("");
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(sendingStatus.ToDo);
  const [priority, setPriority] = useState(Priority.Medium);
  const [dueDate, setDueDate] = useState("");
  const [assigneeId, setAssigneeId] = useState("");

  // Check if user has permission to edit the task
  const canEditTask = useMemo(() => {
    if (!currentUser || !task) return false;
    return currentUser.role === 'ADMIN' || task.creatorId === currentUser.id;
  }, [currentUser, task]);

  // Initialize form with task data when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      console.log("task in modal edit task", task);
      setStatus(task.status);
      setPriority(task.priority);
      // Format the date to YYYY-MM-DD for the date input
      setDueDate(
        task.dueDate
          ? formatISO(parseISO(task.dueDate), { representation: "date" })
          : "",
      );
      setAssigneeId(task.assignee?.id || "");
    }
  }, [task]);

  const handleSubmit = async () => {
    if (!title || !dueDate || !task?.id) return;
    if (!canEditTask) {
      setError("You don't have permission to edit this task.");
      return;
    }
    setError("");

    try {
      const result = await updateTask({
        id: task.id,
        title,
        description,
        status,
        priority,
        dueDate: formatISO(new Date(dueDate)),
        projectId: task.projectId,
        assigneeId: assigneeId || currentUser?.id, // Default to current user if no assignee selected
      }).unwrap();

      if (result) {
        onClose();
      }
    } catch (error) {
      console.error("Failed to update task:", error);
      setError(error.data?.error || "Failed to update task. Please try again.");
    }
  };

  const isFormValid = () => {
    return title && dueDate && task?.id;
  };

  if (isLoadingUsers || isLoadingCurrentUser) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <div>Please log in to edit tasks.</div>;
  }

  if (!task) {
    return null;
  }

  if (!canEditTask) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} name="View Task">
        <div className="mt-4 space-y-6">
          <Alert severity="warning" className="mb-4">
            You don&apos;t have permission to edit this task.
          </Alert>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold dark:text-white">{task.title}</h3>
            <p className="text-gray-600 dark:text-gray-300">{task.description}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                <p className="dark:text-white">{task.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Priority</p>
                <p className="dark:text-white">{task.priority}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Due Date</p>
                <p className="dark:text-white">
                  {task.dueDate ? formatISO(parseISO(task.dueDate), { representation: "date" }) : "No due date"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Assignee</p>
                <p className="dark:text-white">{task.assignee?.name || "Unassigned"}</p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  const onModalClose = () => {
    setError("");
    onClose();
  };

  const handleDeleteTask = async () => {
    if (!task?.id) return;
    if (!canEditTask) {
      setError("You don't have permission to delete this task.");
      return;
    }
    try {
      await deleteTask(task.id).unwrap();
      onClose();
    } catch (error) {
      console.error("Failed to delete task:", error);
      setError(error.data?.error || "Failed to delete task. Please try again.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onModalClose} name="Edit Task">
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
              input={
                <OutlinedInput
                  label="Status"
                  className="dark:border-gray-600 dark:text-white"
                />
              }
              MenuProps={{
                PaperProps: {
                  className: "dark:bg-dark-secondary",
                },
              }}
            >
              <MenuItem className="dark:text-white" value={sendingStatus.ToDo}>
                To Do
              </MenuItem>
              <MenuItem
                className="dark:text-white"
                value={sendingStatus.WorkInProgress}
              >
                In Progress
              </MenuItem>
              <MenuItem
                className="dark:text-white"
                value={sendingStatus.Completed}
              >
                Completed
              </MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={priority}
              label="Priority"
              onChange={(e) => setPriority(e.target.value)}
              className="dark:text-white"
              input={
                <OutlinedInput
                  label="Priority"
                  className="dark:border-gray-600 dark:text-white"
                />
              }
              MenuProps={{
                PaperProps: {
                  className: "dark:bg-dark-secondary",
                },
              }}
            >
              <MenuItem className="dark:text-white" value={Priority.Urgent}>
                Urgent
              </MenuItem>
              <MenuItem className="dark:text-white" value={Priority.High}>
                High
              </MenuItem>
              <MenuItem className="dark:text-white" value={Priority.Medium}>
                Medium
              </MenuItem>
              <MenuItem className="dark:text-white" value={Priority.Low}>
                Low
              </MenuItem>
              <MenuItem className="dark:text-white" value={Priority.Backlog}>
                Backlog
              </MenuItem>
            </Select>
          </FormControl>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <TextField
            type="date"
            label="Due Date"
            required
            InputLabelProps={{ shrink: true }}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="dark:text-white"
            InputProps={{
              className: "dark:text-white dark:border-gray-600",
            }}
          />

          <FormControl fullWidth>
            <InputLabel>Assign To</InputLabel>
            <Select
              value={assigneeId}
              label="Assign To"
              onChange={(e) => setAssigneeId(e.target.value)}
              className="dark:text-white"
              input={
                <OutlinedInput
                  label="Assign To"
                  className="dark:border-gray-600 dark:text-white"
                />
              }
              MenuProps={{
                PaperProps: {
                  className: "dark:bg-dark-secondary",
                },
              }}
            >
              {/* Current user is always first in the list */}
              {currentUser && (
                <MenuItem className="dark:text-white" value={currentUser.id}>
                  {currentUser.name} (yourself)
                </MenuItem>
              )}
              {/* Then show other users */}
              {users
                ?.filter((user) => user.id !== currentUser?.id)
                .map((user) => (
                  <MenuItem
                    className="dark:text-white"
                    key={user.id}
                    value={user.id}
                  >
                    {user.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </div>
        <div className="flex justify-end gap-4">
          <button
            onClick={() => {
              handleDeleteTask();
            }}
            className="mt-4 flex w-full justify-center rounded-md border border-transparent bg-red-700 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-red-500 dark:bg-transparent dark:text-red-500 dark:hover:border-red-600 dark:hover:text-red-600"
          >
            Delete Task
          </button>
          <button
            type="submit"
            className={`focus-offset-2 mt-4 flex w-full justify-center rounded-md border border-transparent bg-green-700 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              !isFormValid() || isLoading ? "cursor-not-allowed opacity-50" : ""
            } dark:border-green-500 dark:bg-transparent dark:text-green-500 dark:hover:border-green-600 dark:hover:text-green-600`}
            disabled={!isFormValid() || isLoading}
          >
            {isLoading ? "Updating..." : "Update Task"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ModalEditTask;
