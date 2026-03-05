import express from 'express';
import multer from 'multer';
import {
  uploadAttendanceFiles,
  getUploadedData,
  clearUploadedData,
} from '../controllers/uploadController.js';
import {
  calculateSalary,
  getReports,
  exportSalaryReport,
} from '../controllers/salaryController.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const router = express.Router();

// Configure multer for file uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const uploadsDir = path.join(__dirname, '../uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB per file
  fileFilter: (req, file, cb) => {
    // Accept only Excel files
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.xlsx', '.xls'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed'));
    }
  },
});

/**
 * POST /api/upload-attendance
 * Upload multiple Excel attendance files
 */
router.post('/upload-attendance', upload.array('files'), uploadAttendanceFiles);

/**
 * GET /api/uploaded-data
 * Get list of uploaded files and extracted employees
 */
router.get('/uploaded-data', getUploadedData);

/**
 * POST /api/calculate-salary
 * Calculate salary based on uploaded files and salary settings
 */
router.post('/calculate-salary', calculateSalary);

/**
 * GET /api/reports
 * Get previously calculated salary reports
 */
router.get('/reports', getReports);

/**
 * GET /api/export-report
 * Export salary report as Excel file
 */
router.get('/export-report', exportSalaryReport);

/**
 * POST /api/clear
 * Clear session data
 */
router.post('/clear', clearUploadedData);

export default router;
