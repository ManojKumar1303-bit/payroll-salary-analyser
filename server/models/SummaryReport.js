import mongoose from 'mongoose';

const summaryReportSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  totalEmployees: {
    type: Number,
    required: true,
  },
  totalSalary: {
    type: Number,
    required: true,
  },
  totalOvertime: {
    type: Number,
    required: true,
  },
  totalDeductions: {
    type: Number,
    required: true,
  },
  employees: {
    type: Array, // Array of finalized summary calculations per employee
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const SummaryReport = mongoose.model('SummaryReport', summaryReportSchema);

export default SummaryReport;
