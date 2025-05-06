"use client";

import Header from "../../components/Header";
import ProjectCard from "../../components/ProjectCard";
import TaskCard from "../../components/TaskCard";
import UserCard from "../../components/UserCard";
import { useSearchQuery } from "../../redux/services/api";
import { debounce } from "lodash";
import React, { useEffect, useState } from "react";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const {
    data: searchResults,
    isLoading,
    isError,
  } = useSearchQuery(searchTerm, {
    skip: searchTerm.length < 3,
  });

  const handleSearch = debounce((event) => {
    setSearchTerm(event.target.value);
  }, 500);

  useEffect(() => {
    return handleSearch.cancel;
  }, [handleSearch.cancel]);

  return (
    <div className="p-8">
      <Header name="Search" />
      <div>
        <input
          type="text"
          placeholder="Search..."
          className="w-1/2 rounded border p-3 shadow"
          onChange={handleSearch}
        />
      </div>
      {!searchTerm && (
        <div className="flex items-center justify-center p-2 text-sm text-gray-500">
          <p>Search for tasks, projects, and users</p>
        </div>
      )}
      <div className="p-5">
        {isLoading && <p>Loading...</p>}
        {isError && <p>Error occurred while fetching search results.</p>}
        {!isLoading && !isError && searchResults && (
          <div>
            {searchResults.tasks && searchResults.tasks?.length > 0 && (
              <h2 className="dark:text-white">Tasks</h2>
            )}
            {searchResults.tasks?.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}

            {searchResults.projects && searchResults.projects?.length > 0 && (
              <h2 className="dark:text-white">Projects</h2>
            )}
            {searchResults.projects?.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}

            {searchResults.users && searchResults.users?.length > 0 && (
              <h2 className="dark:text-white">Users</h2>
            )}
            {searchResults?.users?.map((user) => (
              <UserCard key={user.userId} user={user} />
            ))}
            {searchResults.projects.length == 0 &&
              searchResults.tasks.length == 0 &&
              searchResults.users.length == 0 && (
                <p className="text-center text-white">No results found</p>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
