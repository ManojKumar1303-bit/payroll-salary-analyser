import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  bulkUpsertEmployees,
  importEmployees,
} from '../controllers/employeeController.js';

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
    cb(null, `emp-import-${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
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
 * GET /api/employees
 * Get all active employees
 */
router.get('/', getAllEmployees);

/**
 * POST /api/employees/import
 * Import employees from Excel file
 * File should have columns: employeeId, name
 */
router.post('/import', upload.single('file'), importEmployees);

/**
 * GET /api/employees/:employeeId
 * Get a specific employee by employeeId
 */
router.get('/:employeeId', getEmployeeById);

/**
 * POST /api/employees
 * Create a new employee
 */
router.post('/', createEmployee);

/**
 * PUT /api/employees/:employeeId
 * Update employee details
 */
router.put('/:employeeId', updateEmployee);

/**
 * DELETE /api/employees/:employeeId
 * Soft delete an employee (mark as inactive)
 */
router.delete('/:employeeId', deleteEmployee);

/**
 * POST /api/employees/bulk-upsert
 * Create or update multiple employees in one request
 */
router.post('/bulk-upsert', bulkUpsertEmployees);

export default router;
