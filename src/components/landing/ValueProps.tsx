import React from 'react';
import { Container, Grid, Typography, Box, Paper } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const valueProps = [
  {
    title: "Personal AI Image Generation",
    description: "Better than photo editors - AI that learns YOUR face and style"
  },
  {
    title: "Unlimited Brand Photoshoots",
    description: "No photographer needed - generate professional shots anytime"
  },
  {
    title: "Custom Website Creation",
    description: "More personal than templates, built by AI that knows your brand"
  },
  {
    title: "AI Strategy & Content",
    description: "Smarter than generic ChatGPT - agents that understand YOUR business"
  },
  {
    title: "Professional Design System",
    description: "Higher quality than Canva - cohesive branding across all platforms"
  },
  {
    title: "Integrated Business Tools",
    description: "Bookings, payments, and management all in one place"
  }
];

export const ValueProps = () => {
  return (
    <Box sx={{ py: 8, backgroundColor: 'grey.50' }}>
      <Container maxWidth="lg">
        <Typography variant="h2" align="center" sx={{ mb: 6 }}>
          Replace Your Entire Creative Stack
        </Typography>
        
        <Grid container spacing={4}>
          {valueProps.map((prop, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Paper 
                elevation={2}
                sx={{ 
                  p: 4, 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: '0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckCircleIcon color="primary" sx={{ mr: 2 }} />
                  <Typography variant="h5" component="h3">
                    {prop.title}
                  </Typography>
                </Box>
                <Typography color="text.secondary">
                  {prop.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};