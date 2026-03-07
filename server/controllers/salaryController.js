import {
  processDailyRecords,
  processDailyRecordsFromDB,
  generateSalarySummary,
} from '../services/salaryCalculator.js';
import { getSessionData, setSessionData } from './uploadController.js';
import Employee from '../models/Employee.js';
import ExcelJS from 'exceljs';
import { decimalHoursToTimeString } from '../utils/timeConverter.js';

/**
 * Calculate salary based on uploaded files and salary settings
 * Supports both:
 * 1. Manual employee salary entry (legacy) - when employeeSalaries is provided
 * 2. Database-driven employee configuration - when useDatabase flag is true
 */
export const calculateSalary = async (req, res) => {
  try {
    const { employeeSalaries, penalties, overtimeRate, useDatabase } = req.body;

    const sessionData = getSessionData();

    if (sessionData.allAttendanceRecords.length === 0) {
      return res
        .status(400)
        .json({ error: 'No attendance records found. Please upload files first.' });
    }

    // Group records by date
    const recordsByDate = {};
    sessionData.allAttendanceRecords.forEach((record) => {
      if (!recordsByDate[record.date]) {
        recordsByDate[record.date] = [];
      }
      recordsByDate[record.date].push(record);
    });

    let dailyReports = [];
    let skippedEmployees = [];

    // Use database-driven employee configuration
    if (useDatabase) {
      try {
        // Fetch all active employees from database
        const employeeDocs = await Employee.find({ isActive: true });
        
        // Create a map for quick lookup
        const employeeMap = {};
        employeeDocs.forEach((emp) => {
          employeeMap[emp.employeeId] = {
            dailySalary: emp.dailySalary,
            latePenalty: emp.latePenalty,
            earlyLeavePenalty: emp.earlyLeavePenalty,
            overtimeRate: emp.overtimeRate,
          };
        });

        // Calculate salary for each day
        Object.keys(recordsByDate).forEach((date) => {
          const dayRecords = recordsByDate[date];
          const result = processDailyRecordsFromDB(
            dayRecords,
            employeeMap,
            penalties,
            overtimeRate
          );
          dailyReports.push(result.dailySalaries);
          skippedEmployees.push(...result.skippedEmployees);
        });

        // Remove duplicate skipped employees
        skippedEmployees = [...new Set(skippedEmployees)];
      } catch (error) {
        console.error('Error fetching employees from database:', error);
        return res.status(500).json({
          error: 'Failed to fetch employee configuration from database',
        });
      }
    } else {
      // Legacy: Use manually provided employee salaries
      if (!employeeSalaries || Object.keys(employeeSalaries).length === 0) {
        return res.status(400).json({
          error: 'Employee salaries are required when not using database',
        });
      }

      // Calculate salary for each day using manual entry
      Object.keys(recordsByDate).forEach((date) => {
        const dayRecords = recordsByDate[date];
        const dailySalaries = processDailyRecords(
          dayRecords,
          employeeSalaries,
          penalties,
          overtimeRate
        );
        dailyReports.push(dailySalaries);
      });
    }

    // Generate summary
    const summary = generateSalarySummary(dailyReports);

    // Store in session for report retrieval
    const storedReports = {
      ...sessionData,
      dailyReports,
      summary,
      penalties,
      overtimeRate,
      useDatabase,
      skippedEmployees,
      calculationDate: new Date().toISOString(),
    };

    setSessionData(storedReports);

    res.json({
      success: true,
      message: 'Salary calculated successfully',
      dailyReports,
      summary,
      skippedEmployees: skippedEmployees.length > 0 ? skippedEmployees : undefined,
    });
  } catch (error) {
    console.error('Error in calculateSalary:', error);
    res.status(500).json({ error: 'Failed to calculate salary' });
  }
};

/**
 * Get previously calculated reports
 */
export const getReports = (req, res) => {
  const sessionData = getSessionData();

  if (!sessionData.dailyReports || sessionData.dailyReports.length === 0) {
    return res.status(400).json({
      error: 'No calculated reports found. Please calculate salary first.',
    });
  }

  res.json({
    uploadDate: sessionData.uploadDate,
    filesProcessed: sessionData.uploadedFiles.length,
    totalEmployees: sessionData.uniqueEmployees.length,
    calculationDate: sessionData.calculationDate,
    dailyReports: sessionData.dailyReports,
    summary: sessionData.summary,
    penalties: sessionData.penalties,
    overtimeRate: sessionData.overtimeRate,
    useDatabase: sessionData.useDatabase,
    skippedEmployees: sessionData.skippedEmployees || [],
  });
};

