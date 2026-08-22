import express from 'express';
import { checkIn, checkOut, getMyAttendance, getAllAttendance, getTodayStatus } from '../controllers/attendanceController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.post('/check-in', protect, checkIn);
router.post('/check-out', protect, checkOut);
router.get('/my', protect, getMyAttendance);
router.get('/today', protect, getTodayStatus);
router.get('/all', protect, restrictTo('Admin'), getAllAttendance);

export default router;
