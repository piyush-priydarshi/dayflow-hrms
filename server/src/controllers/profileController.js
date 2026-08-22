import Profile from '../models/Profile.js';
import User from '../models/User.js';

export const getProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', 'employeeId name email role');
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

    const profile = await Profile.findOne({ user: userId }).populate('user', 'employeeId name email role');
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json({ profile });
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
      const { phone, address, department, designation, joiningDate, profilePicture, name } = req.body;
      
      profile.phone = phone !== undefined ? phone : profile.phone;
      profile.address = address !== undefined ? address : profile.address;
      profile.department = department !== undefined ? department : profile.department;
      profile.designation = designation !== undefined ? designation : profile.designation;
      profile.joiningDate = joiningDate !== undefined ? joiningDate : profile.joiningDate;
      profile.profilePicture = profilePicture !== undefined ? profilePicture : profile.profilePicture;
      
      // If admin updates the name, update User model as well
      if (name !== undefined) {
        await User.findByIdAndUpdate(userId, { name });
      }
    } else {
      // Employee can ONLY update phone and address
      const { phone, address } = req.body;
      profile.phone = phone !== undefined ? phone : profile.phone;
      profile.address = address !== undefined ? address : profile.address;
    }

    await profile.save();
    const updatedProfile = await Profile.findOne({ user: userId }).populate('user', 'employeeId name email role');
    
    res.status(200).json({
      message: 'Profile updated successfully',
      profile: updatedProfile,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating profile', error: error.message });
  }
};
