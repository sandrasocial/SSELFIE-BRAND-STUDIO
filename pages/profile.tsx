import React from 'react';
import { Box, Container, Typography, Grid, Avatar, Paper } from '@mui/material';
import { styled } from '@mui/system';

const ProfileContainer = styled(Box)({
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

const StatsCard = styled(Paper)({
  background: 'linear-gradient(45deg, #1A1A1A 0%, #2A2A2A 100%)',
  padding: '2rem',
  borderRadius: '4px',
  height: '100%'
});

const LargeAvatar = styled(Avatar)({
  width: 120,
  height: 120,
  marginBottom: '2rem'
});

const Profile = () => {
  return (
    <ProfileContainer>
      <Container maxWidth="lg">
        {/* Profile Header */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <LargeAvatar />
          <EditorialTypography variant="h1" sx={{
            fontSize: '3.5rem',
            marginBottom: 2,
            fontWeight: 300
          }}>
            Sandra Smith
          </EditorialTypography>
          <EditorialTypography variant="h4" sx={{
            color: '#A0A0A0',
            fontWeight: 300,
            marginBottom: 4
          }}>
            Digital Creator & Entrepreneur
          </EditorialTypography>
        </Box>

        {/* Profile Stats */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          <Grid item xs={12} md={4}>
            <StatsCard>
              <EditorialTypography variant="h6" sx={{ mb: 2 }}>
                Content Created
              </EditorialTypography>
              <EditorialTypography variant="h3">
                248
              </EditorialTypography>
            </StatsCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <StatsCard>
              <EditorialTypography variant="h6" sx={{ mb: 2 }}>
                Collections
              </EditorialTypography>
              <EditorialTypography variant="h3">
                12
              </EditorialTypography>
            </StatsCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <StatsCard>
              <EditorialTypography variant="h6" sx={{ mb: 2 }}>
                AI Training Sessions
              </EditorialTypography>
              <EditorialTypography variant="h3">
                16
              </EditorialTypography>
            </StatsCard>
          </Grid>
        </Grid>

        {/* Recent Activity */}
        <Box sx={{ mb: 8 }}>
          <EditorialTypography variant="h3" sx={{ mb: 4 }}>
            Recent Activity
          </EditorialTypography>
          <Grid container spacing={3}>
            {[1, 2, 3].map((item) => (
              <Grid item xs={12} key={item}>
                <Box sx={{
                  background: 'linear-gradient(45deg, #1A1A1A 0%, #2A2A2A 100%)',
                  padding: '1.5rem',
                  borderRadius: '4px',
                  marginBottom: '1rem'
                }}>
                  <EditorialTypography variant="body1">
                    Completed photoshoot session #{item}
                  </EditorialTypography>
                  <EditorialTypography variant="body2" sx={{ color: '#A0A0A0', mt: 1 }}>
                    2 hours ago
                  </EditorialTypography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Subscription Info */}
        <Box sx={{
          background: 'linear-gradient(45deg, #D4AF37 30%, #FFD700 90%)',
          padding: '3rem',
          borderRadius: '4px',
          color: '#000000'
        }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <EditorialTypography variant="h3" sx={{ mb: 2 }}>
                Entrepreneur Plan
              </EditorialTypography>
              <EditorialTypography variant="body1">
                Full access to all premium features and priority AI training
              </EditorialTypography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'right' }}>
                <EditorialTypography variant="h4">
                  €67/month
                </EditorialTypography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </ProfileContainer>
  );
};

export default Profile;