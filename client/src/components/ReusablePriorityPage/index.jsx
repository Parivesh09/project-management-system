"use client";

import React from "react";
import { useGetCurrentUserQuery, useGetTasksByUserQuery } from "../../redux/services/api";
import TaskCard from "../TaskCard";
import Header from "../Header";

const ReusablePriorityPage = ({ priority }) => {
  const { data: currentUser } = useGetCurrentUserQuery();
  const { data: tasks, isLoading, error } = useGetTasksByUserQuery(currentUser?.id);

  console.log("tasks at reusable priority page", tasks);
  if (isLoading) return <div>Loading...</div>;
  if (error) return console.log(error?.originalStatus); <div>Error loading tasks</div>;
  if (error?.originalStatus === 404) return <div>No tasks found</div>;

  const filteredTasks = tasks?.filter((task) => task.priority === priority) || [];

  return (
    <div className="px-4 pb-8 xl:px-6">
      <div className="pt-5">
        <Header name={priority} isSmallText />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {filteredTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};

export default ReusablePriorityPage; 