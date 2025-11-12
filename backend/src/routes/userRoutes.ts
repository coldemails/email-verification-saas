import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  getCredits,
  generateApiKey,
  listApiKeys,
  deleteApiKey
} from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes are protected
router.use(authenticate);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/password', changePassword);

// Credits
router.get('/credits', getCredits);

// API Keys
router.get('/api-keys', listApiKeys);
router.post('/api-keys', generateApiKey);
router.delete('/api-keys/:id', deleteApiKey);

export default router;