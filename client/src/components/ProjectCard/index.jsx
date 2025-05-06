import { Button } from "@mui/material";
import Link from "next/link";
import React from "react";

const ProjectCard = ({ project }) => {
  return (
    <div className="rounded p-4 shadow dark:bg-dark-secondary dark:text-white">
      <div className="flex items-center justify-between">
        <h3>{project.name}</h3>
        <div className="flex items-center gap-2">
          <Link href={`/projects/${project.id}`}>
            <Button variant="text" className="dark:text-white">
              View
            </Button>
          </Link>
        </div>
      </div>
      <p>{project.description}</p>
      <p>Start Date: {new Date(project.startDate).toLocaleDateString()}</p>
      <p>End Date: {new Date(project.endDate).toLocaleDateString()}</p>
    </div>
  );
};

export default ProjectCard;
