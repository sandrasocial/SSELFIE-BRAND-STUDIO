import { Router } from 'express';
import chatRoutes from './chat';
import serviceRoutes from './service';
import websiteRoutes from './website';
import generatorRoutes from './generator';

const victoriaRouter = Router();

// Mount all Victoria-related routes
victoriaRouter.use('/chat', chatRoutes);
victoriaRouter.use('/service', serviceRoutes);
victoriaRouter.use('/website', websiteRoutes);
victoriaRouter.use('/generator', generatorRoutes);

export default victoriaRouter;