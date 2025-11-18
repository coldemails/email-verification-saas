import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { uploadLimiter } from '../middleware/rateLimiter'; // ← ADD THIS
import {
  uploadCSV,
  createVerificationJob,
  getJobs,
  deleteJob,
  downloadResults,
  confirmEmailColumn
// 👈 added here
} from '../controllers/verifyController';

const router = Router();

// All routes require authentication
router.use(authenticate); 

// Upload routes with rate limiting
router.post('/upload', uploadLimiter as any, uploadCSV as any, createVerificationJob);
router.post('/confirm-column', uploadLimiter as any, uploadCSV as any, confirmEmailColumn);

// Get all jobs for user
router.get('/jobs', getJobs);

// Download job results
router.get('/jobs/:id/download', downloadResults);

// Delete job
router.delete('/jobs/:id', deleteJob);

export default router;
