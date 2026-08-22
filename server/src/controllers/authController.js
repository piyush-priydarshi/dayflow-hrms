import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Payroll from '../models/Payroll.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_jwt_secret_key_here', {
    expiresIn: '30d',
  });
};

export const signup = async (req, res) => {
  try {
    const { employeeId, name, email, password, role } = req.body;

    // Basic fields checking
    if (!employeeId || !name || !email || !password) {
      return res.status(400).json({ message: 'All fields (employeeId, name, email, password) are required' });
    }

    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Password regex validation (minimum 6 characters)
    const passwordRegex = /^.{6,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Checking for existing user by employeeId
    const employeeExists = await User.findOne({ employeeId });
    if (employeeExists) {
      return res.status(400).json({ message: 'Employee ID already registered' });
    }

    // Checking for existing user by email
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create user
    const user = await User.create({
      employeeId,
      name,
      email,
      password,
      role: role || 'Employee',
    });

    // Automatically initialize Profile for the new employee/admin
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

    // Automatically initialize basic Payroll structure for the new employee/admin
    await Payroll.create({
      user: user._id,
      baseSalary: 30000, // standard mock base salary
      allowances: 2000,
      deductions: 1000,
      netSalary: 31000,
    });

    res.status(201).json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Server error during signup', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role,
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
