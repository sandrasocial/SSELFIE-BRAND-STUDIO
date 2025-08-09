import { Card, CardContent, Typography, Box } from '@mui/material';

export const ResourceUsage = () => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Resource Usage
        </Typography>
        <Box>
          <Typography variant="body2">
            CPU: 45%
          </Typography>
          <Typography variant="body2">
            Memory: 62%
          </Typography>
          <Typography variant="body2">
            Storage: 38%
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};