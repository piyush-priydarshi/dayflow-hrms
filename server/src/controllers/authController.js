import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Payroll from '../models/Payroll.js';

// Embed both ID and role in JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'your_jwt_secret_key_here',
    { expiresIn: '30d' }
  );
};

export const signup = async (req, res) => {
  try {
    const { employeeId, name, email, password, role } = req.body;

    // Basic fields check
    if (!employeeId || !name || !email || !password) {
      return res.status(400).json({ message: 'All fields (employeeId, name, email, password) are required' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Password rules: min 8 chars, at least 1 number, at least 1 special char
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }
    if (!/\d/.test(password)) {
      return res.status(400).json({ message: 'Password must contain at least 1 number' });
    }
    if (!/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\\/~`]/.test(password)) {
      return res.status(400).json({ message: 'Password must contain at least 1 special character' });
    }

    // Duplicate Employee ID check
    const employeeExists = await User.findOne({ employeeId: employeeId.trim() });
    if (employeeExists) {
      return res.status(400).json({ message: 'Employee ID already registered' });
    }

    // Duplicate Email check
    const emailExists = await User.findOne({ email: email.trim().toLowerCase() });
    if (emailExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create user directly (stored directly, isVerified: true, no verification link required)
    const user = await User.create({
      employeeId: employeeId.trim(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: role || 'Employee',
      isVerified: true,
    });

    // Automatically initialize Profile
    await Profile.create({
      user: user._id,
      phone: '',
      address: '',
      department: 'General',
      designation: role === 'Admin' ? 'Administrator' : 'Staff',
      joiningDate: new Date(),
      documents: [],
      profilePicture: '',
    });

    // Automatically initialize basic Payroll structure (read-only reference)
    await Payroll.create({
      user: user._id,
      baseSalary: 30000,
      allowances: 2000,
      deductions: 1000,
      netSalary: 31000,
    });

    res.status(201).json({
      message: 'Account created successfully!',
      user: {
        _id: user._id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: true,
      },
    });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Server error during signup', error: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const token = req.query.token || req.body.token;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.status(200).json({
      message: 'Email verified successfully! You can now log in.',
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: true,
      },
    });
  } catch (error) {
    console.error('Email Verification Error:', error);
    res.status(500).json({ message: 'Server error during email verification', error: error.message });
  }
};

export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'Email is not registered' });
    }

    res.status(200).json({
      message: 'Account is verified and ready for login.',
    });
  } catch (error) {
    console.error('Resend Verification Error:', error);
    res.status(500).json({ message: 'Server error resending verification email', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Unregistered email check
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'Email is not registered' });
    }

    // Password verification check
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    res.status(200).json({
      token: generateToken(user),
      user: {
        _id: user._id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: true,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    res.status(200).json({ user: req.user });
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving user data', error: error.message });
  }
};
