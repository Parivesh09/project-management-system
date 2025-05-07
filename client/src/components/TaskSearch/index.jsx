import React, { useState } from 'react';
import { Filter, Search } from 'lucide-react';
import {
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Select,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Button,
} from '@mui/material';

const TaskSearch = ({ onSearch, onFilter }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: null,
    priority: null,
    dueDate: null,
  });
  const [anchorEl, setAnchorEl] = useState(null);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleFilterChange = (type, value) => {
    const newFilters = { ...filters, [type]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const clearFilters = () => {
    const newFilters = {
      status: null,
      priority: null,
      dueDate: null,
    };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleFilterClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== null);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <TextField
        size="small"
        placeholder="Search tasks..."
        value={searchQuery}
        onChange={handleSearch}
        InputProps={{
          startAdornment: <Search className="h-4 w-4 text-gray-400 dark:text-white mr-2" />,
          className: "dark:text-white",
        }}
        className="dark:text-white dark:border-white"
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(0, 0, 0, 0.23)',
            },
            '&:hover fieldset': {
              borderColor: 'primary.main',
            },
          },
        }}
      />

      <IconButton
        onClick={handleFilterClick}
        className="dark:text-white"
        sx={{
          color: 'text.secondary',
          '&:hover': { color: 'primary.main' },
          position: 'relative',
        }}
      >
        <Filter className="h-5 w-5" />
        {hasActiveFilters && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: 'primary.main',
            }}
          />
        )}
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleFilterClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            p: 2,
          },
        }}
      >
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2">Filters</Typography>
          {hasActiveFilters && (
            <Button
              size="small"
              onClick={clearFilters}
              sx={{ color: 'primary.main', fontSize: '0.75rem' }}
            >
              Clear all
            </Button>
          )}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Status Filter */}
          <FormControl size="small" fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status || ''}
              label="Status"
              onChange={(e) => handleFilterChange('status', e.target.value || null)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="TODO">To Do</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="DONE">Done</MenuItem>
            </Select>
          </FormControl>

          {/* Priority Filter */}
          <FormControl size="small" fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={filters.priority || ''}
              label="Priority"
              onChange={(e) => handleFilterChange('priority', e.target.value || null)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="HIGH">High</MenuItem>
              <MenuItem value="MEDIUM">Medium</MenuItem>
              <MenuItem value="LOW">Low</MenuItem>
            </Select>
          </FormControl>

          {/* Due Date Filter */}
          <FormControl size="small" fullWidth>
            <InputLabel>Due Date</InputLabel>
            <Select
              value={filters.dueDate || ''}
              label="Due Date"
              onChange={(e) => handleFilterChange('dueDate', e.target.value || null)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="overdue">Overdue</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Menu>
    </Box>
  );
};

export default TaskSearch; 