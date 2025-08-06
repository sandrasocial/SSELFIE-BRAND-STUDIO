import React from 'react';
import { Button } from '@mui/material';

const ConsultingAgents: React.FC = () => {
  const handleTestClick = () => {
    alert('Hello darling! Zara is working perfectly! 💅');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Consulting Agents</h1>
      <Button 
        variant="contained" 
        color="primary"
        onClick={handleTestClick}
        sx={{
          backgroundColor: '#FF69B4',
          '&:hover': {
            backgroundColor: '#FF1493',
          },
          margin: '20px 0',
          padding: '10px 30px',
          borderRadius: '25px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          fontWeight: 'bold'
        }}
      >
        Test Button ✨
      </Button>
    </div>
  );
};

export default ConsultingAgents;