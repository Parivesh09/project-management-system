"use client";

import React, { useState } from "react";
import ProjectHeader from "../ProjectHeader";
import Board from "../BoardView";
import List from "../ListView";
import Table from "../TableView";
import ModalNewTask from "../../../components/ModalNewTask";
import ModalEditTask from "../../../components/ModalEditTask";
import { useGetProjectByIdQuery } from "../../../redux/services/api";
import Loader from "../../../components/Loader";

const Project = ({ params }) => {
  const { id } = params;
  console.log("id at the project page", id);
  
  const { data: project, isLoading: isProjectLoading } = useGetProjectByIdQuery(id);
  const [activeTab, setActiveTab] = useState("Board");
  const [task, setTask] = useState(null);
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);
  const [isModalEditTaskOpen, setIsModalEditTaskOpen] = useState(false);

  if (isProjectLoading) {
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
      <ProjectHeader activeTab={activeTab} setActiveTab={setActiveTab} project={project} setIsModalNewTaskOpen={setIsModalNewTaskOpen} />
      {activeTab === "Board" && (
        <Board id={id} setTask={setTask} setIsModalEditTaskOpen={setIsModalEditTaskOpen} setIsModalNewTaskOpen={setIsModalNewTaskOpen} />
      )}
      {activeTab === "List" && (
        <List id={id} setIsModalNewTaskOpen={setIsModalNewTaskOpen} />
      )}
      {activeTab === "Table" && (
        <Table id={id} setIsModalNewTaskOpen={setIsModalNewTaskOpen} />
      )}
    </div>
  );
};

export default Project;
