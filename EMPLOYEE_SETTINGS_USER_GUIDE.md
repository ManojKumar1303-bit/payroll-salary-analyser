# Employee Settings - User Guide

## Overview

The **Employee Settings** page is where you manage employee salary and penalty configurations that will be used automatically during salary calculations.

## Accessing Employee Settings

1. Click the **"👥 Employee Settings"** button in the navigation bar
2. You'll see a list of all configured employees

## Employee Settings Interface

### Search Bar
- Search employees by **ID** or **Name**
- Results update in real-time
- Searches are case-insensitive

### Add Employee Button
- Located at the top-right corner
- Opens a form to create a new employee

### Employee Table

The table displays all configured employees with columns:

| Column | Description |
|--------|-------------|
| **Employee ID** | Unique identifier (must match Excel file) |
| **Name** | Full employee name |
| **Daily Salary** | Base daily salary in ₹ |
| **Late Penalty** | Deduction per hour of late (₹/hour) |
| **Early Leave Penalty** | Deduction per hour of early leave (₹/hour) |
| **Overtime Rate** | Payment per hour of overtime (₹/hour) |
| **Actions** | Edit or Delete buttons |

### Pagination

If you have many employees:
- Navigate between pages using **Previous** and **Next** buttons
- Click page numbers to jump directly
- 10 employees displayed per page

## Adding an Employee

### Steps:

1. Click **"➕ Add Employee"** button
2. Fill in the form:
   - **Employee ID** *: Unique ID from Excel file (required)
   - **Name** *: Full name (required)
   - **Daily Salary** *: Base daily salary in ₹ (required)
   - **Late Penalty**: Deduction per hour for late arrival (default: ₹50/hour)
   - **Early Leave Penalty**: Deduction per hour for early leave (default: ₹50/hour)
   - **Overtime Rate**: Payment per hour of overtime (default: ₹100/hour)

3. Click **"Save Employee"** to save
4. Success message appears and employee is added to the list

### Example:
```
Employee ID: 5849913121
Name: BAJIRANGI KUMAR
Daily Salary: 300
Late Penalty: 50
Early Leave Penalty: 50
Overtime Rate: 100
```

*Fields marked with * are required

## Editing an Employee

### Steps:

1. Find the employee in the table
2. Click the blue **"Edit"** button in the Actions column
3. Edit form opens with pre-filled values
4. Make changes needed
5. Click **"Save Employee"** to update
6. Success message appears and list updates

### Note:
- Employee ID cannot be changed (it's grayed out)
- All other fields can be updated

## Deleting an Employee

### Steps:

1. Find the employee in the table
2. Click the red **"Delete"** button in the Actions column
3. Confirmation dialog appears
4. Click **"OK"** to confirm deletion
5. Employee is marked as inactive and hidden from the list

### Note:
- Deletion is **soft** (marked inactive, not permanently removed)
- Old records in reports are not affected
- You can re-activate by re-adding with same ID

## Using Employee Settings in Salary Calculation

### Workflow:

1. **Upload attendance file** in "Upload & Calculate" page
2. **Choose configuration method:**
   - Select **"👥 Employee Settings"** option
   - Click **"Calculate with Employee Settings"** button
3. **System automatically:**
   - Looks up each employee in the database
   - Uses their configured salary and penalties
   - Calculates final salary
4. **Check results:**
   - View daily and summary reports
   - If employees are skipped, they appear in warning message

### Skipped Employees

If an employee appears in your Excel file but is NOT in Employee Settings:
- ⚠️ **Warning message** shows their ID
- Salary is **not calculated** for that employee
- They don't appear in reports

**Fix:**
1. Add the employee to Employee Settings
2. Re-upload the Excel file
3. Calculate again

## Tips & Best Practices

### Employee ID Format
- Use the **exact ID** format from your Excel file
- IDs are case-sensitive
- Remove any leading/trailing spaces
- Common formats:
  - Numbers: `5849913121`
  - Mixed: `EMP001`, `EMP-2026-001`

### Salary Configuration
- **Daily Salary**: Base salary for one day of work
  - Example: ₹300/day = ₹300 × 26 ≈ ₹7,800/month
  
- **Late Penalty**: Amount deducted per hour late
  - Example: ₹50/hour = ₹400 for 8 hours late

- **Early Leave Penalty**: Amount deducted per hour early
  - Example: ₹50/hour = ₹200 for 4 hours early

- **Overtime Rate**: Amount paid per hour overtime
  - Example: ₹100/hour = Extra ₹100 per hour worked

### Bulk Import
If you need to add many employees:
1. Prepare an Excel file with employee data
2. Use the bulk import API (see EMPLOYEE_MASTER_SETUP.md)
3. Or add manually through the UI

### Regular Updates
- Update salary when changed
- Review penalties periodically
- Delete inactive employees

## Common Scenarios

### Scenario 1: New Employee Starts
1. Go to Employee Settings
2. Click "Add Employee"
3. Fill in details
4. They appear in next salary calculation

### Scenario 2: Salary Increase
1. Find employee in list
2. Click "Edit"
3. Update Daily Salary
4. Click "Save Employee"
5. New salary used in next calculation

### Scenario 3: Employee Leaves
1. Find employee in list
2. Click "Delete"
3. Confirm deletion
4. They won't appear in future calculations

### Scenario 4: Penalty Adjustment
1. Find employee in list
2. Click "Edit"
3. Update penalty rates
4. Click "Save Employee"
5. New rates used in next calculation

### Scenario 5: Multiple Employees Missing
1. Upload Excel file
2. See warning for multiple skipped employees
3. Add all missing employees to Employee Settings
4. Re-calculate with same Excel file

## Keyboard Tips

- **Tab** - Navigate between form fields
- **Enter** - Submit form or activate button
- **Escape** - Close modal/form

## Mobile View

The Employee Settings page is responsive:
- Search bar adapts to screen width
- Table scrolls horizontally on small screens
- Buttons remain accessible on mobile

## Data Validation

The system validates:
- ✓ Employee ID is unique (no duplicates)
- ✓ All required fields are filled
- ✓ Salary values are positive numbers
- ✓ Penalty values are non-negative

If validation fails:
- Error message appears at the top
- Form is not submitted
- Fix the errors and try again

## Troubleshooting

### "Employee with ID already exists"
- Employee ID must be unique
- Try a different ID or check spelling

### "Please fill in all required fields"
- Marked fields with * are required
- Employee ID, Name, and Daily Salary are required

### Form doesn't save
- Check internet connection
- Verify MongoDB is running (backend)
- Refresh page and try again

### Employee doesn't appear in list
- Wait for the list to refresh
- Try searching for the ID
- Check browser console for errors

### Delete failed
- Try again in a few moments
- Check internet connection
- Refresh page

## Exporting to Excel

While there's no direct export from Employee Settings, you can:
1. Use the browser's "Save as" feature
2. Export from database backup
3. Or manually create Excel from the displayed table

## Importing from Excel

To bulk import from Excel:
1. Prepare file with columns: employeeId, name, dailySalary, latePenalty, earlyLeavePenalty, overtimeRate
2. Use the bulk import API endpoint
3. See EMPLOYEE_MASTER_SETUP.md for details

## Limitations & Constraints

- Cannot change Employee ID after creation
- Soft deletion (not permanent removal)
- One database per payroll system
- No role-based access control (all users can edit)

## Information Storage

All employee data is stored in MongoDB:
- Secure storage with indexes
- Persistent across sessions
- Backed up as part of database backup
- Can be exported/imported as needed

---

**Next Step:** Configure your employees in Employee Settings, then use them in salary calculations!
