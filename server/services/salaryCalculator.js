/**
 * Calculates daily salary for a single employee based on attendance record
 * 
 * Salary Calculation Rules:
 * ========================
 * 
 * If employee is ABSENT:
 *   Final Salary = ₹0
 *   Overtime = 0 (no overtime for absent employees)
 * 
 * If employee is PRESENT:
 *   Step 1: Base Salary = Daily Salary (configured per employee)
 *   Step 2: Late Deduction = Late Hours (decimal) × Late Penalty (₹50/hour)
 *   Step 3: Early Leave Deduction = Early Leave Hours (decimal) × Early Leave Penalty (₹50/hour)
 *   Step 4: Overtime Pay = Overtime Hours (from Excel) (decimal) × Overtime Rate (₹100/hour)
 *   
 *   Final Salary = Base Salary - Late Deduction - Early Leave Deduction + Overtime Payment
 * 
 * OVERTIME CALCULATION:
 * ====================
 * The "Overtime Duration" column in the Excel file contains the pre-calculated total overtime hours.
 * The system reads this column directly without recalculating or validating it.
 * 
 * The Excel file may contain additional columns for reference:
 * - "Workday Overtime Duration" - breakdown only (NOT USED in calculation)
 * - "Weekend Overtime Duration" - breakdown only (NOT USED in calculation)
 * 
 * Overtime Duration is in HH:mm format and must be converted to decimal hours:
 *   02:59 → 2 + (59/60) = 2.983 hours
 *   00:45 → 0 + (45/60) = 0.75 hours
 *   01:10 → 1 + (10/60) = 1.167 hours
 * 
 * Example Calculation:
 * ====================
 * Shift: SHIFT-2
 * Worked Hours: 11:59
 * Overtime Duration: 02:59 (from Excel)
 * Daily Salary: ₹300
 * Overtime Rate: ₹50/hour
 * Late: 00:30 → 0.5 × ₹50 = ₹25 deduction
 * Early Leave: 00:00 → 0 × ₹50 = ₹0 deduction
 * Overtime: 2.983 × ₹50 = ₹149.15 payment
 * Final = ₹300 - ₹25 - ₹0 + ₹149.15 = ₹424.15
 * 
 * @param {Object} record - Attendance record with overtimeDuration already converted to decimal hours
 * @param {number} employeeDailySalary - Base daily salary in rupees
 * @param {Object} penalties - { latePenalty: 50, earlyLeavePenalty: 50 }
 * @param {number} overtimeRate - Overtime rate per hour (e.g., 100)
 * @returns {Object} Daily salary calculation result with all deductions, payments, and final salary
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

  // Extract and ensure values are valid numbers (never NaN or negative)
  const lateDurationHours = Math.max(0, Number(record.lateDuration) || 0);
  const earlyLeaveDurationHours = Math.max(0, Number(record.earlyLeaveDuration) || 0);
  
  // Use the pre-calculated Overtime Duration from Excel (already converted to decimal hours by parser)
  // Ensure the value is valid and never negative
  // IMPORTANT: If overtime rate is 0 or undefined, ignore overtime completely
  let overtimeDurationHours = Math.max(0, Number(record.overtimeDuration) || 0);
  
  // If overtime rate is 0 or less, completely disregard overtime
  if (!overtimeRate || overtimeRate <= 0) {
    overtimeDurationHours = 0;
  }

  // Calculate deductions and additions
  const lateDeduction = lateDurationHours * latePenalty;
  const earlyLeaveDeduction = earlyLeaveDurationHours * earlyLeavePenalty;
  
  // Only calculate overtime payment if rate is greater than 0
  const overtimePayment = overtimeRate && overtimeRate > 0 
    ? overtimeDurationHours * overtimeRate 
    : 0;

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
      calculation: `${employeeDailySalary} - ${lateDeduction.toFixed(2)} - ${earlyLeaveDeduction.toFixed(2)} + ${overtimePayment.toFixed(2)} = ${finalSalary.toFixed(2)}`,
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
 * Validates and calculates overtime hours based on worked hours vs shift requirements
 * 
 * VALIDATION RULES:
 * - If absent: overtime = 0
 * - Get required shift hours based on shift type (12 for SHIFT-1, 9 for SHIFT-2, 8 for others)
 * - Calculate: overtime = worked hours - required shift hours
 * - Ensure overtime is never negative: Math.max(0, overtime)
 * 
 * WHY THIS APPROACH?
 * Excel may contain unreliable overtime columns or be missing data.
 * Calculating from worked hours ensures data integrity.
 * 
 * @param {Object} record - Attendance record with shift, workedHours, and status
 * @returns {number} Validated overtime hours (never negative)
 */
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
 * Processes attendance records using employee data from database
 * This function fetches employee configurations and calculates salaries
 * Returns calculated salaries and list of skipped employees (not in database)
 * 
 * @param {Array} records - Attendance records from Excel
 * @param {Array} employeeDocuments - Employee documents from MongoDB (keyed by employeeId)
 * @param {Object} penalties - Fallback penalties { latePenalty, earlyLeavePenalty }
 * @param {number} overtimeRate - Fallback overtime rate
 * @returns {Object} { dailySalaries, skippedEmployees }
 */
export const processDailyRecordsFromDB = (
  records,
  employeeDocuments,
  penalties,
  overtimeRate
) => {
  const dailySalaries = [];
  const skippedEmployees = new Set();

  records.forEach((record) => {
    const employee = employeeDocuments[record.employeeId];

    // If employee not found in database, skip this record
    if (!employee) {
      skippedEmployees.add(record.employeeId);
      return;
    }

    // Use employee database values
    const employeePenalties = {
      latePenalty: employee.latePenalty || penalties?.latePenalty || 50,
      earlyLeavePenalty: employee.earlyLeavePenalty || penalties?.earlyLeavePenalty || 50,
    };

    const employeeOvertimeRate = employee.overtimeRate || overtimeRate || 100;

    // Calculate salary using employee's configured daily salary
    const salaryRecord = calculateDailySalary(
      record,
      employee.dailySalary,
      employeePenalties,
      employeeOvertimeRate
    );

    dailySalaries.push(salaryRecord);
  });

  return {
    dailySalaries,
    skippedEmployees: Array.from(skippedEmployees),
  };
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

      // Debug logging for overtime aggregation
      if (salaryRecord.overtimeDuration > 0) {
        console.log(`[Summary Overtime] ${key} - OT Hours: ${salaryRecord.overtimeDuration}, Running Total: ${summary.totalOvertimeDuration}`);
      }

      if (salaryRecord.attendanceStatus?.toLowerCase().includes('absent')) {
        summary.numberOfAbsentDays += 1;
      }
    });
  });

  // Ensure all duration values are properly rounded
  const result = Array.from(summaryMap.values()).map(emp => ({
    ...emp,
    totalLateDuration: Math.round(emp.totalLateDuration * 100) / 100,
    totalEarlyLeaveDuration: Math.round(emp.totalEarlyLeaveDuration * 100) / 100,
    totalOvertimeDuration: Math.round(emp.totalOvertimeDuration * 100) / 100,
    totalSalary: Math.round(emp.totalSalary * 100) / 100,
  })).sort((a, b) =>
    a.employeeId.localeCompare(b.employeeId)
  );

  return result;
};
