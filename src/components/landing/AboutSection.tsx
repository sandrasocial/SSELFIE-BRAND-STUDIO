import React from 'react';
import { Container, Typography, Box, Grid } from '@mui/material';

export const AboutSection = () => {
  return (
    <Box sx={{ py: 12 }}>
      <Container maxWidth="lg">
        <Grid container spacing={8} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h2" sx={{ mb: 4 }}>
              Your Journey to Personal Brand Confidence
            </Typography>
            
            <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
              Transform from hiding behind your phone to confidently building your personal brand—one selfie at a time.
            </Typography>

            <Typography paragraph>
              As a community of over 135,000 women entrepreneurs and creators, we understand the struggle of building a personal brand. That's why we've created the simplest path from "I hate my photos" to "I have a beautiful personal brand."
            </Typography>

            <Typography paragraph>
              SSELFIE Studio replaces the chaos of juggling multiple subscriptions and tools. No more paying separately for Canva, ChatGPT, photo editors, templates, and countless other apps. Get everything you need in one place—with an AI agent team that builds FOR you, not just guides you.
            </Typography>

            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Our Promise:
              </Typography>
              <Typography>
                • End the overwhelm of personal branding<br />
                • Cancel unnecessary subscriptions<br />
                • Build your brand without needing to know where to begin<br />
                • Get an AI team that works FOR you, not just guides you
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box 
              component="img"
              src="/images/about-illustration.jpg"
              alt="Personal Brand Journey"
              sx={{
                width: '100%',
                height: 'auto',
                borderRadius: 2,
                boxShadow: 6
              }}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};