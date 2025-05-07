"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  useGetTasksQuery,
  useGetProjectsQuery,
  useGetCurrentUserQuery,
} from "../../redux/services/api";
import { dataGridClassNames, dataGridSxStyles } from "../../lib/utils";
import { useAppSelector } from "../../redux/store";
import Loader from "../../components/Loader";
import { Tabs, Tab, Box, Chip, Tooltip } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import ModalNewTask from "../../components/ModalNewTask";
import ModalEditTask from "../../components/ModalEditTask";
import TasksBoard from "./board";
import TaskHeader from "./TaskHeader";
import TaskSearch from "../../components/TaskSearch";

const TasksPage = () => {
  const { data: currentUser } = useGetCurrentUserQuery();
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);
  const [isModalEditTaskOpen, setIsModalEditTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: null,
    priority: null,
    dueDate: null,
  });

  const { data: tasks, isLoading: isTasksLoading } = useGetTasksQuery({
    assigneeId: currentUser?.id,
  });

  const { data: projects, isLoading: isProjectsLoading } = useGetProjectsQuery();

  useEffect(() => {
    if (projects?.length > 0 && activeTab === 2 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, activeTab, selectedProjectId]);

  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue !== 2) {
      setSelectedProjectId(null);
    } else if (projects?.length > 0) {
      setSelectedProjectId(projects[0].id);
    }
  };

  const handleTaskClick = (params) => {
    setSelectedTask(params.row);
    setIsModalEditTaskOpen(true);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
  };

  const isTaskDueToday = (dueDate) => {
    const today = new Date();
    const taskDate = new Date(dueDate);
    return (
      taskDate.getDate() === today.getDate() &&
      taskDate.getMonth() === today.getMonth() &&
      taskDate.getFullYear() === today.getFullYear()
    );
  };

  const isTaskDueThisWeek = (dueDate) => {
    const today = new Date();
    const taskDate = new Date(dueDate);
    const diffTime = taskDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  };

  const isTaskDueThisMonth = (dueDate) => {
    const today = new Date();
    const taskDate = new Date(dueDate);
    return (
      taskDate.getMonth() === today.getMonth() &&
      taskDate.getFullYear() === today.getFullYear()
    );
  };

  const isTaskOverdue = (dueDate) => {
    const today = new Date();
    const taskDate = new Date(dueDate);
    return taskDate < today;
  };

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];

    let filtered = tasks.filter(task => 
      task.assigneeId === currentUser?.id
    );

    // Filter by tab
    if (activeTab === 1) {
      filtered = filtered.filter(
        (task) => !task.projectId && task.creatorId === currentUser?.id
      );
    } else if (activeTab === 2) {
      filtered = selectedProjectId
        ? filtered.filter(
            (task) => task.projectId === selectedProjectId
          )
        : filtered.filter(
            (task) => task.projectId
          );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query))
      );
    }

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter((task) => task.status === filters.status);
    }

    // Filter by priority
    if (filters.priority) {
      filtered = filtered.filter((task) => task.priority === filters.priority);
    }

    // Filter by due date
    if (filters.dueDate) {
      filtered = filtered.filter((task) => {
        if (!task.dueDate) return false;
        switch (filters.dueDate) {
          case "today":
            return isTaskDueToday(task.dueDate);
          case "week":
            return isTaskDueThisWeek(task.dueDate);
          case "month":
            return isTaskDueThisMonth(task.dueDate);
          case "overdue":
            return isTaskOverdue(task.dueDate);
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [tasks, activeTab, selectedProjectId, searchQuery, filters, currentUser?.id]);

  const columns = [
    { field: "title", headerName: "Title", width: 200 },
    {
      field: "description",
      headerName: "Description",
      width: 300,
      renderCell: (params) => (
        <Tooltip title={params?.value || ""}>
          <div className="max-w-full truncate">{params?.value || ""}</div>
        </Tooltip>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params?.value || ""}
          className="dark:text-white dark:border-white"
          color={
            params.value === "TODO"
              ? "default"
              : params.value === "IN_PROGRESS"
                ? "primary"
                : "success"
          }
          size="small"
        />
      ),
    },
    {
      field: "priority",
      headerName: "Priority",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params?.value || ""}
          color={
            params?.value === "HIGH"
              ? "error"
              : params?.value === "MEDIUM"
                ? "warning"
                : "info"
          }
          size="small"
        />
      ),
    },
    {
      field: "dueDate",
      headerName: "Due Date",
      width: 150,
      renderCell: (params) => {
        if (!params?.value) return "";
        return new Date(params?.value).toLocaleDateString();
      },
    },
    {
      field: "projectName",
      headerName: "Project",
      width: 200,
      valueGetter: (params) => params?.row?.project?.name || "Personal",
    },
  ];

  if (isTasksLoading || isProjectsLoading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="p-0">
      <TaskHeader
        viewMode={viewMode}
        setViewMode={setViewMode}
        setIsModalNewTaskOpen={setIsModalNewTaskOpen}
      />

      <div className="p-4">
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab className="dark:text-white" label="All Tasks" />
            <Tab className="dark:text-white" label="Personal Tasks" />
            <Tab className="dark:text-white" label="Project Tasks" />
          </Tabs>
        </Box>

        <div className="mb-4 flex items-center justify-between">
          {activeTab === 2 && projects?.length > 0 && (
            <div className="flex flex-wrap gap-2 dark:text-white">
              {projects?.map((project) => (
                <Chip
                  key={project.id}
                  label={project.name}
                  onClick={() => setSelectedProjectId(project.id)}
                  color={selectedProjectId === project.id ? "primary" : "default"}
                  className="mb-2 dark:text-white"
                />
              ))}
            </div>
          )}
          <TaskSearch onSearch={handleSearch} onFilter={handleFilter} />
        </div>

        {viewMode === "list" && (
          <div style={{ height: 600, width: "100%" }}>
            <DataGrid
              rows={filteredTasks || []}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10]}
              className={dataGridClassNames}
              sx={dataGridSxStyles(isDarkMode)}
              onRowClick={handleTaskClick}
            />
          </div>
        )}

        {viewMode === "board" && (
          <TasksBoard
            tasks={filteredTasks}
            setTask={setSelectedTask}
            setIsModalEditTaskOpen={setIsModalEditTaskOpen}
          />
        )}

        <ModalNewTask
          isOpen={isModalNewTaskOpen}
          onClose={() => setIsModalNewTaskOpen(false)}
          allowPersonal={true}
        />

        <ModalEditTask
          isOpen={isModalEditTaskOpen}
          onClose={() => {
            setIsModalEditTaskOpen(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          allowPersonal={true}
        />
      </div>
    </div>
  );
};

export default TasksPage;
