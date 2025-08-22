import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';

export const HeroSection = () => {
  return (
    <Box 
      sx={{
        backgroundColor: 'primary.main',
        color: 'white',
        py: 12,
        textAlign: 'center'
      }}
    >
      <Container maxWidth="md">
        <Typography variant="h1" sx={{ mb: 4, fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
          Transform Your Personal Brand with AI-Powered Selfies
        </Typography>
        
        <Typography variant="h2" sx={{ mb: 6, fontSize: { xs: '1.5rem', md: '2rem' } }}>
          Replace €120-180+ in monthly subscriptions with one simple solution. 
          From "I hate my photos" to "I have a beautiful personal brand" - without the overwhelm.
        </Typography>

        <Button 
          variant="contained" 
          color="secondary"
          size="large"
          sx={{ 
            py: 2,
            px: 6,
            fontSize: '1.25rem'
          }}
        >
          Start Your Brand Journey
        </Button>
      </Container>
    </Box>
  );
};