# Employee Import Feature - Setup Guide

## Overview

The Employee Settings page now includes an **"Import Employees from Excel"** feature that allows you to quickly add multiple employees from an Excel file.

## What's New

### Frontend
- **Import Button**: New "📥 Import Employees" button on Employee Settings page
- **File Picker**: Opens file selector for `.xlsx` files only
- **Auto-refresh**: Employee list updates automatically after successful import
- **Loading Indicator**: Shows "⏳ Importing..." while processing

### Backend
- **New API Endpoint**: `POST /api/employees/import`
- **Excel Parsing**: Reads employeeId and name columns from Excel file
- **Duplicate Detection**: Skips employees that already exist in database
- **Default Values**: New employees created with:
  - `dailySalary: 0` (to be updated later)
  - `latePenalty: 0`
  - `earlyLeavePenalty: 0`
  - `overtimeRate: 0`

## Excel File Format

Your Excel file should have exactly **2 columns**:

| Column A | Column B |
|----------|----------|
| employeeId | name |
| 5849913121 | BAJIRANGI KUMAR |
| 5054118422 | MANTU DAS |
| 1129434650 | SANTHI |

### Important Rules

- **Column 1**: Employee ID (must be unique)
- **Column 2**: Employee Name
- **No salary/penalty columns** needed in import file
- Excel file must be `.xlsx` format

## How to Import

### Step 1: Prepare Excel File

Create an Excel file with two columns:
- Column A: Employee IDs
- Column B: Employee Names

**Example:**
```
employeeId    | name
5849913121    | BAJIRANGI KUMAR
5054118422    | MANTU DAS
1129434650    | SANTHI
5849913123    | JOHN DOE
```

### Step 2: Go to Employee Settings

1. Click **"👥 Employee Settings"** in the navigation bar
2. You'll see the Employee Settings page

### Step 3: Click Import Button

1. Click the **"📥 Import Employees"** button
2. File picker dialog will open
3. Select your Excel file

### Step 4: Wait for Confirmation

- Loading indicator shows: **"⏳ Importing..."**
- After completion, you'll see a success message
- Example: **"15 employees imported successfully. 2 duplicates skipped."**

### Step 5: Update Salary (Optional)

1. New employees appear in the table
2. Click **"Edit"** to set salary and penalties
3. Default values are:
   - Daily Salary: ₹0
   - Late Penalty: ₹0
   - Early Leave Penalty: ₹0
   - Overtime Rate: ₹0

## Workflow Example

### Before Import
```
Employee Settings page shows:
"No employees configured yet."
```

### After Clicking Import

1. File picker opens
2. Select `employees.xlsx`
3. System shows: "⏳ Importing..."
4. System shows: "15 employees imported successfully. 2 duplicates skipped."
5. Employee table appears with all imported employees

## Success Response

After successful import, you'll see a message:

```
"X employees imported successfully. Y duplicates skipped."
```

Where:
- **X** = Number of new employees added
- **Y** = Number of duplicate employees skipped (already existed)

## Scenarios

### Scenario 1: First Time Import

**Excel file:** 5 employees
**Result:** "5 employees imported successfully. 0 duplicates skipped."

### Scenario 2: Import with Duplicates

**Excel file:** 10 employees (3 already in database)
**Result:** "7 employees imported successfully. 3 duplicates skipped."

### Scenario 3: All Duplicates

**Excel file:** 5 employees (all already in database)
**Result:** "0 employees imported successfully. 5 duplicates skipped."

## Error Handling

### File Errors

1. **"Only Excel files (.xlsx, .xls) are allowed"**
   - You selected a non-Excel file
   - Select a `.xlsx` file instead

2. **"No file uploaded"**
   - Click Import but didn't select a file
   - Click Import again and select file

3. **"Excel file is empty"**
   - Your Excel file has no data
   - Add at least 2 rows (header + 1 employee)

4. **"Failed to parse Excel file..."**
   - Excel format is incorrect
   - Ensure you have employeeId and name columns

### Import Errors

- **Duplicate employee IDs**: These are skipped (not errors)
- **Missing data**: Rows with missing employeeId or name are skipped
- **Database errors**: Shown in error message at top of page

## Batch Import Tips

### Preparing Your File

1. **Use Excel or Google Sheets**
   - Create a new spreadsheet
   - Column A: Employee IDs
   - Column B: Names
   - Save as `.xlsx`

2. **Check for Duplicates**
   - Review the file for duplicate IDs
   - The system will skip existing IDs
   - Import the same file multiple times: duplicates will be skipped

3. **Verify Data**
   - Ensure employee IDs are unique
   - Employee names can repeat but IDs must be unique

### Importing Large Files

- System can handle 1000+ employees per file
- Import process may take a few seconds for large files
- Progress indicator shows: "⏳ Importing..."

## After Import: Update Salary Settings

Since imported employees have `dailySalary: 0`, you need to update:

