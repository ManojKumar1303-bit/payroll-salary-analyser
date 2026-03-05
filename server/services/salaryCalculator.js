/**
 * Calculates daily salary for a single employee based on attendance record
 * 
 * Salary Calculation Rules:
 * ========================
 * 
 * If employee is ABSENT:
 *   Final Salary = ₹0
 * 
 * If employee is PRESENT:
 *   Step 1: Base Salary = Daily Salary (configured per employee)
 *   Step 2: Late Deduction = Late Hours (decimal) × Late Penalty (₹50/hour)
 *   Step 3: Early Leave Deduction = Early Leave Hours (decimal) × Early Leave Penalty (₹50/hour)
 *   Step 4: Overtime Pay = Overtime Hours (decimal) × Overtime Rate (₹100/hour)
 *   
 *   Final Salary = Base Salary - Late Deduction - Early Leave Deduction + Overtime Pay
 * 
 * Example Calculation:
 * ===================
 * Daily Salary: ₹300
 * Late: 01:00 (1.0 hour) → 1.0 × ₹50 = ₹50 deduction
 * Early Leave: 00:30 (0.5 hours) → 0.5 × ₹50 = ₹25 deduction
 * Overtime: 00:00 (0 hours) → 0 × ₹100 = ₹0 payment
 * 
 * Final = ₹300 - ₹50 - ₹25 + ₹0 = ₹225
 * 
 * @param {Object} record - Attendance record with duration fields already converted to decimal hours
 * @param {number} employeeDailySalary - Base daily salary in rupees
 * @param {Object} penalties - { latePenalty: 50, earlyLeavePenalty: 50 }
 * @param {number} overtimeRate - Overtime rate per hour (e.g., 100)
 * @returns {Object} Daily salary calculation result
 */
export const calculateDailySalary = (
  record,
  employeeDailySalary,
  penalties,
  overtimeRate
) => {
  // Extract penalties with defaults
  const { latePenalty = 50, earlyLeavePenalty = 50 } = penalties || {};

  // Validate input
  if (!record || typeof employeeDailySalary !== 'number') {
    console.warn('Invalid input for calculateDailySalary:', { record, employeeDailySalary });
    return null;
  }

  // Check if absent (handle both attendanceStatus and status fields)
  const status = record.attendanceStatus || record.status || 'Normal';
  const isAbsent = status?.toLowerCase?.()?.includes('absent') || false;

  // If absent, salary is 0
  if (isAbsent) {
    return {
      employeeId: record.employeeId,
      firstName: record.firstName,
      lastName: record.lastName,
      shift: record.shift || getShiftType(record.timetable),
      date: record.date,
      lateDuration: 0,
      earlyLeaveDuration: 0,
      overtimeDuration: 0,
      baseSalary: employeeDailySalary,
      lateDeduction: 0,
      earlyLeaveDeduction: 0,
      overtimePayment: 0,
      finalSalary: 0,
      attendanceStatus: 'Absent',
    };
  }

  // Ensure duration values are numbers (should be decimal hours from excelParser)
  // These are already converted from HH:MM to decimal hours by timeStringToDecimalHours
  const lateDurationHours = Number(record.lateDuration) || 0;
  const earlyLeaveDurationHours = Number(record.earlyLeaveDuration) || 0;
  const overtimeDurationHours = Number(record.overtimeDuration) || 0;

  // Calculate deductions and additions
  const lateDeduction = lateDurationHours * latePenalty;
  const earlyLeaveDeduction = earlyLeaveDurationHours * earlyLeavePenalty;
  const overtimePayment = overtimeDurationHours * overtimeRate;

  // Final Salary = Base Salary - Late Deduction - Early Leave Deduction + Overtime Payment
  const finalSalary =
    employeeDailySalary -
    lateDeduction -
    earlyLeaveDeduction +
    overtimePayment;

  // Debug log for verification (can be enabled with DEBUG_SALARY env var)
  if (process.env.DEBUG_SALARY) {
    console.log(`[Salary Calc] ${record.employeeId} - ${record.date}:`, {
      baseSalary: employeeDailySalary,
      lateDuration: lateDurationHours.toFixed(2),
      earlyLeaveDuration: earlyLeaveDurationHours.toFixed(2),
      overtimeDuration: overtimeDurationHours.toFixed(2),
      lateDeduction: lateDeduction.toFixed(2),
      earlyLeaveDeduction: earlyLeaveDeduction.toFixed(2),
      overtimePayment: overtimePayment.toFixed(2),
      finalSalary: Math.max(0, finalSalary).toFixed(2),
    });
  }

  return {
    employeeId: record.employeeId,
    firstName: record.firstName,
    lastName: record.lastName,
    shift: record.shift || getShiftType(record.timetable),
    date: record.date,
    lateDuration: lateDurationHours,
    earlyLeaveDuration: earlyLeaveDurationHours,
    overtimeDuration: overtimeDurationHours,
    baseSalary: employeeDailySalary,
    lateDeduction: Math.round(lateDeduction * 100) / 100, // Round to 2 decimal places
    earlyLeaveDeduction: Math.round(earlyLeaveDeduction * 100) / 100,
    overtimePayment: Math.round(overtimePayment * 100) / 100,
    finalSalary: Math.max(0, Math.round(finalSalary * 100) / 100), // Round to 2 decimal places, ensure non-negative
    attendanceStatus: status || 'Normal',
  };
};

