import express from 'express';
import { getDashboardSummary } from '../controllers/adminController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.get('/summary', protect, restrictTo('Admin'), getDashboardSummary);

export default router;
