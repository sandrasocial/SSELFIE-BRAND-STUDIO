import React from 'react';
import { Box, Container, Typography, Grid, Button, LinearProgress } from '@mui/material';
import { styled } from '@mui/system';

const TrainingContainer = styled(Box)({
  backgroundColor: '#0A0A0A',
  minHeight: '100vh',
  color: '#FFFFFF',
  paddingTop: '2rem',
  paddingBottom: '4rem'
});

const EditorialTypography = styled(Typography)({
  fontFamily: 'Times New Roman, serif',
  letterSpacing: '0.05em'
});

const LuxuryButton = styled(Button)({
  background: 'linear-gradient(45deg, #D4AF37 30%, #FFD700 90%)',
  border: 0,
  color: '#000000',
  padding: '12px 24px',
  textTransform: 'none',
  fontFamily: 'Times New Roman, serif',
  '&:hover': {
    background: 'linear-gradient(45deg, #FFD700 30%, #D4AF37 90%)',
  }
});

const TrainingModule = () => {
  return (
    <TrainingContainer>
      <Container maxWidth="lg">
        <EditorialTypography variant="h1" sx={{
          fontSize: '3.5rem',
          marginBottom: 6,
          fontWeight: 300
        }}>
          AI Model Training
        </EditorialTypography>

        <Grid container spacing={6}>
          {/* Training Steps */}
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 8 }}>
              <EditorialTypography variant="h3" sx={{ mb: 4 }}>
                Training Progress
              </EditorialTypography>
              
              <Box sx={{ mb: 4 }}>
                <EditorialTypography variant="h6" sx={{ mb: 2 }}>
                  Image Analysis
                </EditorialTypography>
                <LinearProgress variant="determinate" value={75} 
                  sx={{ 
                    height: 8, 
                    backgroundColor: '#2A2A2A',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#D4AF37'
                    }
                  }} 
                />
              </Box>

              <Box sx={{ mb: 4 }}>
                <EditorialTypography variant="h6" sx={{ mb: 2 }}>
                  Style Recognition
                </EditorialTypography>
                <LinearProgress variant="determinate" value={60}
                  sx={{ 
                    height: 8, 
                    backgroundColor: '#2A2A2A',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#D4AF37'
                    }
                  }} 
                />
              </Box>

              <Box sx={{ mb: 4 }}>
                <EditorialTypography variant="h6" sx={{ mb: 2 }}>
                  Brand DNA Extraction
                </EditorialTypography>
                <LinearProgress variant="determinate" value={45}
                  sx={{ 
                    height: 8, 
                    backgroundColor: '#2A2A2A',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#D4AF37'
                    }
                  }} 
                />
              </Box>
            </Box>

            <Box sx={{ mt: 4 }}>
              <LuxuryButton size="large">
                Continue Training
              </LuxuryButton>
            </Box>
          </Grid>

          {/* Training Stats */}
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              background: 'linear-gradient(45deg, #1A1A1A 0%, #2A2A2A 100%)',
              padding: '2rem',
              borderRadius: '4px'
            }}>
              <EditorialTypography variant="h4" sx={{ mb: 4 }}>
                Training Statistics
              </EditorialTypography>
              
              <Box sx={{ mb: 3 }}>
                <EditorialTypography variant="body1" sx={{ color: '#A0A0A0' }}>
                  Images Processed
                </EditorialTypography>
                <EditorialTypography variant="h5">
                  248
                </EditorialTypography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <EditorialTypography variant="body1" sx={{ color: '#A0A0A0' }}>
                  Style Parameters
                </EditorialTypography>
                <EditorialTypography variant="h5">
                  16
                </EditorialTypography>
              </Box>

              <Box>
                <EditorialTypography variant="body1" sx={{ color: '#A0A0A0' }}>
                  Training Time
                </EditorialTypography>
                <EditorialTypography variant="h5">
                  2.4 hours
                </EditorialTypography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </TrainingContainer>
  );
};

export default TrainingModule;