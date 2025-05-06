import Modal from "../../components/Modal";
import {
  useUpdateTaskMutation,
  useGetUsersQuery,
  useGetCurrentUserQuery,
  useDeleteTaskMutation,
} from "../../redux/services/api";
import { Priority } from "../../constants/priority";
import { sendingStatus } from "../../constants/status";
import React, { useState, useEffect } from "react";
import { formatISO, parseISO } from "date-fns";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Alert,
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
      setAssigneeId(task.assignedTo?.id || "");
    }
  }, [task]);

  const handleSubmit = async () => {
    if (!title || !dueDate || !task?.id) return;
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

  const onModalClose = () => {
    setError("");
    onClose();
  };

  const handleDeleteTask = async () => {
    if (!task?.id) return;
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
          className="dark:bg-dark-tertiary"
        />

        <TextField
          fullWidth
          label="Description"
          variant="outlined"
          multiline
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="dark:bg-dark-tertiary"
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e) => setStatus(sendingStatus[e.target.value])}
            >
              <MenuItem value={sendingStatus.ToDo}>To Do</MenuItem>
              <MenuItem value={sendingStatus.WorkInProgress}>
                In Progress
              </MenuItem>
              <MenuItem value={sendingStatus.UnderReview}>
                Under Review
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
            InputLabelProps={{ shrink: true }}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="dark:bg-dark-tertiary"
          />

          <FormControl fullWidth>
            <InputLabel>Assign To</InputLabel>
            <Select
              value={assigneeId}
              label="Assign To"
              onChange={(e) => setAssigneeId(e.target.value)}
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
        <div className="flex justify-end gap-4">
          <button
            onClick={() => {
              handleDeleteTask();
            }}
            className="mt-4 flex w-full justify-center rounded-md border border-transparent bg-red-700 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            Delete Task
          </button>
          <button
            type="submit"
            className={`focus-offset-2 mt-4 flex w-full justify-center rounded-md border border-transparent bg-green-700 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              !isFormValid() || isLoading ? "cursor-not-allowed opacity-50" : ""
            }`}
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
