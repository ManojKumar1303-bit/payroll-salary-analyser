// @ts-nocheck
import ExcelJS from 'exceljs';
import { timeStringToDecimalHours } from '../utils/timeConverter.js';

/**
 * Parses biometric attendance Excel files
 * Skips first 3 rows (metadata) and reads from row 4 onwards
 * Handles flexible column naming and various date formats
 * 
 * OVERTIME HANDLING:
 * ==================
 * Supports multiple overtime columns that are automatically summed:
 * - "Overtime Duration"
 * - "Workday Overtime Duration"
 * - "Weekend Overtime Duration"
 * 
 * All overtime columns are converted from HH:mm format to decimal hours and summed.
 * Example: 02:59 + 00:45 + 01:10 = 2.983 + 0.75 + 1.167 = 4.9 total overtime hours
 * 
 * TIME CONVERSION:
 * ================
 * All duration fields (late, early leave, overtime) are converted to decimal hours:
 * - "02:59" → 2 + (59/60) → 2.983 hours
 * - "00:45" → 0 + (45/60) → 0.75 hours
 * - "01:10" → 1 + (10/60) → 1.167 hours
 */
export async function parseExcelFile(filePath) {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new Error('No worksheet found in Excel file');
    }

    const records = [];
    let headerMap = {};
    let headerRowFound = false;

    worksheet.eachRow((row, rowNumber) => {
    // Skip first 3 rows (metadata)
    if (rowNumber <= 3) {
      return;
    }

    // Row 4 contains headers
    if (rowNumber === 4) {
      const headers = [];
      row.eachCell((cell, colNumber) => {
        const headerValue = cell.value?.toString().trim().toLowerCase() || '';
        headers.push({
          index: colNumber - 1,
          value: headerValue
        });
      });

      // Map headers to standardized field names
      // NOTE: Overtime Duration is the TOTAL overtime - do NOT sum with Workday/Weekend breakdown columns
      
      headers.forEach((header) => {
        const h = header.value;
        
        if (h.includes('first') && h.includes('name')) {
          headerMap['firstName'] = header.index;
        } else if (h.includes('last') && h.includes('name')) {
          headerMap['lastName'] = header.index;
        } else if (h === 'id' || h === 'emp id' || h === 'employee id') {
          headerMap['id'] = header.index;
        } else if (h === 'department' || h === 'dept') {
          headerMap['department'] = header.index;
        } else if (h === 'date' || h.includes('attendance date')) {
          headerMap['date'] = header.index;
        } else if (h === 'weekday' || h === 'day') {
          headerMap['weekday'] = header.index;
        } else if (h === 'timetable' || h === 'shift' || h.includes('timetable')) {
          headerMap['timetable'] = header.index;
        } else if (h.includes('attendance') && h.includes('status')) {
          headerMap['attendanceStatus'] = header.index;
        } else if (h.includes('worked') && h.includes('hour')) {
          headerMap['workedHours'] = header.index;
        } else if (h.includes('absent') && h.includes('duration')) {
          headerMap['absentDuration'] = header.index;
        } else if (h.includes('late') && h.includes('duration')) {
          headerMap['lateDuration'] = header.index;
        } else if (h.includes('early') && (h.includes('leave') || h.includes('go') || h.includes('departure') || h.includes('exit'))) {
          headerMap['earlyLeaveDuration'] = header.index;
        } else if (h === 'overtime duration' || (h.includes('overtime') && h.includes('duration') && !h.includes('workday') && !h.includes('weekend'))) {
          // IMPORTANT: Only capture the main "Overtime Duration" column (total)
          // Ignore "Workday Overtime Duration" and "Weekend Overtime Duration" - they are breakdowns only
          headerMap['overtimeDuration'] = header.index;
        }
      });

      headerRowFound = true;
      // header parsing debug can be enabled with DEBUG_PARSE env var
      if (process.env.DEBUG_PARSE) {
        console.log('Parsed headers:', headerMap);
      }
      return;
    }

    // Skip if headers not found yet
    if (!headerRowFound) return;

    // Get cell value by field name
    const getCell = (fieldName) => {
      const index = headerMap[fieldName];
      if (index === undefined) return '';
      const cell = row.getCell(index + 1);
      return cell.value?.toString().trim() || '';
    };

    // Skip empty rows
    const firstName = getCell('firstName').trim();
    const id = getCell('id').trim();

    if (!firstName && !id) {
      return; // Skip empty rows
    }

    // Format the phone number or ID to remove special characters
    const cleanId = id.replace(/[^0-9a-zA-Z]/g, '');

    if (firstName || cleanId) {
      // Parse time durations and validate
      const lateDurationRaw = getCell('lateDuration') || '00:00';
      const earlyLeaveDurationRaw = getCell('earlyLeaveDuration') || '00:00';
      const overtimeDurationRaw = getCell('overtimeDuration') || '00:00';
      const workedHoursRaw = getCell('workedHours') || '00:00';

      const lateDurationDecimal = timeStringToDecimalHours(lateDurationRaw);
      const earlyLeaveDurationDecimal = timeStringToDecimalHours(earlyLeaveDurationRaw);
      const overtimeDurationDecimal = timeStringToDecimalHours(overtimeDurationRaw);
      
      // Convert workedHours to decimal (may be HH:mm format or already decimal)
      let workedHoursDecimal = 0;
      if (typeof workedHoursRaw === 'string' && workedHoursRaw.includes(':')) {
        // HH:mm format
        workedHoursDecimal = timeStringToDecimalHours(workedHoursRaw);
      } else if (!isNaN(workedHoursRaw)) {
        // Already numeric
        workedHoursDecimal = parseFloat(workedHoursRaw) || 0;
      }

      // Debug logging for overtime duration
      if (process.env.DEBUG_PARSE && overtimeDurationDecimal > 0) {
        console.log(`[Overtime Debug] ${cleanId || id} - ${formatDate(getCell('date'))} - Overtime Duration: "${overtimeDurationRaw}" = ${overtimeDurationDecimal.toFixed(2)} hours`);
      }

      const parsed = {
        firstName: firstName || '--',
        lastName: getCell('lastName') || '--',
        employeeId: cleanId || id,
        department: getCell('department') || '',
        date: formatDate(getCell('date')) || '',
        weekday: getCell('weekday') || '',
        timetable: getCell('timetable') || '',
        shift: extractShift(getCell('timetable')),
        attendanceStatus: getCell('attendanceStatus') || 'Normal',
        status: getCell('attendanceStatus') || 'Normal',
        workedHours: workedHoursDecimal,
        absentDuration: getCell('absentDuration') || '00:00',
        lateDuration: lateDurationDecimal,
        earlyLeaveDuration: earlyLeaveDurationDecimal,
        overtimeDuration: overtimeDurationDecimal,
      };

      // only push records that have both employeeId and date
      if (parsed.employeeId && parsed.date) {
        records.push(parsed);
      } else {
        console.warn('Skipping record with missing id or date:', parsed);
      }
    }
  });

  if (process.env.DEBUG_PARSE) {
    console.log(`Successfully parsed ${records.length} attendance records`);
    if (records.length > 0) {
      console.log(`Sample record:`, records[0]);
    }
  }
  return records;
  } catch (err) {
    // bubble a descriptive error up
    throw new Error(`Error parsing Excel file "${filePath}": ${err.message}`);
  }
}


