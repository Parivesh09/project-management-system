import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  prepareHeaders: (headers, { getState }) => {
    // Try to get token from Redux state first
    const token = getState().auth.token;
    // If no token in Redux state, try localStorage
    const fallbackToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (token || fallbackToken) {
      headers.set('authorization', `Bearer ${token || fallbackToken}`);
    }
    return headers;
  },
});

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['User', 'Project', 'Task', 'Team', 'Comment', 'Notification', 'TeamInvite', 'Teams', 'Projects', 'Tasks', 'Users'],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    getCurrentUser: builder.query({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),

    // Project endpoints
    getProjects: builder.query({
      query: () => 'projects',
      providesTags: ['Projects'],
    }),
    getProjectById: builder.query({
      query: (id) => `projects/${id}`,
      providesTags: (result, error, id) => [{ type: 'Project', id }],
    }),
    createProject: builder.mutation({
      query: (project) => ({
        url: '/projects',
        method: 'POST',
        body: project,
      }),
      invalidatesTags: ['Projects'],
    }),
    updateProject: builder.mutation({
      query: ({ id, ...project }) => ({
        url: `/projects/${id}`,
        method: 'PUT',
        body: project,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Project', id }],
    }),
    deleteProject: builder.mutation({
      query: (id) => ({
        url: `/projects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Projects'],
    }),

    // Task endpoints
    getTasks: builder.query({
      query: ({ projectId, creatorId } = {}) => {
        const params = [];
        if (projectId) params.push(`projectId=${projectId}`);
        if (creatorId) params.push(`creatorId=${creatorId}`);
        return `/tasks${params.length ? `?${params.join('&')}` : ''}`;
      },
      providesTags: ['Tasks'],
    }),
    getTaskById: builder.query({
      query: (id) => `tasks/${id}`,
      providesTags: (result, error, id) => [{ type: 'Task', id }],
    }),
    createTask: builder.mutation({
      query: (task) => ({
        url: '/tasks',
        method: 'POST',
        body: task,
      }),
      invalidatesTags: ['Tasks'],
    }),
    updateTask: builder.mutation({
      query: ({ id, ...task }) => ({
        url: `/tasks/${id}`,
        method: 'PUT',
        body: task,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Task', id },
        'Tasks',
      ],
    }),
    deleteTask: builder.mutation({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Tasks'],
    }),
    updateTaskStatus: builder.mutation({
      query: ({ taskId, status }) => ({
        url: `/tasks/${taskId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { taskId }) => [{ type: 'Task', id: taskId }],
    }),
    getTasksByUser: builder.query({
      query: (userId) => `/tasks/user/${userId}`,
      providesTags: (result, error, userId) => 
        result ? 
          [...result.map(({ id }) => ({ type: 'Task', id })), { type: 'User', id: userId }] : 
          [{ type: 'User', id: userId }],
    }),

    // Team endpoints
    getTeams: builder.query({
      query: () => 'teams',
      providesTags: ['Teams'],
    }),
    getTeamById: builder.query({
      query: (id) => `/teams/${id}`,
      providesTags: (result, error, id) => [{ type: 'Team', id }],
    }),
    createTeam: builder.mutation({
      query: (team) => ({
        url: 'teams',
        method: 'POST',
        body: team,
      }),
      invalidatesTags: ['Teams'],
    }),
    updateTeam: builder.mutation({
      query: ({ id, ...team }) => ({
        url: `teams/${id}`,
        method: 'PUT',
        body: team,
      }),
      invalidatesTags: ['Teams'],
    }),
    deleteTeam: builder.mutation({
      query: (id) => ({
        url: `teams/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Teams'],
    }),
    updateTeamMemberRole: builder.mutation({
      query: ({ teamId, userId, role }) => ({
        url: `teams/${teamId}/members/${userId}/role`,
        method: 'PUT',
        body: { role },
      }),
      invalidatesTags: ['Teams'],
    }),

    // User endpoints
    getUsers: builder.query({
      query: () => 'users',
      providesTags: ['Users'],
    }),
    getUserById: builder.query({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),
    updateUser: builder.mutation({
      query: (data) => ({
        url: '/users/settings',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // Comment endpoints
    getComments: builder.query({
      query: (taskId) => `/tasks/${taskId}/comments`,
      providesTags: ['Comment'],
    }),
    createComment: builder.mutation({
      query: ({ taskId, ...comment }) => ({
        url: `/tasks/${taskId}/comments`,
        method: 'POST',
        body: comment,
      }),
      invalidatesTags: ['Comment'],
    }),
    deleteComment: builder.mutation({
      query: ({ taskId, commentId }) => ({
        url: `/tasks/${taskId}/comments/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Comment'],
    }),

    // Notification endpoints
    getNotifications: builder.query({
      query: () => '/notifications',
      providesTags: ['Notification'],
    }),
    markNotificationAsRead: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),

    // Team invite endpoints
    getTeamInviteCode: builder.query({
      query: (teamId) => `/teams/${teamId}/invite-code`,
      providesTags: (result, error, teamId) => [{ type: 'TeamInvite', id: teamId }],
    }),
    createTeamInvite: builder.mutation({
      query: ({ teamId, email }) => ({
        url: `/teams/${teamId}/invite`,
        method: 'POST',
        body: { email },
      }),
      invalidatesTags: (result, error, { teamId }) => [
        { type: 'TeamInvite', id: teamId },
        { type: 'Team', id: teamId }
      ],
    }),
    acceptTeamInvite: builder.mutation({
      query: (inviteCode) => ({
        url: '/teams/join',
        method: 'POST',
        body: { inviteCode },
      }),
      invalidatesTags: ['Team'],
    }),

    // Search
    search: builder.query({
      query: (searchTerm) => `/search?query=${searchTerm}`,
    }),

    // Dashboard endpoints
    getDashboardData: builder.query({
      query: () => '/dashboard',
      providesTags: ['Task'],
    }),
  }),
});

export const {
  // Auth exports
  useLoginMutation,
  useRegisterMutation,
  useGetCurrentUserQuery,
  useLogoutMutation,

  // Project exports
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,

  // Task exports
  useGetTasksQuery,
  useGetTaskByIdQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useUpdateTaskStatusMutation,
  useGetTasksByUserQuery,

  // Team exports
  useGetTeamsQuery,
  useGetTeamByIdQuery,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
  useUpdateTeamMemberRoleMutation,

  // User exports
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,

  // Comment exports
  useGetCommentsQuery,
  useCreateCommentMutation,
  useDeleteCommentMutation,

  // Notification exports
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,

  // Team invite exports
  useGetTeamInviteCodeQuery,
  useCreateTeamInviteMutation,
  useAcceptTeamInviteMutation,

  // Search export
  useSearchQuery,

  // Dashboard export
  useGetDashboardDataQuery,
} = api; 