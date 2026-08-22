import Payroll from '../models/Payroll.js';

export const getMyPayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findOne({ user: req.user._id });
    if (!payroll) {
      // Return a blank default if not created yet
      return res.status(200).json({
        payroll: {
          user: req.user._id,
          baseSalary: 0,
          allowances: 0,
          deductions: 0,
          netSalary: 0,
        },
      });
    }
    res.status(200).json({ payroll });
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving payroll', error: error.message });
  }
};

export const getPayrollByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check authority: Employee can only fetch their own payroll
    if (req.user.role !== 'Admin' && req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied: cannot view other employee payroll details' });
    }

    const payroll = await Payroll.findOne({ user: userId });
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll details not found for this user' });
    }

    res.status(200).json({ payroll });
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving payroll', error: error.message });
  }
};

export const updatePayrollByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const { baseSalary, allowances, deductions } = req.body;

    if (baseSalary === undefined) {
      return res.status(400).json({ message: 'baseSalary is required for update' });
    }

    const parsedBase = Number(baseSalary);
    const parsedAllowances = Number(allowances || 0);
    const parsedDeductions = Number(deductions || 0);
    const computedNetSalary = parsedBase + parsedAllowances - parsedDeductions;

    let payroll = await Payroll.findOne({ user: userId });
    if (!payroll) {
      // Create new payroll record
      payroll = new Payroll({
        user: userId,
        baseSalary: parsedBase,
        allowances: parsedAllowances,
        deductions: parsedDeductions,
        netSalary: computedNetSalary,
      });
    } else {
      // Update existing
      payroll.baseSalary = parsedBase;
      payroll.allowances = parsedAllowances;
      payroll.deductions = parsedDeductions;
      payroll.netSalary = computedNetSalary;
    }

    await payroll.save();
    res.status(200).json({
      message: 'Payroll details updated successfully',
      payroll,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating payroll details', error: error.message });
  }
};
