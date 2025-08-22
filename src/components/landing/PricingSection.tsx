import React from 'react';
import { Container, Grid, Typography, Button, Box, Paper } from '@mui/material';

const pricingTiers = [
  {
    name: "Creator",
    price: "€27",
    period: "/month",
    features: [
      "Personal AI model creation",
      "Maya chat access for image generation",
      "Professional prompt collections",
      "Personal image gallery access"
    ],
    cta: "Start Creating"
  },
  {
    name: "Entrepreneur",
    price: "€67",
    period: "/month",
    features: [
      "Everything in Creator tier",
      "Full website creation with Victoria",
      "Flatlay library access",
      "Business integrations (payments, bookings)",
      "Priority support"
    ],
    cta: "Launch Your Brand",
    featured: true
  }
];

export const PricingSection = () => {
  return (
    <Box sx={{ py: 12 }}>
      <Container maxWidth="lg">
        <Typography variant="h2" align="center" sx={{ mb: 2 }}>
          Simple, Transparent Pricing
        </Typography>
        
        <Typography variant="h5" align="center" color="text.secondary" sx={{ mb: 8 }}>
          Replace €120-180+ in monthly subscriptions with one solution
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {pricingTiers.map((tier, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Paper
                elevation={tier.featured ? 8 : 2}
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  borderRadius: 2,
                  ...(tier.featured && {
                    borderColor: 'primary.main',
                    borderWidth: 2,
                    borderStyle: 'solid'
                  })
                }}
              >
                {tier.featured && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      backgroundColor: 'primary.main',
                      color: 'white',
                      px: 2,
                      py: 0.5,
                      borderRadius: 1
                    }}
                  >
                    Most Popular
                  </Box>
                )}

                <Typography variant="h3" component="h2" sx={{ mb: 2 }}>
                  {tier.name}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 4 }}>
                  <Typography variant="h2" component="span">
                    {tier.price}
                  </Typography>
                  <Typography variant="h5" component="span" color="text.secondary">
                    {tier.period}
                  </Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                  {tier.features.map((feature, featureIndex) => (
                    <Typography 
                      key={featureIndex}
                      sx={{ 
                        py: 1,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <Box 
                        component="span"
                        sx={{ 
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: 'primary.main',
                          mr: 2
                        }}
                      />
                      {feature}
                    </Typography>
                  ))}
                </Box>

                <Button
                  variant={tier.featured ? "contained" : "outlined"}
                  color="primary"
                  size="large"
                  sx={{ 
                    mt: 'auto',
                    py: 2
                  }}
                >
                  {tier.cta}
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};