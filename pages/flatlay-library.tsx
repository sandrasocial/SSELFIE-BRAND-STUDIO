import React from 'react';
import { Box, Container, Typography, Grid, Button } from '@mui/material';
import { styled } from '@mui/system';

const LibraryContainer = styled(Box)({
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

const FlatLayCard = styled(Box)({
  position: 'relative',
  paddingTop: '100%',
  background: '#1A1A1A',
  borderRadius: '4px',
  overflow: 'hidden',
  '&:hover': {
    '& .overlay': {
      opacity: 1
    }
  }
});

const CardOverlay = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0,
  transition: 'opacity 0.3s ease-in-out'
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

const FlatLayLibrary = () => {
  return (
    <LibraryContainer>
      <Container maxWidth="lg">
        <EditorialTypography variant="h1" sx={{
          fontSize: '3.5rem',
          marginBottom: 6,
          fontWeight: 300
        }}>
          Flatlay Library
        </EditorialTypography>

        {/* Categories */}
        <Box sx={{ mb: 8 }}>
          <EditorialTypography variant="h3" sx={{ mb: 4 }}>
            Categories
          </EditorialTypography>
          <Grid container spacing={3}>
            {['Lifestyle', 'Beauty', 'Fashion', 'Tech', 'Workspace', 'Food'].map((category) => (
              <Grid item xs={6} md={2} key={category}>
                <Box sx={{
                  background: 'linear-gradient(45deg, #1A1A1A 0%, #2A2A2A 100%)',
                  padding: '1.5rem',
                  borderRadius: '4px',
                  textAlign: 'center'
                }}>
                  <EditorialTypography variant="h6">
                    {category}
                  </EditorialTypography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Featured Layouts */}
        <Box sx={{ mb: 8 }}>
          <EditorialTypography variant="h3" sx={{ mb: 4 }}>
            Featured Layouts
          </EditorialTypography>
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item}>
                <FlatLayCard>
                  <CardOverlay className="overlay">
                    <Box sx={{ textAlign: 'center' }}>
                      <EditorialTypography variant="h6" sx={{ mb: 2 }}>
                        Premium Layout {item}
                      </EditorialTypography>
                      <LuxuryButton size="small">
                        Use Template
                      </LuxuryButton>
                    </Box>
                  </CardOverlay>
                </FlatLayCard>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Composition Guide */}
        <Box sx={{
          background: 'linear-gradient(45deg, #1A1A1A 0%, #2A2A2A 100%)',
          padding: '3rem',
          borderRadius: '4px',
          marginTop: '4rem'
        }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <EditorialTypography variant="h3" sx={{ mb: 3 }}>
                Composition Guide
              </EditorialTypography>
              <EditorialTypography variant="body1" sx={{ color: '#A0A0A0' }}>
                Master the art of flatlay photography with our premium composition guides and professional techniques.
              </EditorialTypography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'right' }}>
                <LuxuryButton size="large">
                  Access Premium Guides
                </LuxuryButton>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </LibraryContainer>
  );
};

export default FlatLayLibrary;