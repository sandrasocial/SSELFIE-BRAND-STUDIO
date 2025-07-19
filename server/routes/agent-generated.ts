// server/routes.ts - Adding new route imports
import express from 'express';
import agentRoutes from './routes/agent-routes';
import victoriaRoutes from './routes/victoria-chat-routes';

// ... existing imports and setup ...

// Add new routes
app.use('/api/agents', agentRoutes);
app.use('/api/victoria', victoriaRoutes);

// ... rest of existing routes ...