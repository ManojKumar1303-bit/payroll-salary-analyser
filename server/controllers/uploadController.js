import { parseExcelFile, extractUniqueEmployees } from '../services/excelParser.js';
import { unlink } from 'fs/promises';

// Store uploaded data in memory during session
let sessionData = {
  uploadedFiles: [],
  allAttendanceRecords: [],
  uniqueEmployees: [],
  uploadDate: null,
};

/**
 * Handle multiple file uploads and parse attendance data
 */
export const uploadAttendanceFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const newRecords = [];
    const processedFileNames = [];

    // Process each uploaded file
    for (const file of req.files) {
      try {
        const records = await parseExcelFile(file.path);
        newRecords.push(...records);
        processedFileNames.push(file.originalname);

        // Delete the temporary uploaded file after successful parsing to avoid
        // filling the server disk. This is important for ephemeral hosts.
        try {
          await unlink(file.path);
        } catch (delErr) {
          console.warn(`Failed to delete temp file ${file.path}:`, delErr.message || delErr);
        }
      } catch (error) {
        console.error(`Error processing file ${file.originalname}:`, error);
        // Attempt to delete the file even if parsing failed
        try {
          await unlink(file.path);
        } catch (delErr) {
          console.warn(`Failed to delete temp file ${file.path}:`, delErr.message || delErr);
        }
        // Continue with other files even if one fails
      }
    }

    if (newRecords.length === 0) {
      return res.status(400).json({ error: 'No valid records found in uploaded files' });
    }

    // Merge new uploads into existing session data so reports aggregate.
    // Deduplicate records by employeeId + date + shift. Prefer incoming (new) records when duplicates exist.
    const recordKey = (r) => `${r.employeeId}|${r.date}|${r.shift}`;

    const mergedMap = new Map();
    // Start with existing records (ignore empty dates just in case)
    sessionData.allAttendanceRecords
      .filter((r) => r.date)
      .forEach((r) => {
        mergedMap.set(recordKey(r), r);
      });

    // Track overlapping dates for informational warning
    const existingDates = new Set(
      sessionData.allAttendanceRecords
        .filter((r) => r.date)
        .map((r) => r.date)
    );
    const newDates = new Set(newRecords.map((r) => r.date));
    const overlappingDates = Array.from(newDates).filter((d) => existingDates.has(d));

    // Add/overwrite with new records (also ignore missing dates)
    newRecords.forEach((r) => {
      if (r.date) {
        mergedMap.set(recordKey(r), r);
      } else {
        console.warn('Skipping uploaded record without date during merging:', r);
      }
    });

    // Update session data (avoid duplicate file names)
    processedFileNames.forEach((fn) => {
      if (!sessionData.uploadedFiles.includes(fn)) {
        sessionData.uploadedFiles.push(fn);
      } else {
        console.warn(`File already recorded in session, skipping duplicate entry: ${fn}`);
      }
    });
    sessionData.allAttendanceRecords = Array.from(mergedMap.values());
    // Re-extract unique employees from the accumulated records
    sessionData.uniqueEmployees = extractUniqueEmployees(sessionData.allAttendanceRecords);
    // Preserve original upload date (first upload) if present, otherwise set now
    sessionData.uploadDate = sessionData.uploadDate || new Date().toISOString();

    // Return extracted employees for salary setup
    const responsePayload = {
      success: true,
      message: `Uploaded and parsed ${processedFileNames.length} file(s)`,
      filesProcessed: processedFileNames.length,
      fileNames: processedFileNames,
      totalRecords: newRecords.length,
      employees: sessionData.uniqueEmployees.map((emp) => ({
        employeeId: emp.employeeId,
        firstName: emp.firstName,
        lastName: emp.lastName,
        department: emp.department,
      })),
    };

    if (overlappingDates && overlappingDates.length > 0) {
      responsePayload.warning = `Uploaded data contained dates that already existed in session: ${overlappingDates.join(', ')}. New records replaced existing ones for matching employee/date/shift.`;
      responsePayload.overlappingDates = overlappingDates;
    }

    res.json(responsePayload);
  } catch (error) {
    console.error('Error in uploadAttendanceFiles:', error);
    res.status(500).json({ error: 'Failed to process attendance files' });
  }
};

/**
 * Get uploaded files and employees for salary setup
 */
export const getUploadedData = (req, res) => {
  if (sessionData.uniqueEmployees.length === 0) {
    return res.status(400).json({
      error: 'No files uploaded yet. Please upload attendance files first.',
    });
  }

  res.json({
    filesProcessed: sessionData.uploadedFiles.length,
    uploadDate: sessionData.uploadDate,
    employees: sessionData.uniqueEmployees.map((emp) => ({
      employeeId: emp.employeeId,
      firstName: emp.firstName,
      lastName: emp.lastName,
      department: emp.department,
    })),
  });
};

/**
 * Clear session data and start fresh
 */
export const clearUploadedData = (req, res) => {
  sessionData = {
    uploadedFiles: [],
    allAttendanceRecords: [],
    uniqueEmployees: [],
    uploadDate: null,
  };

  res.json({ success: true, message: 'Session data cleared' });
};

/**
 * Expose sessionData for salary controller
 */
export const getSessionData = () => {
  return sessionData;
};

/**
 * Update session data (used by salary controller)
 */
export const setSessionData = (newData) => {
  sessionData = newData;
};
