# Quick Start Guide

Get up and running with the Payroll Management System in 5 minutes!

## Prerequisites
- Node.js 14+ installed
- npm installed
- Two Terminal windows ready

## Step 1: Install Dependencies (2 minutes)

### Terminal 1 - Backend
```bash
cd server
npm install
```

### Terminal 2 - Frontend
```bash
cd client
npm install
```

## Step 2: Start the Servers (30 seconds)

### Terminal 1 - Start Backend (stays running)
```bash
cd server
npm run dev
```
✅ Backend running on `http://localhost:5000`

### Terminal 2 - Start Frontend (stays running)
```bash
cd client
npm run dev
```
✅ Frontend running on `http://localhost:3000`

## Step 3: Open Application (10 seconds)

1. Open your browser
2. Go to `http://localhost:3000`
3. You should see the Payroll Management System interface

## Step 4: Test with Sample Data

### Create a Sample Excel File

You can create a sample Excel file with these columns:

| Column | Value |
|--------|-------|
| First Name | John |
| Last Name | Doe |
| ID | EMP001 |
| Department | Engineering |
| Date | 2024-01-15 |
| Weekday | Monday |
| Timetable | 08:00 - 20:00 |
| Attendance Status | Normal |
| Worked Hours | 12 |
| Absent Duration | 00:00 |
| Late Duration | 00:30 |
| Early Leave Duration | 00:00 |
| Overtime Duration | 01:00 |

### Or Use This Python Script to Generate Sample Data

```python
import openpyxl
from openpyxl.utils import get_column_letter
from datetime import datetime, timedelta

# Create workbook
wb = openpyxl.Workbook()
ws = wb.active
ws.title = "Attendance"

# Add headers
headers = [
    "First Name", "Last Name", "ID", "Department", "Date", "Weekday",
    "Timetable", "Attendance Status", "Worked Hours", "Absent Duration",
    "Late Duration", "Early Leave Duration", "Overtime Duration"
]
ws.append(headers)

# Add sample data for 3 employees over 2 days
employees = [
    ("John", "Doe", "EMP001", "Engineering"),
    ("Jane", "Smith", "EMP002", "HR"),
    ("Bob", "Johnson", "EMP003", "Sales"),
]

date = datetime(2024, 1, 15)
for day in range(2):
    current_date = date + timedelta(days=day)
    weekday = current_date.strftime("%A")
    date_str = current_date.strftime("%Y-%m-%d")
    
    for first, last, emp_id, dept in employees:
        ws.append([
            first, last, emp_id, dept, date_str, weekday,
            "08:00 - 20:00", "Normal", 12, "00:00",
            "00:30", "00:00", "01:00"
        ])

# Save file
wb.save("sample_attendance.xlsx")
print("Sample Excel file created: sample_attendance.xlsx")
```

## Step 5: Use the Application

1. **Upload Files**
   - Click on "Upload & Calculate"
   - Select the Excel file(s)
   - Click "Upload Files"

2. **Set Salary**
   - System detects employees
   - Enter daily salary for each employee
   - Adjust penalty/overtime rates if needed

3. **Calculate**
   - Click "Calculate Salary"
   - View daily and summary reports

4. **Export**
   - Click "Download Excel Report"
   - Save the salary report

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Clear Data | Click "Start New Calculation" |
| Switch Page | Click nav buttons |

## Common Issues

### Backend won't start
```bash
# Kill process on port 5000
# Linux/Mac: lsof -ti:5000 | xargs kill -9
# Windows: netstat -ano | findstr :5000
```

### Frontend won't connect
- Check backend is running
- Verify `http://localhost:5000` is accessible
- Check browser console for errors

### Excel upload fails
- Verify file has all required columns (see list above)
- Check file is .xlsx or .xls format
- Ensure Employee ID column has values

## Environment Variables (Optional)

Create `server/.env` file:
```
PORT=5000
NODE_ENV=development
```

## Next Steps

- 📖 Read full [README.md](README.md)
- 🔧 Customize salary settings
- 📊 Export and analyze reports
- 🚀 Deploy to production (see deployment guide)

## Support

If you encounter issues:
1. Check browser console (F12)
2. Check server terminal for errors
3. Verify all files uploaded correctly
4. Ensure ports 3000 and 5000 are free

## Tips

- You can upload multiple Excel files at once
- Each file can contain data for multiple employees
- Files from different dates are automatically grouped
- All calculations stay in memory (no database needed)
- Session clears when browser closes or "Clear" is clicked

## Performance Tips

- For large batch processing, split into multiple uploads
- Each upload can handle files with 1000+ employee records
- Reports are generated instantly after calculation

---

Enjoy! 🎉
