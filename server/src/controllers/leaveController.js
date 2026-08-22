import Leave from '../models/Leave.js';

export const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, remarks } = req.body;

    if (!leaveType || !startDate || !endDate) {
      return res.status(400).json({ message: 'leaveType, startDate, and endDate are required' });
    }

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ message: 'Start date cannot be after end date' });
    }

    const leave = await Leave.create({
      user: req.user._id,
      leaveType,
      startDate,
      endDate,
      remarks: remarks || '',
      status: 'Pending',
    });

    res.status(201).json({
      message: 'Leave applied successfully',
      leave,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error applying for leave', error: error.message });
  }
};

export const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ leaves });
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving leaves', error: error.message });
  }
};

export const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate('user', 'employeeId name email role')
      .sort({ createdAt: -1 });
    res.status(200).json({ leaves });
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving leaves', error: error.message });
  }
};

export const updateLeaveStatus = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status } = req.body;

    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Valid status (Approved or Rejected) is required' });
    }

    const leave = await Leave.findById(leaveId);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    leave.status = status;
    await leave.save();

    const updatedLeave = await Leave.findById(leaveId).populate('user', 'employeeId name email role');

    res.status(200).json({
      message: `Leave request has been ${status.toLowerCase()}`,
      leave: updatedLeave,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating leave status', error: error.message });
  }
};