### Quick Update (Edit Individual)
1. Find employee in table
2. Click **"Edit"** button
3. Set salary and penalties
4. Click **"Save Employee"**

### Bulk Update (Use Bulk API)
If you have many employees to update with same settings, see `EMPLOYEE_MASTER_SETUP.md` for bulk-upsert endpoint.

## Important Notes

### Default Values After Import

Imported employees are created with:
- `dailySalary: 0` ← **Update this!**
- `latePenalty: 0` ← Optional (default: 50)
- `earlyLeavePenalty: 0` ← Optional (default: 50)
- `overtimeRate: 0` ← Optional (default: 100)

Until you edit and set the salary, these employees will have **₹0 daily salary**.

### Why Salary Defaults to 0?

The import file only has ID and name. Salary varies per employee, so:
- System cannot guess the correct salary
- You must set it manually for each employee
- Or use Excel to import with salary data (use bulk-upsert API instead)

### Duplicate Handling

If you import the same employee ID twice:
- First import: Employee added
- Second import: Employee skipped (duplicate)
- No error - just noted in success message

### Database Consistency

- Employee ID is unique in database
- Cannot have two employees with same ID
- Import respects this uniqueness

## Troubleshooting

### Import Didn't Work

1. **Check file format**
   - Must be `.xlsx` or `.xls`
   - Check file extension

2. **Check data structure**
   - Column A: Employee IDs
   - Column B: Names
   - No empty rows in data

3. **Check for errors**
   - Error message shown at top of page
   - Read the error carefully
   - Fix and retry

4. **Check internet connection**
   - Import requires server connection
   - Try again if connection is slow

### Employees Not Updated

1. **Click "Import Employees" button**
   - Not the "Add Employee" button
   - Import button is purple: "📥 Import Employees"

2. **Wait for full completion**
   - Wait for "⏳ Importing..." to finish
   - Wait for success message

3. **Refresh page if needed**
   - Page should auto-refresh
   - Manual refresh: Press F5

### Edit After Import

1. Find employee in list
2. Use search to find quickly
3. Click **"Edit"** button (blue)
4. Update salary and penalties
5. Click **"Save Employee"**

## Column Detection

The system automatically detects columns:
- Looks for headers: "employeeId", "employee id", "id"
- Looks for headers: "name"
- If headers not found: assumes columns 1=ID, 2=name

**Best Practice**: Include header row in Excel file:
```
Row 1:  employeeId | name
Row 2:  5849913121 | BAJIRANGI KUMAR
Row 3:  5054118422 | MANTU DAS
```

## API Details

If you want to use the API directly:

```http
POST /api/employees/import
Content-Type: multipart/form-data

Body:
  file: <binary Excel file>

Response:
{
  "success": true,
  "message": "X employees imported successfully. Y duplicates skipped.",
  "addedEmployees": X,
  "skippedEmployees": Y,
  "errors": []
}
```

## File Size Limits

- **Maximum file size**: 20 MB
- **Maximum employees per file**: 10,000+ (limited by file size)
- **Recommended file size**: < 5 MB

For very large imports (10,000+), split into multiple files.

## Performance

- Small import (< 100 employees): < 1 second
- Medium import (100-1000 employees): 1-5 seconds
- Large import (1000-10000 employees): 5-30 seconds

Larger imports may take a moment - be patient!

## Getting Excel Files

### Create from Scratch
1. Open Excel or Google Sheets
2. Column A: Personnel/Employee IDs
3. Column B: Employee Names
4. Save as `.xlsx`

### Export from HR System
- Export employee list from your HR system
- Keep only ID and Name columns
- Remove other columns
- Save as Excel format

### Sample File
```
Download sample from: [your system]/sample-employees.xlsx
Or create manually as shown above
```

## Frequently Asked Questions

**Q: Can I import with salary data?**
A: This feature imports only ID and name. For salary, use the bulk-upsert API or edit individually.

**Q: What if someone already exists?**
A: They're added to "skipped" count and not modified.

**Q: Can I re-import to update names?**
A: No, import only creates new employees. Use Edit to update existing employees.

**Q: How long does import take?**
A: Usually < 1-5 seconds for typical files.

**Q: Can I cancel import?**
A: No, but it processes quickly. Wait for completion.

**Q: Are imported employees immediately active?**
A: Yes, all imported employees have `isActive: true`.

## Next Steps

1. ✓ Create Excel file with employee IDs and names
2. ✓ Go to Employee Settings
3. ✓ Click "📥 Import Employees"
4. ✓ Select your Excel file
5. ✓ Wait for success message
6. ✓ Edit each employee to set salary
7. ✓ Start using in salary calculations

---

**Need Help?**
- See EMPLOYEE_SETTINGS_USER_GUIDE.md for general employee management
- See EMPLOYEE_MASTER_SETUP.md for API details
- Check error message at top of page for specific issues
