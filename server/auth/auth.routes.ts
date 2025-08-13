import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authLimiter } from './auth.service';

const router = Router();

// Apply rate limiting to auth routes
router.use(authLimiter);

// Auth routes
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/user', AuthController.getCurrentUser);

export default router;