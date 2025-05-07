import React from 'react';
import { Badge, IconButton, Tooltip } from '@mui/material';
import { Notifications } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useGetNotificationsQuery } from '../../redux/api/notificationApi';

const NotificationIcon = () => {
  const router = useRouter();
  const { data: notifications } = useGetNotificationsQuery();

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  const handleClick = () => {
    router.push('/notifications');
  };

  return (
    <Tooltip title="Notifications">
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ ml: 1 }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <Notifications className="dark:text-white" />
        </Badge>
      </IconButton>
    </Tooltip>
  );
};

export default NotificationIcon; 