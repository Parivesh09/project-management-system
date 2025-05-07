"use client";

import React, { useState, useMemo } from "react";
import ProjectHeader from "../ProjectHeader";
import Board from "../BoardView";
import List from "../ListView";
import ModalNewTask from "../../../components/ModalNewTask";
import ModalEditTask from "../../../components/ModalEditTask";
import { useGetProjectByIdQuery, useGetTasksQuery } from "../../../redux/services/api";
import Loader from "../../../components/Loader";
import TaskSearch from "../../../components/TaskSearch";

const Project = ({ params }) => {
  const { id } = params;
  const { data: project, isLoading: isProjectLoading } = useGetProjectByIdQuery(id);
  const [activeTab, setActiveTab] = useState("Board");
  const [task, setTask] = useState(null);
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);
  const [isModalEditTaskOpen, setIsModalEditTaskOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: null,
    priority: null,
    dueDate: null,
  });

  const { data: tasks, isLoading: isTasksLoading } = useGetTasksQuery({ projectId: id });

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

    let filtered = tasks;

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
  }, [tasks, searchQuery, filters]);

  if (isProjectLoading || isTasksLoading) {
    return <Loader fullScreen />;
  }

  return (
    <div>
      <ModalNewTask
        isOpen={isModalNewTaskOpen}
        onClose={() => setIsModalNewTaskOpen(false)}
        projectId={id}
      />
      <ModalEditTask
        isOpen={isModalEditTaskOpen}
        onClose={() => setIsModalEditTaskOpen(false)}
        task={task}
      />
      <ProjectHeader 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        project={project} 
        setIsModalNewTaskOpen={setIsModalNewTaskOpen} 
      />
      
      <div className="px-4 pb-2 pt-2">
        <TaskSearch onSearch={handleSearch} onFilter={handleFilter} />
      </div>

      {activeTab === "Board" && (
        <Board 
          id={id} 
          setTask={setTask} 
          setIsModalEditTaskOpen={setIsModalEditTaskOpen} 
          setIsModalNewTaskOpen={setIsModalNewTaskOpen}
          tasks={filteredTasks}
        />
      )}
      {activeTab === "List" && (
        <List 
          id={id} 
          setIsModalNewTaskOpen={setIsModalNewTaskOpen}
          setIsModalEditTaskOpen={setIsModalEditTaskOpen}
          tasks={filteredTasks}
          setTask={setTask}
        />
      )}
    </div>
  );
};

export default Project;
