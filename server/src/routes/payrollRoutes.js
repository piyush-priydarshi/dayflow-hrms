import express from 'express';
import { getMyPayroll, getPayrollByUserId, updatePayrollByUserId, generatePayslipPdf } from '../controllers/payrollController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.get('/my', protect, getMyPayroll);
router.get('/:userId', protect, getPayrollByUserId);
router.put('/:userId', protect, restrictTo('Admin'), updatePayrollByUserId);
router.get('/:userId/payslip', protect, generatePayslipPdf);

export default router;
