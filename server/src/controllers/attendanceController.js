import Attendance from '../models/Attendance.js';

// Normalize date to midnight to make daily lookups consistent
const getTodayDate = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

export const checkIn = async (req, res) => {
  try {
    const today = getTodayDate();

    // Check if record exists for today
    const existingRecord = await Attendance.findOne({ user: req.user._id, date: today });
    if (existingRecord) {
      return res.status(400).json({ message: 'Already checked in for today' });
    }

    const attendance = await Attendance.create({
      user: req.user._id,
      date: today,
      checkIn: new Date(),
      status: 'Present',
    });

    res.status(201).json({
      message: 'Checked in successfully',
      attendance,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during check-in', error: error.message });
  }
};

export const checkOut = async (req, res) => {
  try {
    const today = getTodayDate();

    const attendance = await Attendance.findOne({ user: req.user._id, date: today });
    if (!attendance) {
      return res.status(400).json({ message: 'No check-in record found for today. Please check-in first.' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ message: 'Already checked out for today' });
    }

    attendance.checkOut = new Date();
    await attendance.save();

    res.status(200).json({
      message: 'Checked out successfully',
      attendance,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during check-out', error: error.message });
  }
};

export const getMyAttendance = async (req, res) => {
  try {
    const attendanceRecords = await Attendance.find({ user: req.user._id }).sort({ date: -1 });
    res.status(200).json({ attendance: attendanceRecords });
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving attendance records', error: error.message });
  }
};

export const getAllAttendance = async (req, res) => {
  try {
    const attendanceRecords = await Attendance.find()
      .populate('user', 'employeeId name email role')
      .sort({ date: -1 });
    res.status(200).json({ attendance: attendanceRecords });
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving attendance records', error: error.message });
  }
};

export const getTodayStatus = async (req, res) => {
  try {
    const today = getTodayDate();
    const attendance = await Attendance.findOne({ user: req.user._id, date: today });
    res.status(200).json({ todayRecord: attendance });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching today status', error: error.message });
  }
};
