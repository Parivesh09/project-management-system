export const dataGridClassNames =
  "border border-gray-200 bg-white shadow dark:border-stroke-dark dark:bg-dark-secondary dark:text-gray-200";

export const dataGridSxStyles = (isDarkMode) => {
  return {
    "& .MuiDataGrid-columnHeaders": {
      color: `${isDarkMode ? "#e5e7eb" : ""}`,
      '& [role="row"] > *': {
        backgroundColor: `${isDarkMode ? "#1d1f21" : "white"}`,
        borderColor: `${isDarkMode ? "#2d3135" : ""}`,
      },
      '& .MuiDataGrid-columnHeader': {
        '& .MuiDataGrid-sortIcon': {
          color: `${isDarkMode ? "#e5e7eb" : ""}`,
        },
        '& .MuiDataGrid-menuIcon': {
          color: `${isDarkMode ? "#e5e7eb" : ""}`,
        },
      },
    },
    "& .MuiDataGrid-cell": {
      border: "none",
      color: `${isDarkMode ? "#e5e7eb" : ""}`,
    },
    "& .MuiDataGrid-row": {
      borderBottom: `1px solid ${isDarkMode ? "#2d3135" : "#e5e7eb"}`,
      '&:hover': {
        backgroundColor: `${isDarkMode ? "#2d3135" : "#f3f4f6"}`,
      },
    },
    "& .MuiDataGrid-withBorderColor": {
      borderColor: `${isDarkMode ? "#2d3135" : "#e5e7eb"}`,
    },
    "& .MuiDataGrid-footerContainer": {
      borderTop: `1px solid ${isDarkMode ? "#2d3135" : "#e5e7eb"}`,
      color: `${isDarkMode ? "#e5e7eb" : ""}`,
    },
    "& .MuiDataGrid-selectedRowCount": {
      color: `${isDarkMode ? "#e5e7eb" : ""}`,
    },
    "& .MuiDataGrid-toolbarContainer": {
      color: `${isDarkMode ? "#e5e7eb" : ""}`,
    },
    "& .MuiDataGrid-panel": {
      backgroundColor: `${isDarkMode ? "#1d1f21" : "white"}`,
      color: `${isDarkMode ? "#e5e7eb" : ""}`,
    },
    "& .MuiDataGrid-panelContent": {
      borderColor: `${isDarkMode ? "#2d3135" : "#e5e7eb"}`,
    },
    "& .MuiDataGrid-panelFooter": {
      borderTop: `1px solid ${isDarkMode ? "#2d3135" : "#e5e7eb"}`,
    },
  };
};
