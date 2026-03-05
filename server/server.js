import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { mkdir } from 'fs/promises';
import dotenv from 'dotenv';
import uploadRoutes from './routes/uploadRoutes.js';

// load environment variables from .env file if present
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
await mkdir(uploadsDir, { recursive: true });

// Routes
app.use('/api', uploadRoutes);

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
  }
});
