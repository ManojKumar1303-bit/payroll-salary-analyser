# Employee Master Configuration - Implementation Guide

## Overview

The payroll system now includes an **Employee Master** configuration feature that allows you to permanently store employee salary and penalty settings in a MongoDB database. This eliminates the need to enter employee salary information manually every time you upload an attendance Excel file.

## What's New

### Backend Components
- **MongoDB Integration**: New database connection using Mongoose
- **Employee Model**: Stores employeeId, name, dailySalary, latePenalty, earlyLeavePenalty, overtimeRate
- **Employee API**: CRUD endpoints for managing employee configurations
- **Enhanced Salary Calculation**: Automatic employee lookup from database during salary calculation
- **Skipped Employees Tracking**: System tracks employees in attendance files that aren't in the database

### Frontend Components
- **Employee Settings Page**: Manage employee configurations with search, pagination, edit, and delete functionality
- **Database Toggle**: Choose between manual salary entry and database-driven configuration
- **Warning Messages**: Display skipped employees when using database-driven configuration

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

The new `mongoose` package will be installed to handle MongoDB connections.

### 2. Configure MongoDB Connection

Create a `.env` file in the `server` directory (copy from `.env.example`):

```bash
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/payroll
```

**For Production:**
- Use MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/payroll`
- Or use your cloud MongoDB service

### 3. Start MongoDB

**Local Development (Windows):**
```bash
mongod
```

**Cloud/Production:**
- Use MongoDB Atlas or your cloud provider

### 4. Run the Application

Backend:
```bash
cd server
npm run dev
```

Frontend:
```bash
cd client
npm run dev
```

## API Reference

### Employee Endpoints

All endpoints are prefixed with `/api/employees`

#### Get All Employees
```http
GET /api/employees
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "employees": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "employeeId": "5849913121",
      "name": "BAJIRANGI KUMAR",
      "dailySalary": 300,
      "latePenalty": 50,
      "earlyLeavePenalty": 50,
      "overtimeRate": 100,
      "isActive": true,
      "createdAt": "2026-03-07T10:30:00Z",
      "updatedAt": "2026-03-07T10:30:00Z"
    }
  ]
}
```

#### Get Single Employee
```http
GET /api/employees/:employeeId
```

Example:
```http
GET /api/employees/5849913121
```

#### Create Employee
```http
POST /api/employees
Content-Type: application/json

{
  "employeeId": "5849913121",
  "name": "BAJIRANGI KUMAR",
  "dailySalary": 300,
  "latePenalty": 50,
  "earlyLeavePenalty": 50,
  "overtimeRate": 100
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Employee created successfully",
  "employee": { ... }
}
```

#### Update Employee
```http
PUT /api/employees/:employeeId
Content-Type: application/json

{
  "name": "BAJIRANGI KUMAR",
  "dailySalary": 350,
  "latePenalty": 60,
  "earlyLeavePenalty": 60,
  "overtimeRate": 120
}
```

Note: `employeeId` cannot be changed after creation.

#### Delete Employee (Soft Delete)
```http
DELETE /api/employees/:employeeId
```

**Response:**
```json
{
  "success": true,
  "message": "Employee deleted successfully"
}
```

#### Bulk Upsert Employees
```http
POST /api/employees/bulk-upsert
Content-Type: application/json

