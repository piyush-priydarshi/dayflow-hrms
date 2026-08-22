import express from 'express';
import { getProfiles, getProfileByUserId, updateProfileByUserId, updateProfileByAdmin } from '../controllers/profileController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, restrictTo('Admin'), getProfiles);
router.get('/:userId', protect, getProfileByUserId);
router.put('/admin/:userId', protect, restrictTo('Admin'), updateProfileByAdmin);
router.put('/:userId', protect, updateProfileByUserId);

export default router;