/**
 * Determines shift type from timetable string
 */
const getShiftType = (timetable) => {
  if (!timetable) return 'Unknown';

  const timeStr = timetable.toLowerCase();

  // Shift 1: 08:00 - 20:00
  if (timeStr.includes('08:00') || timeStr.includes('08:00 - 20:00')) {
    return 'Shift 1 (08:00-20:00)';
  }

  // Shift 2: 09:00 - 18:00
  if (timeStr.includes('09:00') || timeStr.includes('09:00 - 18:00')) {
    return 'Shift 2 (09:00-18:00)';
  }

  return timetable;
};

/**
 * Processes multiple attendance records and calculates daily salaries
 */
export const processDailyRecords = (
  records,
  employeeSalaries,
  penalties,
  overtimeRate
) => {
  return records.map((record) => {
    const salary = employeeSalaries[record.employeeId] || 0;
    return calculateDailySalary(record, salary, penalties, overtimeRate);
  });
};

/**
 * Generates a combined summary across multiple days
 */
export const generateSalarySummary = (dailyReports) => {
  const summaryMap = new Map();

  // Flatten all daily reports and aggregate by employee
  dailyReports.forEach((dayReport) => {
    dayReport.forEach((salaryRecord) => {
      const key = salaryRecord.employeeId;

      if (!summaryMap.has(key)) {
        summaryMap.set(key, {
          employeeId: salaryRecord.employeeId,
          firstName: salaryRecord.firstName,
          lastName: salaryRecord.lastName,
          totalDaysProcessed: 0,
          totalLateDuration: 0,
          totalEarlyLeaveDuration: 0,
          totalOvertimeDuration: 0,
          totalSalary: 0,
          numberOfAbsentDays: 0,
        });
      }

      const summary = summaryMap.get(key);
      summary.totalDaysProcessed += 1;
      summary.totalLateDuration += salaryRecord.lateDuration;
      summary.totalEarlyLeaveDuration += salaryRecord.earlyLeaveDuration;
      summary.totalOvertimeDuration += salaryRecord.overtimeDuration;
      summary.totalSalary += salaryRecord.finalSalary;

      if (salaryRecord.attendanceStatus?.toLowerCase().includes('absent')) {
        summary.numberOfAbsentDays += 1;
      }
    });
  });

  return Array.from(summaryMap.values()).sort((a, b) =>
    a.employeeId.localeCompare(b.employeeId)
  );
};
