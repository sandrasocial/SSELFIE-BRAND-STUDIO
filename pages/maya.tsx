import React from 'react';
import { Box, Container, Typography, Grid, Paper } from '@mui/material';
import { styled } from '@mui/system';

const PhotoshootContainer = styled(Box)({
  backgroundColor: '#0A0A0A',
  minHeight: '100vh',
  color: '#FFFFFF'
});

const EditorialTypography = styled(Typography)({
  fontFamily: 'Times New Roman, serif',
  letterSpacing: '0.05em'
});

const StyleCard = styled(Paper)({
  background: 'linear-gradient(45deg, #1A1A1A 0%, #2A2A2A 100%)',
  padding: '2rem',
  borderRadius: '4px',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between'
});

const Maya = () => {
  return (
    <PhotoshootContainer>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <EditorialTypography variant="h1" sx={{ 
          fontSize: '3.5rem',
          marginBottom: 6,
          fontWeight: 300
        }}>
          Maya Photoshoot
        </EditorialTypography>

        <Grid container spacing={4}>
          {/* Style Selection */}
          <Grid item xs={12}>
            <EditorialTypography variant="h3" sx={{ 
              marginBottom: 4,
              fontWeight: 300
            }}>
              Select Your Style
            </EditorialTypography>
          </Grid>

          {/* Style Cards */}
          <Grid item xs={12} md={4}>
            <StyleCard>
              <Box>
                <EditorialTypography variant="h4" sx={{ marginBottom: 2 }}>
                  Editorial
                </EditorialTypography>
                <EditorialTypography variant="body1" sx={{ color: '#A0A0A0' }}>
                  High-fashion magazine aesthetic with dramatic lighting and poses.
                </EditorialTypography>
              </Box>
            </StyleCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <StyleCard>
              <Box>
                <EditorialTypography variant="h4" sx={{ marginBottom: 2 }}>
                  Studio
                </EditorialTypography>
                <EditorialTypography variant="body1" sx={{ color: '#A0A0A0' }}>
                  Clean, professional studio shots with perfect lighting.
                </EditorialTypography>
              </Box>
            </StyleCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <StyleCard>
              <Box>
                <EditorialTypography variant="h4" sx={{ marginBottom: 2 }}>
                  Lifestyle
                </EditorialTypography>
                <EditorialTypography variant="body1" sx={{ color: '#A0A0A0' }}>
                  Natural, authentic moments in curated settings.
                </EditorialTypography>
              </Box>
            </StyleCard>
          </Grid>

          {/* Prompt Section */}
          <Grid item xs={12} sx={{ mt: 8 }}>
            <Box sx={{ 
              background: 'linear-gradient(45deg, #1A1A1A 0%, #2A2A2A 100%)',
              padding: '3rem',
              borderRadius: '4px'
            }}>
              <EditorialTypography variant="h3" sx={{ marginBottom: 4 }}>
                Personalized Prompts
              </EditorialTypography>
              <EditorialTypography variant="body1" sx={{ color: '#A0A0A0', maxWidth: '800px' }}>
                AI-generated prompts tailored to your brand identity and selected style. Each prompt is crafted to create stunning, on-brand content that elevates your visual narrative.
              </EditorialTypography>
            </Box>
          </Grid>

          {/* Recent Shoots */}
          <Grid item xs={12} sx={{ mt: 8 }}>
            <EditorialTypography variant="h3" sx={{ marginBottom: 4 }}>
              Recent Shoots
            </EditorialTypography>
            <Grid container spacing={3}>
              {[1, 2, 3].map((item) => (
                <Grid item xs={12} md={4} key={item}>
                  <Box sx={{ 
                    height: '300px',
                    background: '#1A1A1A',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <EditorialTypography variant="body1" sx={{ color: '#A0A0A0' }}>
                      Image Preview {item}
                    </EditorialTypography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </PhotoshootContainer>
  );
};

export default Maya;