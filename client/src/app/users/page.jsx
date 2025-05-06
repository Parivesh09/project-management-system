"use client";
import { useGetCurrentUserQuery, useGetUsersQuery } from "../../redux/services/api";
import React from "react";
import { useAppSelector } from "../redux";
import Header from "../../components/Header";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import Image from "next/image";
import { dataGridClassNames, dataGridSxStyles } from "../../lib/utils";

const CustomToolbar = () => (
  <GridToolbarContainer className="toolbar flex gap-2">
    <GridToolbarFilterButton />
    <GridToolbarExport />
  </GridToolbarContainer>
);

const Users = () => {
  const { data: users, isLoading, isError } = useGetUsersQuery();
  const { data: currentUser } = useGetCurrentUserQuery();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  if (isLoading) return <div>Loading...</div>;
  if (isError || !users) return <div>Error fetching users</div>;

  console.log("Current user:", currentUser);
  console.log("All users:", users);

  const columns = [
    { field: "id", headerName: "ID", width: 100 },
    { 
      field: "name", 
      headerName: "Username", 
      width: 150,
      renderCell: (params) => {
        return params.row.id === currentUser?.id ? "Me" : params.value;
      }
    },
    { field: "email", headerName: "Email", width: 150 },
    { field: "role", headerName: "Role", width: 100 },
  ];

  return (
    <div className="flex w-full flex-col p-8">
      <Header name="Users" />
      <div style={{ height: 650, width: "100%" }}>
        <DataGrid
          rows={users || []}
          columns={columns}
          getRowId={(row) => row.id}
          pagination
          slots={{
            toolbar: CustomToolbar,
          }}
          className={dataGridClassNames}
          sx={{
            ...dataGridSxStyles(isDarkMode),
            '& .highlight-row': {
              backgroundColor: isDarkMode ? '#1a365d' : '#e5edff',
              '&:hover': {
                backgroundColor: isDarkMode ? '#1e429f' : '#dbeafe',
              },
            },
          }}
          getRowClassName={(params) => 
            params.row.id === currentUser?.id ? 'highlight-row' : ''
          }
        />
      </div>
    </div>
  );
};

export default Users;
