"use client";

import {
  useGetProjectsQuery,
  useGetDashboardDataQuery,
  useGetTeamsQuery,
  useGetCurrentUserQuery,
  useGetTasksQuery,
} from "../../redux/services/api";
import React from "react";
import { useAppSelector } from "../../redux/store";
import { DataGrid } from "@mui/x-data-grid";
import Header from "../../components/Header";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { dataGridClassNames, dataGridSxStyles } from "../../lib/utils";
import { Card, Typography, Button, Chip, Stack, Box, Tab, Tabs } from "@mui/material";
import GroupIcon from '@mui/icons-material/Group';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import CreateIcon from '@mui/icons-material/Create';
import { useRouter } from 'next/navigation';
import Loader from "../../components/Loader";

const taskColumns = [
  { field: "title", headerName: "Title", width: 200 },
  { field: "status", headerName: "Status", width: 150 },
  { field: "priority", headerName: "Priority", width: 150 },
  { 
    field: "dueDate", 
    headerName: "Due Date", 
    width: 150,
    renderCell: (params) => {
      if (!params.value) return '';
      return new Date(params.value).toLocaleDateString();
    }
  },
  { 
    field: "project",
    headerName: "Project",
    width: 200,
    renderCell: (params) => params?.row?.project?.name || 'N/A'
  }
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const HomePage = () => {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = React.useState(0);
  const { data: dashboardData, isLoading: isDashboardLoading } = useGetDashboardDataQuery();
  const { data: projects, isLoading: isProjectsLoading } = useGetProjectsQuery();
  const { data: teams, isLoading: isTeamsLoading } = useGetTeamsQuery();
  const { data: currentUser } = useGetCurrentUserQuery();

  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  
  const {
    data: tasks,
    isLoading: tasksLoading,
    isError: tasksError,
    error: tasksErrorMessage,
  } = useGetTasksQuery();

  if (isDashboardLoading || isProjectsLoading || isTeamsLoading || tasksLoading) {
    return <Loader fullScreen />;
  }

  // if (!dashboardData || !projects || tasksError) {
  //   return <div>Error fetching data</div>;
  // }

  console.log("dashboardData", dashboardData);

  const { assignedTasks = [], createdTasks = [], overdueTasks = [], taskStats = {
    total: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0
  } } = dashboardData;



  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const getTasksForTab = () => {
    switch (selectedTab) {
      case 0:
        return assignedTasks;
      case 1:
        return createdTasks;
      case 2:
        return overdueTasks;
      default:
        return [];
    }
  };

  const userTeams = teams?.filter(team => 
    team.members.some(member => member.user.id === currentUser?.id)
  ) || [];

  const isTeamAdmin = (team) => {
    const userMember = team.members.find(member => member.user.id === currentUser?.id);
    return userMember && ['ADMIN', 'MANAGER'].includes(userMember.role);
  };

  


  return (
    <div className="container h-full w-[100%] bg-gray-100 bg-transparent p-8">
      <Header name="Project Management Dashboard" />
      
      {/* Task Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 dark:bg-dark-secondary">
          <Typography variant="h6" className="dark:text-white">Total Tasks</Typography>
          <Typography variant="h3" className="dark:text-white">{taskStats.total}</Typography>
        </Card>
        <Card className="p-4 dark:bg-dark-secondary">
          <Typography variant="h6" className="dark:text-white">Completed</Typography>
          <Typography variant="h3" className="dark:text-white">{taskStats.completed}</Typography>
        </Card>
        <Card className="p-4 dark:bg-dark-secondary">
          <Typography variant="h6" className="dark:text-white">In Progress</Typography>
          <Typography variant="h3" className="dark:text-white">{taskStats.inProgress}</Typography>
        </Card>
        <Card className="p-4 dark:bg-dark-secondary">
          <Typography variant="h6" className="dark:text-white text-red-500">Overdue</Typography>
          <Typography variant="h3" className="dark:text-white text-red-500">{taskStats.overdue}</Typography>
        </Card>
      </div>

      {/* Tasks Tabs and Grid */}
      <div className="rounded-lg bg-white p-4 shadow dark:bg-dark-secondary">
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs 
            value={selectedTab} 
            onChange={handleTabChange}
            variant="fullWidth"
          >
            <Tab 
              icon={<AssignmentIcon />} 
              iconPosition="start" 
              className="dark:text-white"
              label={`Assigned Tasks (${assignedTasks.length})`} 
            />
            <Tab 
              icon={<CreateIcon />} 
              iconPosition="start" 
              className="dark:text-white"
              label={`Created Tasks (${createdTasks.length})`} 
            />
            <Tab 
              icon={<AssignmentLateIcon />} 
              iconPosition="start" 
              label={`Overdue Tasks (${overdueTasks.length})`} 
              sx={{ color: 'error.main' }}
            />
          </Tabs>
        </Box>
        <div style={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={getTasksForTab()}
            columns={taskColumns}
            loading={isDashboardLoading}
            getRowClassName={(params) => 
              params.row.dueDate && new Date(params.row.dueDate) < new Date() ? 
              'bg-red-100 dark:bg-red-900' : ''
            }
            getCellClassName={() => "data-grid-cell"}
            className={dataGridClassNames}
            sx={dataGridSxStyles(isDarkMode)}
          />
        </div>
      </div>

      {/* Teams Overview Section */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h5" className="dark:text-white">
            Your Teams
          </Typography>
          <Button
            variant="contained"
            startIcon={<GroupIcon />}
            onClick={() => router.push('/teams')}
          >
            View All Teams
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userTeams.map(team => (
            <Card key={team.id} className="p-4 dark:bg-dark-secondary">
              <div className="flex justify-between items-start mb-2">
                <Typography variant="h6" className="dark:text-white">
                  {team.name}
                </Typography>
                {isTeamAdmin(team) && (
                  <Chip 
                    label={team.members.find(m => m.user.id === currentUser?.id)?.role} 
                    color="primary" 
                    size="small" 
                  />
                )}
              </div>
              
              <Typography variant="body2" color="textSecondary" className="mb-3">
                {team.description || 'No description'}
              </Typography>
              
              <Stack direction="row" spacing={1} className="mb-2">
                <Chip 
                  label={`${team.members.length} members`}
                  size="small"
                  icon={<GroupIcon />}
                />
                <Chip 
                  label={`${team.projects.length} projects`}
                  size="small"
                />
              </Stack>

              {isTeamAdmin(team) && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<GroupIcon />}
                  onClick={() => router.push(`/teams?id=${team.id}`)}
                  className="mt-2"
                >
                  Manage Team
                </Button>
              )}
            </Card>
          ))}
          
          {userTeams.length === 0 && (
            <Card className="p-4 col-span-full dark:bg-dark-secondary">
              <Typography variant="body1" className="text-center dark:text-white">
                You are not a member of any teams yet.
              </Typography>
              <Button
                variant="contained"
                startIcon={<GroupIcon />}
                onClick={() => router.push('/teams')}
                className="mt-4 mx-auto block"
              >
                Join or Create Team
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
