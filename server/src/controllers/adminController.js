import User from '../models/User.js';
import Leave from '../models/Leave.js';
import Attendance from '../models/Attendance.js';

export const getDashboardSummary = async (req, res) => {
  try {
    // 1. Total employees count
    const totalEmployees = await User.countDocuments({ role: 'Employee' });

    // 2. Pending leave requests count
    const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });

    // 3. Today's attendance percentage
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const presentCount = await Attendance.countDocuments({
      date: today,
      status: { $in: ['Present', 'Half-day'] }
    });

    const attendancePercent = totalEmployees > 0 
      ? Math.round((presentCount / totalEmployees) * 100) 
      : 0;

    res.status(200).json({
      summary: {
        totalEmployees,
        pendingLeaves,
        attendancePercent,
      }
    });
  } catch (error) {
    console.error('Admin Summary Error:', error);
    res.status(500).json({ message: 'Server error retrieving admin summary', error: error.message });
  }
};
