import React from 'react';
import { Box, Container, Typography, Grid } from '@mui/material';
import { styled } from '@mui/system';

// Styled components with editorial luxury aesthetic
const HeroSection = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: '#000000',
  color: '#FFFFFF',
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%)',
    zIndex: 1
  }
}));

const EditorialTypography = styled(Typography)({
  fontFamily: 'Times New Roman, serif',
  letterSpacing: '0.05em',
  position: 'relative',
  zIndex: 2
});

const EditorialLanding = () => {
  return (
    <Box sx={{ background: '#000000', color: '#FFFFFF' }}>
      <HeroSection>
        <Container maxWidth="lg">
          <Grid container spacing={8}>
            <Grid item xs={12} md={6}>
              <EditorialTypography variant="h1" sx={{ 
                fontSize: { xs: '3rem', md: '4.5rem' },
                fontWeight: 300,
                marginBottom: 4
              }}>
                SSELFIE STUDIO
              </EditorialTypography>
              <EditorialTypography variant="h2" sx={{
                fontSize: { xs: '1.5rem', md: '2rem' },
                fontWeight: 300,
                marginBottom: 3,
                color: '#A0A0A0'
              }}>
                Transform Your Digital Presence
              </EditorialTypography>
              <EditorialTypography variant="body1" sx={{
                fontSize: { xs: '1rem', md: '1.25rem' },
                lineHeight: 1.8,
                maxWidth: '600px'
              }}>
                Where luxury meets technology. Create, curate, and command your personal brand with editorial sophistication.
              </EditorialTypography>
            </Grid>
          </Grid>
        </Container>
      </HeroSection>

      {/* Feature Sections */}
      <Box sx={{ py: 12 }}>
        <Container maxWidth="lg">
          <Grid container spacing={12}>
            {/* TRAIN Section */}
            <Grid item xs={12} md={6}>
              <EditorialTypography variant="h3" sx={{ 
                fontSize: '2.5rem',
                marginBottom: 3
              }}>
                TRAIN
              </EditorialTypography>
              <EditorialTypography variant="body1">
                Personalized AI training for your unique brand identity.
              </EditorialTypography>
            </Grid>

            {/* STYLE Section */}
            <Grid item xs={12} md={6}>
              <EditorialTypography variant="h3" sx={{ 
                fontSize: '2.5rem',
                marginBottom: 3
              }}>
                STYLE
              </EditorialTypography>
              <EditorialTypography variant="body1">
                Curated aesthetics that elevate your visual narrative.
              </EditorialTypography>
            </Grid>

            {/* SHOOT Section */}
            <Grid item xs={12} md={6}>
              <EditorialTypography variant="h3" sx={{ 
                fontSize: '2.5rem',
                marginBottom: 3
              }}>
                SHOOT
              </EditorialTypography>
              <EditorialTypography variant="body1">
                Professional-grade content creation at your fingertips.
              </EditorialTypography>
            </Grid>

            {/* BUILD Section */}
            <Grid item xs={12} md={6}>
              <EditorialTypography variant="h3" sx={{ 
                fontSize: '2.5rem',
                marginBottom: 3
              }}>
                BUILD
              </EditorialTypography>
              <EditorialTypography variant="body1">
                Craft your digital presence with editorial excellence.
              </EditorialTypography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default EditorialLanding;