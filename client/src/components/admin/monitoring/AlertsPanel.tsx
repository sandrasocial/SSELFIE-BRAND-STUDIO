import { Card, CardContent, Typography, Box } from '@mui/material';

export const AlertsPanel = () => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          System Alerts
        </Typography>
        <Box>
          <Typography variant="body2" color="success.main">
            All systems operational
          </Typography>
          <Typography variant="body2">
            Last check: {new Date().toLocaleTimeString()}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};