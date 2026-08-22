import Payroll from '../models/Payroll.js';
import User from '../models/User.js';
import PDFDocument from 'pdfkit';

export const getMyPayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findOne({ user: req.user._id });
    if (!payroll) {
      // Return a blank default if not created yet
      return res.status(200).json({
        payroll: {
          user: req.user._id,
          employeeId: req.user.employeeId,
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

    // Fetch user info to ensure employeeId matches
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'Target employee not found' });
    }
    const empId = targetUser.employeeId;

    let payroll = await Payroll.findOne({ user: userId });
    if (!payroll) {
      // Create new payroll record
      payroll = new Payroll({
        user: userId,
        employeeId: empId,
        baseSalary: parsedBase,
        allowances: parsedAllowances,
        deductions: parsedDeductions,
        netSalary: computedNetSalary,
      });
    } else {
      // Update existing
      payroll.employeeId = empId;
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

// Generates a lightweight PDF payslip for a given employee and month
export const generatePayslipPdf = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check authority: Employee can only fetch their own payslip
    if (req.user.role !== 'Admin' && req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied: cannot view other employee payslip' });
    }

    const payroll = await Payroll.findOne({ user: userId });
    const employeeUser = await User.findById(userId);

    if (!employeeUser) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const baseVal = payroll ? payroll.baseSalary : 0;
    const allowVal = payroll ? payroll.allowances : 0;
    const deductVal = payroll ? payroll.deductions : 0;
    const netVal = payroll ? payroll.netSalary : 0;

    // Create PDF Document
    const doc = new PDFDocument({ margin: 50 });

    // Set Response Headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=payslip_${employeeUser.employeeId}.pdf`);

    // Pipe PDF generation response
    doc.pipe(res);

    // Header title
    doc.fontSize(24).font('Helvetica-Bold').text('DayFlow HRMS', { align: 'center' });
    doc.fontSize(14).font('Helvetica').text('Monthly Employee Payslip', { align: 'center' });
    doc.moveDown(2);

    // Employee Details Section
    doc.fontSize(12).font('Helvetica-Bold').text('Employee Information');
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#ccc').stroke();
    doc.moveDown(0.5);

    doc.font('Helvetica').fontSize(10);
    doc.text(`Employee Name: ${employeeUser.name}`);
    doc.text(`Employee ID: ${employeeUser.employeeId}`);
    doc.text(`Email: ${employeeUser.email}`);
    doc.text(`Date of Issue: ${new Date().toLocaleDateString()}`);
    doc.moveDown(2);

    // Salary Details Section
    doc.fontSize(12).font('Helvetica-Bold').text('Earnings & Deductions Breakdown');
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#ccc').stroke();
    doc.moveDown(0.5);

    doc.font('Helvetica').fontSize(10);
    doc.text(`Base Salary: $${baseVal.toLocaleString()}`, { indent: 20 });
    doc.text(`Allowances: $${allowVal.toLocaleString()}`, { indent: 20 });
    doc.text(`Deductions: $${deductVal.toLocaleString()}`, { indent: 20 });
    doc.moveDown(1);

    // Total Net Salary
    doc.fontSize(12).font('Helvetica-Bold').text(`Net Salary: $${netVal.toLocaleString()}`, { align: 'right' });
    doc.moveDown(4);

    // Signature placeholders
    doc.font('Helvetica').fontSize(10);
    const startY = doc.y;
    doc.text('-----------------------------', 100, startY, { lineBreak: false });
    doc.text('-----------------------------', 380, startY);
    doc.text('Employee Signature', 120, startY + 15, { lineBreak: false });
    doc.text('Authorized HR Signatory', 390, startY + 15);

    doc.end();
  } catch (error) {
    console.error('PDF Generation Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server error generating PDF payslip', error: error.message });
    }
  }
};
