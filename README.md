# Payroll Management System

A MERN stack web application that calculates employee salary based on biometric attendance Excel reports.

## Features

✅ **Multiple Excel File Upload** - Upload biometric attendance files for multiple days at once
✅ **Automatic Employee Detection** - Extracts unique employees from uploaded files
✅ **Configurable Salary Rules** - Set daily salary for each employee
✅ **Flexible Penalty & Overtime Settings** - Adjustable rates for late penalty, early leave penalty, and overtime pay
✅ **Accurate Salary Calculation** - Calculates final salary based on attendance status, late deductions, early leave deductions, and overtime payments
✅ **Daily Reports** - View detailed salary breakdown for each day
✅ **Summary Reports** - Combined salary totals across all uploaded days
✅ **Excel Export** - Download salary reports as Excel files
✅ **Responsive UI** - Clean, modern interface that works on all devices

## Tech Stack

- **Frontend**: React with Vite
- **Backend**: Node.js with Express
- **File Processing**: ExcelJS
- **HTTP Client**: Axios
- **Storage**: In-memory (no database required)

## Project Structure

```
payroll/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileUpload.jsx
│   │   │   ├── SalarySettings.jsx
│   │   │   ├── EmployeeSalaryTable.jsx
│   │   │   ├── DailyReport.jsx
│   │   │   ├── SummaryReport.jsx
│   │   │   └── Navbar.jsx
│   │   ├── pages/
│   │   │   ├── UploadPage.jsx
│   │   │   └── ReportsPage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                          # Node.js Backend
│   ├── controllers/
│   │   ├── uploadController.js
│   │   └── salaryController.js
│   ├── routes/
│   │   └── uploadRoutes.js
│   ├── services/
│   │   ├── excelParser.js
│   │   └── salaryCalculator.js
│   ├── utils/
│   │   └── timeConverter.js
│   ├── uploads/                     # Temporary file storage
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The client will run on `http://localhost:3000`

## Usage

### Step 1: Upload Attendance Files
1. Click on "Upload & Calculate" in the navigation
2. Select one or more Excel files containing biometric attendance data
3. Click "Upload Files" to process the files
4. The system will extract all unique employees

### Step 2: Configure Salary Settings
1. Adjust the salary calculation settings if needed:
   - **Late Penalty**: Default ₹50/hour
   - **Early Leave Penalty**: Default ₹50/hour
   - **Overtime Pay**: Default ₹100/hour

### Step 3: Enter Employee Salaries
1. In the employee salary setup table, enter the daily salary for each employee
2. Click "Calculate Salary" to process all uploaded attendance records

### Step 4: View Reports
1. **Daily Reports**: View detailed salary breakdown for each day, including:
   - Employee ID and Name
   - Shift information
   - Duration of late/early leave/overtime
   - Salary deductions and overtime payments
   - Final salary

2. **Summary Reports**: View combined totals across all days:
   - Total days processed
   - Total late/early leave/overtime hours
   - Total salary across all days

### Step 5: Export Reports
1. Click "Download Excel Report" to export the salary calculations
2. The Excel file includes both daily details and summary sheets

## Excel Input Format

Each uploaded Excel file should contain the following columns:

| Column | Format | Example |
|--------|--------|---------|
| First Name | Text | John |
| Last Name | Text | Doe |
| ID | Text | EMP001 |
| Department | Text | Engineering |
| Date | Date | 2024-01-15 |
| Weekday | Text | Monday |
| Timetable | Text | 08:00 - 20:00 |
| Attendance Status | Text | Normal/Late/Absent |
| Worked Hours | Number | 12 |
| Absent Duration | HH:MM | 00:00 |
| Late Duration | HH:MM | 01:30 |
| Early Leave Duration | HH:MM | 00:45 |
| Overtime Duration | HH:MM | 02:00 |

## Shift Rules

- **Shift 1**: 08:00 - 20:00 (12 hours)
- **Shift 2**: 09:00 - 18:00 (9 hours)

## Salary Calculation Logic

For each employee per attendance day:

```
If Attendance Status = "Absent":
  Final Salary = 0

If Attendance Status = Present (Normal, Late, etc.):
  Base Salary = Employee Daily Salary
  Late Deduction = Late Duration (in hours) × Late Penalty Rate
  Early Leave Deduction = Early Leave Duration (in hours) × Early Leave Penalty Rate
  Overtime Payment = Overtime Duration (in hours) × Overtime Rate
  
  Final Salary = Base Salary - Late Deduction - Early Leave Deduction + Overtime Payment
```

## API Endpoints

### Upload & Parse Excel Files
```
POST /api/upload-attendance
```
Upload multiple Excel files and extract employee data
- Returns: List of detected employees

### Get Uploaded Data
```
GET /api/uploaded-data
```
Retrieve uploaded files and employees for salary setup

### Calculate Salary
```
POST /api/calculate-salary
```
Calculate salary based on uploaded data and settings
- Body:
  ```json
  {
    "employeeSalaries": { "EMP001": 1000, "EMP002": 1100 },
    "penalties": { "latePenalty": 50, "earlyLeavePenalty": 50 },
    "overtimeRate": 100
  }
  ```
- Returns: Daily reports and summary

### Get Reports
```
GET /api/reports
```
Retrieve previously calculated salary reports

### Export Report
```
GET /api/export-report
```
Download salary report as Excel file (blob response)

### Clear Session Data
```
POST /api/clear
```
Clear all uploaded data and start fresh

## Time Conversion

The system automatically converts time durations from HH:MM format to decimal hours:

```
01:30 → 1.5 hours
00:45 → 0.75 hours
02:00 → 2.0 hours
```

## Features Breakdown

### File Upload
- Supports multiple Excel file uploads
- Validates file format (xlsx, xls only)
- Processes files in parallel
- Temporary storage in server/uploads directory

### Employee Management
- Automatic duplicate detection using Employee ID
- Combines data from multiple files
- Displays employee details: ID, Name, Department

### Salary Configuration
- Per-employee daily salary setup
- Global penalty and overtime settings
- Real-time validation of input values

### Report Generation
- Detailed daily reports with full calculation details
- Summary reports with aggregate totals
- Export to Excel with formatted sheets
- Beautiful, responsive table layouts

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Server not connecting
- Ensure backend is running on `http://localhost:5000`
- Check if port 5000 is available
- Verify no firewall blocking connections

### Excel file upload fails
- Ensure file is in .xlsx or .xls format
- Verify file contains required columns
- Check file size (max 50MB)

### Employee data not showing
- Verify Excel file has valid employee records
- Check that Employee ID column is not empty
- Ensure First Name and ID columns are populated

## Performance Notes

- All calculations are done in server memory
- Supports files with thousands of employee records
- Session data is cleared when browser is closed or "Clear" is clicked
- No database overhead - instant calculations

## Future Enhancements

- Database integration for persistent storage
- User authentication
- Multiple payroll cycles management
- Advanced reporting and analytics
- Integration with external HR systems
- Email report delivery
- Batch processing for large datasets

## License

MIT

## Support

For issues or questions, please refer to the project structure and code comments.

## Notes

- All uploaded files are stored temporarily in `server/uploads/` and are processed in memory
- Session data persists during the current browser session
- Closing the browser or clicking "Clear Data" will reset the session
- Multiple file uploads from different days are automatically grouped by date

---

**Created**: March 2026
**Version**: 1.0.0
**Status**: Production Ready
#   p a y r o l l - s a l a r y - a n a l y s e r  
 