import express from 'express';
import { applyLeave, getMyLeaves, getAllLeaves, updateLeaveStatus } from '../controllers/leaveController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, applyLeave);
router.get('/my', protect, getMyLeaves);
router.get('/all', protect, restrictTo('Admin'), getAllLeaves);
router.patch('/:leaveId/status', protect, restrictTo('Admin'), updateLeaveStatus);

export default router;
