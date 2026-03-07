import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { mkdir } from 'fs/promises';
import dotenv from 'dotenv';
import uploadRoutes from './routes/uploadRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import { connectDB } from './db/connection.js';

// load environment variables from .env file if present
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
await mkdir(uploadsDir, { recursive: true });

// Connect to MongoDB
try {
  await connectDB();
} catch (error) {
  console.error('Failed to connect to MongoDB:', error.message);
  console.error('Application will continue with in-memory employee storage only');
}

// Routes
app.use('/api', uploadRoutes);
app.use('/api/employees', employeeRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);

  if (err instanceof Error) {
    if (err.message.includes('Only Excel files')) {
      return res.status(400).json({ error: err.message });
    }
  }

  res.status(500).json({
    error: 'An error occurred',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Payroll Server is running on port ${PORT}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log('Endpoints available:');
    console.log('  POST /api/upload-attendance - Upload Excel files');
    console.log('  GET  /api/uploaded-data - Get uploaded employees');
    console.log('  POST /api/calculate-salary - Calculate salary');
    console.log('  GET  /api/reports - Get salary reports');
    console.log('  GET  /api/export-report - Export reports as Excel');
    console.log('  POST /api/clear - Clear session data');
    console.log('Employee Management:');
    console.log('  GET  /api/employees - Get all employees');
    console.log('  POST /api/employees - Create new employee');
    console.log('  PUT  /api/employees/:employeeId - Update employee');
    console.log('  DELETE /api/employees/:employeeId - Delete employee');
    console.log('  POST /api/employees/bulk-upsert - Bulk create/update employees');
  }
});