{
  "employees": [
    {
      "employeeId": "5849913121",
      "name": "BAJIRANGI KUMAR",
      "dailySalary": 300,
      "latePenalty": 50,
      "earlyLeavePenalty": 50,
      "overtimeRate": 100
    },
    {
      "employeeId": "5849913122",
      "name": "ANOTHER EMPLOYEE",
      "dailySalary": 400,
      "latePenalty": 60,
      "earlyLeavePenalty": 60,
      "overtimeRate": 120
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk upsert completed: 2 created, 0 updated, 0 failed",
  "results": {
    "created": 2,
    "updated": 0,
    "failed": 0,
    "errors": []
  }
}
```

### Salary Calculation with Database

#### Calculate Salary Using Database
```http
POST /api/calculate-salary
Content-Type: application/json

{
  "useDatabase": true,
  "penalties": {
    "latePenalty": 50,
    "earlyLeavePenalty": 50
  },
  "overtimeRate": 100
}
```

**Response:**
```json
{
  "success": true,
  "message": "Salary calculated successfully",
  "dailyReports": [ ... ],
  "summary": [ ... ],
  "skippedEmployees": ["12345678"]
}
```

If `skippedEmployees` is present, it means these employees were in the attendance file but not configured in the Employee Settings database.

## Usage Workflow

### Step 1: Configure Employees

Go to **Employee Settings** page in the navigation:
1. Click **"Add Employee"** button
2. Fill in employee details:
   - Employee ID (must match the ID in Excel file)
   - Name
   - Daily Salary
   - Late Penalty (₹/hour)
   - Early Leave Penalty (₹/hour)
   - Overtime Rate (₹/hour)
3. Click **"Save Employee"**

### Step 2: Upload Attendance File

1. Go to **Upload & Calculate** page
2. Upload your Excel attendance file
3. System will extract employees from the file

### Step 3: Choose Calculation Method

**Option A: Use Employee Settings (Recommended)**
1. Select **"Employee Settings"** option
2. Click **"Calculate with Employee Settings"**
3. System uses configurations from Employee Settings database

**Option B: Manual Entry (Legacy)**
1. Select **"Manual Entry"** option
2. Enter daily salary for each employee in the form
3. Click **"Calculate Salary"**

### Step 4: Review Results

- View **Daily Reports** with salary calculations
- View **Summary Report** with aggregate data
- Export report as Excel file

## Important Rules

### Employee ID Matching

The `employeeId` in the Excel file MUST match exactly with the `employeeId` stored in the database. For example:
- Excel contains: `"5849913121"`
- Database should have: `"5849913121"` (NOT "5849913121 ")

### Skipped Employees

If an employee appears in the attendance Excel file but is NOT configured in the Employee Settings database:
- ✗ No salary is calculated for that employee
- ✗ Employee is added to `skippedEmployees` list
- ⚠️ Warning message is displayed showing skipped employee IDs

**Fix:** Add the employee to Employee Settings before calculating salary.

### Salary Calculation Formula (Unchanged)

The existing salary calculation logic remains unchanged:

```
If ABSENT:
  Final Salary = ₹0

If PRESENT:
  Final Salary = Daily Salary 
                 - (Late Hours × Late Penalty)
                 - (Early Leave Hours × Early Leave Penalty)
                 + (Overtime Hours × Overtime Rate)
```

The only change is **where the values come from**:
- **Before**: Manual entry during upload
- **Now**: Database employee configuration (optional)

## Batch Import from Excel

To import multiple employees at once:

1. Prepare an Excel file with columns:
   - employeeId
   - name
   - dailySalary
   - latePenalty
   - earlyLeavePenalty
   - overtimeRate

2. Use the Bulk Upsert API:
```javascript
const employees = [
  { employeeId: "5849913121", name: "BAJIRANGI KUMAR", dailySalary: 300, ... },
  { employeeId: "5849913122", name: "ANOTHER EMPLOYEE", dailySalary: 400, ... }
];

const response = await fetch('/api/employees/bulk-upsert', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ employees })
});
```

## Migration Guide

### From Manual Entry to Database Configuration

**Step 1: Set up MongoDB**
- Configure `.env` with MongoDB connection string
- Restart the server

**Step 2: Create Employee Records**
- Go to Employee Settings page
- Add all employees manually, OR
- Use Bulk Upsert API for batch import

**Step 3: Verify Configuration**
- Go to Employee Settings page
- Search and verify all employees are listed
- Check salary and penalty values are correct

**Step 4: Use in Calculations**
- Upload attendance file
- Select **"Employee Settings"** option
- Calculate salary
- If `skippedEmployees` appear, add those employees to settings and retry

**Step 5: (Optional) Keep Legacy Support**
- System supports both manual entry and database configuration
- You can switch between methods anytime

## Troubleshooting

### MongoDB Connection Error
```
✗ MongoDB connection failed: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**
1. Ensure MongoDB is running (`mongod`)
2. Check `MONGODB_URI` in `.env` is correct
3. Restart the server

### Employees Not Loading
**Solution:**
1. Check MongoDB is connected
2. Verify employees exist in database: `GET /api/employees`
3. Check browser console for API errors

### Salary Calculation Fails with Database
**Error:** `"Failed to calculate salary"`

**Solution:**
1. Ensure all employees in Excel are in Employee Settings database
2. Check employee IDs match exactly (case-sensitive, no spaces)
3. Run calculation again

### Skipped Employees Warning
**Problem:** Some employees are in Excel but not in database

**Solution:**
1. Note the employee IDs from warning message
2. Go to Employee Settings page
3. Add missing employees
4. Re-upload Excel file and recalculate

## Database Backup

### MongoDB Backup (Local)
```bash
mongodump --db payroll --out ./backups
```

### MongoDB Restore
```bash
mongorestore --db payroll ./backups/payroll
```

### MongoDB Atlas Backup
Use MongoDB Atlas dashboard for automated backups

## Performance Notes

- Employee lookup is indexed by `employeeId` for fast queries
- Bulk upsert can handle 1000+ employees efficiently
- Database connection is persistent (no per-request overhead)
- In-memory salary calculation (unchanged) is fast

## File Structure

```
server/
├── db/
│   └── connection.js          # MongoDB connection
├── models/
│   └── Employee.js             # Mongoose employee schema
├── controllers/
│   ├── employeeController.js   # Employee CRUD logic
│   └── salaryController.js     # Modified for DB lookup
├── routes/
│   ├── employeeRoutes.js       # Employee API routes
│   └── uploadRoutes.js         # Existing upload routes
└── server.js                   # Updated with MongoDB connection

client/
├── pages/
│   └── EmployeeSettingsPage.jsx # New settings page
├── services/
│   └── api.js                   # Added employee API functions
├── components/
│   └── Navbar.jsx               # Updated with new nav link
└── App.jsx                      # Updated routing
```

## Next Steps

1. ✓ Install MongoDB locally or in cloud
2. ✓ Update `.env` with MongoDB connection string
3. ✓ Restart backend server
4. ✓ Go to Employee Settings page
5. ✓ Add all employees to the system
6. ✓ Use "Employee Settings" option during salary calculation
7. ✓ Export salary reports as before

## Support

For issues or questions:
1. Check the "Troubleshooting" section above
2. Verify MongoDB is running
3. Check `.env` configuration
4. Review API responses for error messages
5. Check browser console for frontend errors

---

**Important:** The Excel parser and salary calculation formulas remain unchanged. This feature only changes **how and where** employee salary configuration is stored and retrieved.
