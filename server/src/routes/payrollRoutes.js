import express from 'express';
import { getMyPayroll, getPayrollByUserId, updatePayrollByUserId } from '../controllers/payrollController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.get('/my', protect, getMyPayroll);
router.get('/:userId', protect, restrictTo('Admin'), getPayrollByUserId);
router.put('/:userId', protect, restrictTo('Admin'), updatePayrollByUserId);

export default router;
