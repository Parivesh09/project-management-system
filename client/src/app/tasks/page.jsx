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

const TasksPage = () => {
  const { data: currentUser } = useGetCurrentUserQuery();
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);
  const [isModalEditTaskOpen, setIsModalEditTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [viewMode, setViewMode] = useState("list");

  const { data: tasks, isLoading: isTasksLoading } = useGetTasksQuery({
    creatorId: currentUser?.id,
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

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];

    if (activeTab === 0) {
      return tasks;
    }

    if (activeTab === 1) {
      return tasks.filter((task) => !task.projectId);
    }

    if (activeTab === 2) {
      return selectedProjectId
        ? tasks.filter((task) => task.projectId === selectedProjectId)
        : tasks.filter((task) => task.projectId);
    }

    return tasks;
  }, [tasks, activeTab, selectedProjectId]);

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
      valueFormatter: (params) => {
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

        {activeTab === 2 && projects?.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2 dark:text-white">
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
