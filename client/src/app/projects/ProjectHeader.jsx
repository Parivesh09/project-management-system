import Header from "../../components/Header";
import {
  Clock,
  Filter,
  Grid3x3,
  List,
  PlusSquare,
  Share2,
  Table,
} from "lucide-react";
import React from "react";
import EditIcon from '@mui/icons-material/Edit';

const ProjectHeader = ({
  activeTab,
  setActiveTab,
  project,
  setIsModalNewTaskOpen,
  setIsModalEditProjectOpen,
}) => {
  return (
    <div className="px-4 xl:px-6">
      <div className="pb-6 pt-6 lg:pb-4 lg:pt-8">
        <Header
          name={project ? project.name : "Project Details"}
          buttonComponent={
            <div className="flex items-center gap-2">
               <button
                className="flex items-center rounded-md px-3 py-2 text-gray-500 hover:bg-gray-200"
                onClick={() => setIsModalEditProjectOpen(true)}
              >
                <EditIcon fontSize="small" /> Edit Project
              </button>
              <button
                className="flex items-center rounded-md bg-blue-primary px-3 py-2 text-white hover:bg-blue-600"
                onClick={() => setIsModalNewTaskOpen(true)}
              >
                <PlusSquare className="mr-2 h-5 w-5" /> New Task
              </button>
            </div>
          }
        />
      </div>

      {/* TABS */}
      <div className="flex flex-wrap-reverse gap-2 border-y border-gray-200 pb-[8px] pt-2 dark:border-stroke-dark md:items-center">
        <div className="flex flex-1 items-center gap-2 md:gap-4">
          <TabButton
            name="Board"
            icon={<Grid3x3 className="h-5 w-5" />}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
          <TabButton
            name="List"
            icon={<List className="h-5 w-5" />}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ name, icon, setActiveTab, activeTab }) => {
  const isActive = activeTab === name;

  return (
    <button
      className={`relative flex items-center gap-2 px-1 py-2 text-gray-500 after:absolute after:-bottom-[9px] after:left-0 after:h-[1px] after:w-full hover:text-blue-600 dark:text-neutral-500 dark:hover:text-white sm:px-2 lg:px-4 ${
        isActive ? "text-blue-600 after:bg-blue-600 dark:text-white" : ""
      }`}
      onClick={() => setActiveTab(name)}
    >
      {icon}
      {name}
    </button>
  );
};

export default ProjectHeader;
