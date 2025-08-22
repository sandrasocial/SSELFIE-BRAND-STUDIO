import React from 'react';
import { Box, Container, Grid, Typography, Paper } from '@mui/material';
import { styled } from '@mui/system';

const WorkspaceContainer = styled(Box)({
  backgroundColor: '#0A0A0A',
  minHeight: '100vh',
  color: '#FFFFFF'
});

const StudioCard = styled(Paper)({
  background: 'linear-gradient(45deg, #1A1A1A 0%, #2A2A2A 100%)',
  padding: '2rem',
  borderRadius: '4px',
  transition: 'transform 0.3s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-8px)'
  }
});

const EditorialTypography = styled(Typography)({
  fontFamily: 'Times New Roman, serif',
  letterSpacing: '0.05em'
});

const Workspace = () => {
  return (
    <WorkspaceContainer>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <EditorialTypography variant="h1" sx={{ 
          fontSize: '3.5rem',
          marginBottom: 6,
          fontWeight: 300
        }}>
          Studio Workspace
        </EditorialTypography>

        <Grid container spacing={4}>
          {/* AI Training Module */}
          <Grid item xs={12} md={6}>
            <StudioCard>
              <EditorialTypography variant="h3" sx={{ marginBottom: 2 }}>
                AI Training
              </EditorialTypography>
              <EditorialTypography variant="body1" sx={{ color: '#A0A0A0' }}>
                Personalize your AI model for authentic content creation.
              </EditorialTypography>
            </StudioCard>
          </Grid>

          {/* Maya Photoshoot */}
          <Grid item xs={12} md={6}>
            <StudioCard>
              <EditorialTypography variant="h3" sx={{ marginBottom: 2 }}>
                Maya Photoshoot
              </EditorialTypography>
              <EditorialTypography variant="body1" sx={{ color: '#A0A0A0' }}>
                Create stunning visuals with AI-powered photography.
              </EditorialTypography>
            </StudioCard>
          </Grid>

          {/* Gallery */}
          <Grid item xs={12} md={6}>
            <StudioCard>
              <EditorialTypography variant="h3" sx={{ marginBottom: 2 }}>
                Gallery
              </EditorialTypography>
              <EditorialTypography variant="body1" sx={{ color: '#A0A0A0' }}>
                Curate and manage your visual content collection.
              </EditorialTypography>
            </StudioCard>
          </Grid>

          {/* Flatlay Library */}
          <Grid item xs={12} md={6}>
            <StudioCard>
              <EditorialTypography variant="h3" sx={{ marginBottom: 2 }}>
                Flatlay Library
              </EditorialTypography>
              <EditorialTypography variant="body1" sx={{ color: '#A0A0A0' }}>
                Access premium flatlay compositions and templates.
              </EditorialTypography>
            </StudioCard>
          </Grid>
        </Grid>
      </Container>
    </WorkspaceContainer>
  );
};

export default Workspace;