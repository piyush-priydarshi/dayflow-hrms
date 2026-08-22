import mongoose from 'mongoose';

const payrollSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  employeeId: {
    type: String,
    required: false,
  },
  baseSalary: {
    type: Number,
    required: [true, 'Base salary is required'],
    default: 0,
  },
  allowances: {
    type: Number,
    default: 0,
  },
  deductions: {
    type: Number,
    default: 0,
  },
  netSalary: {
    type: Number,
    required: [true, 'Net salary is required'],
    default: 0,
  },
});

const Payroll = mongoose.model('Payroll', payrollSchema);
export default Payroll;
