console.log('Starting minimal server...');

try {
  const express = require('express');
  console.log('Express loaded successfully');
  
  const app = express();
  console.log('Express app created');
  
  app.get('/test', (req, res) => {
    res.send('Test route works');
  });
  console.log('Test route added');
  
  const port = 5000;
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Minimal server running on port ${port}`);
  });
  
} catch (error) {
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
}