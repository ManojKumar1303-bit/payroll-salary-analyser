# Employee Master Configuration - Quick Start

## TL;DR (Too Long; Didn't Read)

### 1. Setup MongoDB
```bash
# .env in server/ directory
MONGODB_URI=mongodb://localhost:27017/payroll
```

### 2. Add Employees
Go to **"👥 Employee Settings"** → Click **"Add Employee"** → Fill details → Save

### 3. Calculate Salary
1. Upload Excel file
2. Select **"Employee Settings"** option
3. Click **"Calculate with Employee Settings"**
4. View reports

## Key Features

| Feature | Before | After |
|---------|--------|-------|
| **Salary Entry** | Manual every upload | Configure once, reuse |
| **Employee Storage** | Session memory | MongoDB database |
| **Missing Employees** | No warning | Shows skipped employees |
| **Changes** | Lost after refresh | Permanently saved |
| **Bulk Import** | Manual one-by-one | Batch API available |

## Installation

```bash
# Backend setup
cd server
npm install
npm run dev

# Frontend setup
cd client
npm install
npm run dev
```

## API Endpoints

```
GET    /api/employees              # List all
POST   /api/employees              # Create
PUT    /api/employees/:id          # Update
DELETE /api/employees/:id          # Delete
POST   /api/employees/bulk-upsert  # Batch import
```

## Employee Record Structure

```json
{
  "employeeId": "5849913121",
  "name": "BAJIRANGI KUMAR",
  "dailySalary": 300,
  "latePenalty": 50,
  "earlyLeavePenalty": 50,
  "overtimeRate": 100
}
```

## Salary Calculation (Unchanged)

```
Final Salary = dailySalary 
             - (latePenalty × lateHours)
             - (earlyLeavePenalty × earlyLeaveHours)
             + (overtimeRate × overtimeHours)
```

## Important Rules

1. **Employee ID must match Excel file exactly**
   - No spaces, case-sensitive
   - Example: "5849913121" NOT "5849913121 "

2. **Skipped Employees**
   - If employee in Excel but not in database
   - They won't be calculated
   - Warning shows their IDs

3. **All Penalties Optional**
   - Default: latePenalty = 50, earlyLeavePenalty = 50, overtimeRate = 100
   - Can customize per employee

## Common Tasks

### Add Single Employee
```
Go to Employee Settings
↓
Click "Add Employee"
↓
Fill: ID, Name, Daily Salary
↓
(Optional) Adjust penalties & overtime
↓
Click "Save Employee"
```

### Add Multiple Employees
```
Use Bulk Upsert API (see EMPLOYEE_MASTER_SETUP.md)
OR
Add one-by-one in Employee Settings UI
```

### Update Salary
```
Find employee in Employee Settings
↓
Click "Edit"
↓
Change values
↓
Click "Save Employee"
```

### Calculate with Employee Settings
```
Upload Excel file in Upload & Calculate
↓
Select "👥 Employee Settings" option
↓
Click "Calculate with Employee Settings"
↓
Done! (No manual salary entry needed)
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB won't connect | Check `mongod` is running and `.env` is correct |
| Employees not loading | Restart server, check MongoDB connection |
| Salary calculation fails | Add missing employees to Employee Settings |
| Skipped employees warning | Add those employees, then recalculate |
| Can't edit employee | Try refreshing the page |

## File Locations

```
Backend Changes:
  server/models/Employee.js                 - Mongoose schema
  server/controllers/employeeController.js  - CRUD logic
  server/routes/employeeRoutes.js           - API routes
  server/db/connection.js                   - DB connection
  server/services/salaryCalculator.js       - Updated for DB lookup
  server/controllers/salaryController.js    - Updated for DB mode

Frontend Changes:
  client/pages/EmployeeSettingsPage.jsx     - New settings page
  client/App.jsx                            - Added routing
  client/components/Navbar.jsx              - Added nav link
  client/services/api.js                    - Added employee functions
  client/pages/UploadPage.jsx               - Added database mode
```

## Environment Variables

```bash
# Required for database mode
MONGODB_URI=mongodb://localhost:27017/payroll

# Optional
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
```

## What Didn't Change

✓ Excel parser logic (unchanged)
✓ Overtime/Late/Early Leave formulas (unchanged)
✓ Report generation (unchanged)
✓ Daily/Summary reports (unchanged)
✓ Export functionality (unchanged)
✓ Manual salary entry option (still available)

## What's New

✓ MongoDB employee database
✓ Employee Settings page
✓ Employee CRUD API (4 endpoints + bulk)
✓ Database-driven salary calculation
✓ Skipped employees tracking
✓ Search & pagination in Employee Settings

## Next Steps

1. Install MongoDB locally or cloud
2. Update `.env` with MongoDB connection string
3. Restart backend
4. Go to Employee Settings and add employees
5. Use "Employee Settings" option during salary calculation

## For More Details

- **Setup Guide**: See `EMPLOYEE_MASTER_SETUP.md`
- **User Guide**: See `EMPLOYEE_SETTINGS_USER_GUIDE.md`
- **API Documentation**: See `EMPLOYEE_MASTER_SETUP.md` → API Reference section

---

**Status**: ✓ Implementation Complete
**Compatibility**: ✓ Backward compatible (manual entry still works)
**Database**: ✓ MongoDB required for new features
**Testing**: Ready for testing
