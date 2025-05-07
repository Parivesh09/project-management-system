import React from "react";
import { format } from "date-fns";
import { MessageSquareMore, MoreVertical } from "lucide-react";
import Image from "next/image";
import Loader from "../../../components/Loader";
import { DataGrid } from "@mui/x-data-grid";
import { dataGridClassNames, dataGridSxStyles } from "../../../lib/utils";
import { useAppSelector } from "../../../redux/store";
import { Chip, Tooltip } from "@mui/material";
import { useGetCurrentUserQuery } from "../../../redux/services/api";

const ListView = ({
  setIsModalNewTaskOpen,
  setIsModalEditTaskOpen,
  setTask,
  tasks: filteredTasks,
}) => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const { data: currentUser } = useGetCurrentUserQuery();

  if (!filteredTasks) return <Loader />;
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

  const handleTaskClick = (params) => {
    setTask(params.row);
    setIsModalEditTaskOpen(true);
  };

  return (
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
  );
};

export default ListView;
