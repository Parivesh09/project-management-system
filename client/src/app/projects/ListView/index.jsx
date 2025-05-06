import Header from "../../../components/Header";
import TaskCard from "../../../components/TaskCard";
import { useGetTasksQuery } from "../../../redux/services/api";
import React from "react";
import Loader from "../../../components/Loader";

const ListView = ({ id, setIsModalNewTaskOpen }) => {
  const {
    data: tasks,
    error,
    isLoading,
  } = useGetTasksQuery({ projectId: id });

  if (isLoading) return <Loader />;
  if (error) return <div>An error occurred while fetching tasks</div>;

  return (
    <div className="px-4 pb-8 xl:px-6">
      <div className="pt-5">
        <Header
          name="List"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {tasks?.map((task) => <TaskCard key={task.id} task={task} />)}
      </div>
    </div>
  );
};

export default ListView;
