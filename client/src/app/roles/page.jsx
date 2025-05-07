"use client";
import React, { useState } from 'react';
import Loader from '../../components/Loader';
import {
  useGetUsersQuery,
  useUpdateUserMutation,
  useGetCurrentUserQuery
} from "../../redux/services/api";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarExport,
} from "@mui/x-data-grid";
import {
  FormControl,
  Select,
  MenuItem,
  Alert,
  Typography,
  Paper,
} from "@mui/material";
import Header from "../../components/Header";
import { dataGridClassNames, dataGridSxStyles } from "../../lib/utils";
import { useAppSelector } from "../redux";

const CustomToolbar = () => (
  <GridToolbarContainer className="toolbar flex gap-2">
    <GridToolbarFilterButton />
    <GridToolbarExport />
  </GridToolbarContainer>
);

const RoleManagerPage = () => {
  const { data: users, isLoading } = useGetUsersQuery();
  const { data: currentUser } = useGetCurrentUserQuery();
  const [updateUser] = useUpdateUserMutation();
  const [error, setError] = useState("");
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const handleRoleChange = async (userId, newRole) => {
    try {
      setError("");
      await updateUser({
        id: userId,
        role: newRole
      }).unwrap();
    } catch (error) {
      console.error("Failed to update user role:", error);
      setError(error.data?.message || "Failed to update user role");
    }
  };

  const columns = [
    { 
      field: "name", 
      headerName: "Name", 
      width: 200 
    },
    { 
      field: "email", 
      headerName: "Email", 
      width: 250 
    },
    {
      field: "role",
      headerName: "Role",
      width: 200,
      renderCell: (params) => {
        const isCurrentUser = params.row.id === currentUser?.id;
        const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
        const canEditRole = isSuperAdmin && !isCurrentUser;

        return (
          <FormControl fullWidth size="small">
            <Select
              value={params.row.role}
              onChange={(e) => handleRoleChange(params?.row?.id, e.target.value)}
              disabled={!canEditRole}
            >
              <MenuItem value="USER">User</MenuItem>
              <MenuItem value="MANAGER">Manager</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
              {isSuperAdmin && <MenuItem value="SUPER_ADMIN">Super Admin</MenuItem>}
            </Select>
          </FormControl>
        );
      }
    },
    { 
      field: "createdAt", 
      headerName: "Member Since", 
      width: 200,
      valueGetter: (params) => new Date(params?.row?.createdAt).toLocaleDateString()
    }
  ];

  if (isLoading) return <Loader fullScreen />;

  // Check if user has permission to access this page
  if (currentUser?.role !== 'SUPER_ADMIN' && currentUser?.role !== 'ADMIN') {
    return (
      <div className="p-4">
        <Paper className="p-4">
          <Typography variant="h6" color="error">
            Access Denied
          </Typography>
          <Typography>
            You do not have permission to access the role management page.
          </Typography>
        </Paper>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <Header name="Role Manager" />
        <Typography variant="subtitle1" color="textSecondary" className="mt-2">
          Manage user roles and permissions across the system
        </Typography>
      </div>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      <Paper className="p-4">
        <div style={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={users || []}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            className={dataGridClassNames}
            sx={dataGridSxStyles(isDarkMode)}
            components={{
              Toolbar: CustomToolbar,
            }}
            disableSelectionOnClick
          />
        </div>
      </Paper>
    </div>
  );
};

export default RoleManagerPage; 