/**
 * Format date from various formats
 */
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  
  // If already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  // Try to parse and reformatDate
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return dateStr;
};

/**
 * Extract shift from timetable string
 */
const extractShift = (timetable) => {
  if (!timetable) return 'Unknown';

  const timeStr = timetable.toLowerCase();

  if (timeStr.includes('shift-1') || timeStr.includes('shift 1')) {
    return 'SHIFT-1';
  }
  if (timeStr.includes('shift-2') || timeStr.includes('shift 2')) {
    return 'SHIFT-2';
  }
  if (timeStr.includes('08:00') && timeStr.includes('20:00')) {
    return 'SHIFT-1 (08:00-20:00)';
  }
  if (timeStr.includes('09:00') && timeStr.includes('18:00')) {
    return 'SHIFT-2 (09:00-18:00)';
  }

  return timetable;
};

/**
 * Extracts unique employees from attendance records
 */
export function extractUniqueEmployees(allRecords) {
  const employeeMap = new Map();

  allRecords.forEach((record) => {
    if (!employeeMap.has(record.employeeId)) {
      employeeMap.set(record.employeeId, {
        employeeId: record.employeeId,
        firstName: record.firstName,
        lastName: record.lastName,
        department: record.department,
      });
    }
  });

  return Array.from(employeeMap.values());
}
