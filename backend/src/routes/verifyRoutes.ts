import { Router } from 'express';
import { authenticate } from '../middleware/auth';
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

// Upload CSV and create job
router.post('/upload', uploadCSV as any, createVerificationJob);

// Confirm email column if auto-detect fails
// Confirm email column if auto-detect fails
router.post('/confirm-column', uploadCSV as any, confirmEmailColumn); // 👈 new endpoint

// Get all jobs for user
router.get('/jobs', getJobs);

// Download job results
router.get('/jobs/:id/download', downloadResults);

// Delete job
router.delete('/jobs/:id', deleteJob);

export default router;