/**
 * Export salary report as Excel file
 */
export const exportSalaryReport = (req, res) => {
  try {
    const sessionData = getSessionData();

    if (!sessionData.dailyReports || sessionData.dailyReports.length === 0) {
      return res.status(400).json({
        error: 'No calculated reports found. Please calculate salary first.',
      });
    }

    const workbook = new ExcelJS.Workbook();

    // Create Daily Reports sheet
    const dailySheet = workbook.addWorksheet('Daily Reports');
    dailySheet.columns = [
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Employee ID', key: 'employeeId', width: 15 },
      { header: 'Employee Name', key: 'employeeName', width: 20 },
      { header: 'Shift', key: 'shift', width: 20 },
      { header: 'Late Duration (hrs)', key: 'lateDuration', width: 15 },
      { header: 'Early Leave Duration (hrs)', key: 'earlyLeaveDuration', width: 18 },
      { header: 'Overtime Duration (hrs)', key: 'overtimeDuration', width: 18 },
      { header: 'Base Salary', key: 'baseSalary', width: 15 },
      { header: 'Late Deduction', key: 'lateDeduction', width: 15 },
      { header: 'Early Leave Deduction', key: 'earlyLeaveDeduction', width: 18 },
      { header: 'Overtime Payment', key: 'overtimePayment', width: 15 },
      { header: 'Final Salary', key: 'finalSalary', width: 15 },
      { header: 'Status', key: 'attendanceStatus', width: 12 },
    ];

    sessionData.dailyReports.forEach((dayReport) => {
      dayReport.forEach((record) => {
        dailySheet.addRow({
          date: record.date,
          employeeId: record.employeeId,
          employeeName: `${record.firstName} ${record.lastName}`,
          shift: record.shift,
          lateDuration: record.lateDuration.toFixed(2),
          earlyLeaveDuration: record.earlyLeaveDuration.toFixed(2),
          overtimeDuration: record.overtimeDuration.toFixed(2),
          baseSalary: record.baseSalary,
          lateDeduction: record.lateDeduction.toFixed(2),
          earlyLeaveDeduction: record.earlyLeaveDeduction.toFixed(2),
          overtimePayment: record.overtimePayment.toFixed(2),
          finalSalary: record.finalSalary.toFixed(2),
          attendanceStatus: record.attendanceStatus,
        });
      });
    });

    // Create Summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Employee ID', key: 'employeeId', width: 15 },
      { header: 'Employee Name', key: 'employeeName', width: 20 },
      { header: 'Days Processed', key: 'totalDaysProcessed', width: 15 },
      { header: 'Absent Days', key: 'numberOfAbsentDays', width: 12 },
      { header: 'Total Late Hours', key: 'totalLateDuration', width: 15 },
      { header: 'Total Early Leave Hours', key: 'totalEarlyLeaveDuration', width: 20 },
      { header: 'Total Overtime Hours', key: 'totalOvertimeDuration', width: 18 },
      { header: 'Total Salary', key: 'totalSalary', width: 15 },
    ];

    sessionData.summary.forEach((record) => {
      summarySheet.addRow({
        employeeId: record.employeeId,
        employeeName: `${record.firstName} ${record.lastName}`,
        totalDaysProcessed: record.totalDaysProcessed,
        numberOfAbsentDays: record.numberOfAbsentDays,
        totalLateDuration: record.totalLateDuration.toFixed(2),
        totalEarlyLeaveDuration: record.totalEarlyLeaveDuration.toFixed(2),
        totalOvertimeDuration: record.totalOvertimeDuration.toFixed(2),
        totalSalary: record.totalSalary.toFixed(2),
      });
    });

    // Apply styling
    [dailySheet, summarySheet].forEach((sheet) => {
      sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF366092' },
      };
    });

    // Generate file
    const fileName = `Salary_Report_${new Date().getTime()}.xlsx`;
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${fileName}"`
    );

    workbook.xlsx.write(res).then(() => {
      res.end();
    });
  } catch (error) {
    console.error('Error in exportSalaryReport:', error);
    res.status(500).json({ error: 'Failed to export salary report' });
  }
};
