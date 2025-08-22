import React from 'react';
import { Box, Container, Typography, Grid, IconButton } from '@mui/material';
import { styled } from '@mui/system';

const GalleryContainer = styled(Box)({
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

const ImageCard = styled(Box)({
  position: 'relative',
  paddingTop: '125%', // 4:5 aspect ratio
  background: '#1A1A1A',
  borderRadius: '4px',
  overflow: 'hidden',
  '&:hover': {
    '& .overlay': {
      opacity: 1
    }
  }
});

const ImageOverlay = styled(Box)({
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

const Gallery = () => {
  return (
    <GalleryContainer>
      <Container maxWidth="lg">
        <EditorialTypography variant="h1" sx={{
          fontSize: '3.5rem',
          marginBottom: 6,
          fontWeight: 300
        }}>
          Gallery
        </EditorialTypography>

        {/* Collections Section */}
        <Box sx={{ mb: 8 }}>
          <EditorialTypography variant="h3" sx={{ mb: 4 }}>
            Collections
          </EditorialTypography>
          <Grid container spacing={3}>
            {['Editorial', 'Product', 'Lifestyle', 'Personal Brand'].map((collection) => (
              <Grid item xs={6} md={3} key={collection}>
                <Box sx={{
                  background: 'linear-gradient(45deg, #1A1A1A 0%, #2A2A2A 100%)',
                  padding: '2rem',
                  borderRadius: '4px',
                  textAlign: 'center'
                }}>
                  <EditorialTypography variant="h6">
                    {collection}
                  </EditorialTypography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Recent Uploads */}
        <Box sx={{ mb: 8 }}>
          <EditorialTypography variant="h3" sx={{ mb: 4 }}>
            Recent Uploads
          </EditorialTypography>
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item}>
                <ImageCard>
                  <ImageOverlay className="overlay">
                    <Box sx={{ textAlign: 'center' }}>
                      <EditorialTypography variant="body1" sx={{ mb: 2 }}>
                        Image Title {item}
                      </EditorialTypography>
                      <EditorialTypography variant="body2" sx={{ color: '#A0A0A0' }}>
                        Added: June {item}, 2023
                      </EditorialTypography>
                    </Box>
                  </ImageOverlay>
                </ImageCard>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Stats Section */}
        <Box sx={{
          background: 'linear-gradient(45deg, #1A1A1A 0%, #2A2A2A 100%)',
          padding: '3rem',
          borderRadius: '4px',
          marginTop: '4rem'
        }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <EditorialTypography variant="h4" sx={{ mb: 2 }}>
                Total Images
              </EditorialTypography>
              <EditorialTypography variant="body1" sx={{ color: '#A0A0A0' }}>
                248 Images
              </EditorialTypography>
            </Grid>
            <Grid item xs={12} md={4}>
              <EditorialTypography variant="h4" sx={{ mb: 2 }}>
                Collections
              </EditorialTypography>
              <EditorialTypography variant="body1" sx={{ color: '#A0A0A0' }}>
                12 Collections
              </EditorialTypography>
            </Grid>
            <Grid item xs={12} md={4}>
              <EditorialTypography variant="h4" sx={{ mb: 2 }}>
                Storage Used
              </EditorialTypography>
              <EditorialTypography variant="body1" sx={{ color: '#A0A0A0' }}>
                2.4 GB
              </EditorialTypography>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </GalleryContainer>
  );
};

export default Gallery;