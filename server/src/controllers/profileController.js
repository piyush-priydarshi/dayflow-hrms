import Profile from '../models/Profile.js';
import User from '../models/User.js';
import Payroll from '../models/Payroll.js';

export const getProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', 'employeeId name email role isVerified');
    res.status(200).json({ profiles });
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving profiles', error: error.message });
  }
};

export const getProfileByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check authority: Employee can only fetch their own profile
    if (req.user.role !== 'Admin' && req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied: cannot view other employee profiles' });
    }

    const profile = await Profile.findOne({ user: userId }).populate('user', 'employeeId name email role isVerified');
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Read-only pull from Payroll schema
    const payroll = await Payroll.findOne({ user: userId }).select('baseSalary allowances deductions netSalary');

    res.status(200).json({
      profile,
      payroll: payroll || {
        baseSalary: 0,
        allowances: 0,
        deductions: 0,
        netSalary: 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving profile', error: error.message });
  }
};

export const updateProfileByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check authority: Employee can only update their own profile
    if (req.user.role !== 'Admin' && req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied: cannot update other employee profiles' });
    }

    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    if (req.user.role === 'Admin') {
      // Admin can update all fields
      const { name, phone, address, department, designation, joiningDate, profilePicture, documents } = req.body;
      
      if (phone !== undefined) profile.phone = phone;
      if (address !== undefined) profile.address = address;
      if (department !== undefined) profile.department = department;
      if (designation !== undefined) profile.designation = designation;
      if (joiningDate !== undefined) profile.joiningDate = joiningDate;
      if (profilePicture !== undefined) profile.profilePicture = profilePicture;
      if (documents !== undefined && Array.isArray(documents)) profile.documents = documents;
      
      // If admin updates the name, update User model as well
      if (name !== undefined && name.trim()) {
        await User.findByIdAndUpdate(userId, { name: name.trim() });
      }
    } else {
      // Employee can ONLY update phone, address, and profilePicture
      const { phone, address, profilePicture, documents } = req.body;
      if (phone !== undefined) profile.phone = phone;
      if (address !== undefined) profile.address = address;
      if (profilePicture !== undefined) profile.profilePicture = profilePicture;
      if (documents !== undefined && Array.isArray(documents)) profile.documents = documents;
    }

    await profile.save();
    const updatedProfile = await Profile.findOne({ user: userId }).populate('user', 'employeeId name email role isVerified');
    const payroll = await Payroll.findOne({ user: userId }).select('baseSalary allowances deductions netSalary');
    
    res.status(200).json({
      message: 'Profile updated successfully',
      profile: updatedProfile,
      payroll: payroll || null,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating profile', error: error.message });
  }
};

// Admin-only explicit endpoint to edit all fields for any employee
export const updateProfileByAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, phone, address, department, designation, joiningDate, profilePicture, documents, role } = req.body;

    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    if (phone !== undefined) profile.phone = phone;
    if (address !== undefined) profile.address = address;
    if (department !== undefined) profile.department = department;
    if (designation !== undefined) profile.designation = designation;
    if (joiningDate !== undefined) profile.joiningDate = joiningDate;
    if (profilePicture !== undefined) profile.profilePicture = profilePicture;
    if (documents !== undefined && Array.isArray(documents)) profile.documents = documents;

    // Update User model fields if provided
    const userUpdate = {};
    if (name !== undefined && name.trim()) userUpdate.name = name.trim();
    if (role !== undefined && ['Employee', 'Admin'].includes(role)) userUpdate.role = role;
    if (Object.keys(userUpdate).length > 0) {
      await User.findByIdAndUpdate(userId, userUpdate);
    }

    await profile.save();
    const updatedProfile = await Profile.findOne({ user: userId }).populate('user', 'employeeId name email role isVerified');
    const payroll = await Payroll.findOne({ user: userId }).select('baseSalary allowances deductions netSalary');

    res.status(200).json({
      message: 'Profile updated successfully by Admin',
      profile: updatedProfile,
      payroll: payroll || null,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating profile as admin', error: error.message });
  }
};
