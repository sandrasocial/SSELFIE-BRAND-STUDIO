import React from 'react';
import { Container, Grid, Typography, Box, Paper } from '@mui/material';

const steps = [
  {
    number: "01",
    title: "TRAIN",
    subtitle: "Build Your Personal AI Model",
    description: "Upload 10-20 selfies to train your personalized AI model that learns your unique features, style preferences, and best angles."
  },
  {
    number: "02",
    title: "STYLE",
    subtitle: "AI-Powered Image Creation",
    description: "Work with Maya, your AI styling agent, to generate professional images using your trained model through simple conversation."
  },
  {
    number: "03",
    title: "SHOOT",
    subtitle: "Professional Prompt Collections",
    description: "Access pre-built prompt libraries for business headshots, lifestyle content, brand photography, and social media content."
  },
  {
    number: "04",
    title: "BUILD",
    subtitle: "AI Website Creation",
    description: "Victoria, your AI web developer, creates a beautiful 4-page website using your images and brand preferences."
  },
  {
    number: "05",
    title: "MANAGE",
    subtitle: "Business Dashboard",
    description: "Track analytics, manage bookings, handle communications, and grow your business - all in one place."
  }
];

export const HowItWorks = () => {
  return (
    <Box sx={{ py: 12, backgroundColor: 'grey.50' }}>
      <Container maxWidth="lg">
        <Typography variant="h2" align="center" sx={{ mb: 2 }}>
          How It Works
        </Typography>
        
        <Typography variant="h5" align="center" color="text.secondary" sx={{ mb: 8 }}>
          Your journey from selfies to a complete personal brand
        </Typography>

        <Grid container spacing={4}>
          {steps.map((step, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Paper
                elevation={2}
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Typography 
                  sx={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    fontSize: '8rem',
                    fontWeight: 'bold',
                    color: 'rgba(0,0,0,0.03)',
                    zIndex: 0
                  }}
                >
                  {step.number}
                </Typography>

                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Typography 
                    variant="h3" 
                    component="h2" 
                    color="primary"
                    sx={{ mb: 2 }}
                  >
                    {step.title}
                  </Typography>

                  <Typography 
                    variant="h5" 
                    component="h3"
                    sx={{ mb: 2 }}
                  >
                    {step.subtitle}
                  </Typography>

                  <Typography color="text.secondary">
                    {step.description}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};