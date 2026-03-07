import mongoose from 'mongoose';

/**
 * Employee Model
 * Stores employee salary and penalty configurations
 */
const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    dailySalary: {
      type: Number,
      required: true,
      min: 0,
    },
    latePenalty: {
      type: Number,
      required: true,
      min: 0,
      default: 50,
    },
    earlyLeavePenalty: {
      type: Number,
      required: true,
      min: 0,
      default: 50,
    },
    overtimeRate: {
      type: Number,
      required: true,
      min: 0,
      default: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;
