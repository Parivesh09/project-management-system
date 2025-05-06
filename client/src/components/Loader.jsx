import React from 'react';

const Loader = ({ fullScreen = false }) => {
  const containerStyle = fullScreen ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 9999
  } : {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px'
  };

  return (
    <div style={containerStyle}>
      <span className="loader"></span>
    </div>
  );
};

export default Loader; 