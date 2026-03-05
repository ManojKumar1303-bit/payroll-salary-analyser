# Salary Calculation Guide

This document explains how the payroll system calculates employee salaries with time-based deductions and overtime payments.

## Time Format Conversion

All time durations from the Excel file are in **HH:MM format** and are automatically converted to **decimal hours** for calculation.

### Conversion Examples

| Time Format | Decimal Hours | Notes |
|------------|---------------|-------|
| 00:00 | 0.0 | Zero hours |
| 00:15 | 0.25 | 15 minutes = 0.25 hours |
| 00:30 | 0.5 | 30 minutes = 0.5 hours |
| 00:45 | 0.75 | 45 minutes = 0.75 hours |
| 01:00 | 1.0 | 1 hour |
| 01:15 | 1.25 | 1 hour 15 minutes |
| 01:30 | 1.5 | 1 hour 30 minutes |
| 02:00 | 2.0 | 2 hours |
| 02:15 | 2.25 | 2 hours 15 minutes |
| 02:30 | 2.5 | 2 hours 30 minutes |

**Formula:** `Decimal Hours = Hours + (Minutes / 60)`

---

## Salary Calculation Rules

### Rule 1: Absent Employees
If `Attendance Status = "Absent"`:
```
Final Salary = ₹0
```

### Rule 2: Present Employees
If employee is **not absent**, the salary is calculated as:

```
Base Salary = Daily Salary (configured per employee)
Late Deduction = Late Duration (hours) × Late Penalty (₹50/hour)
Early Leave Deduction = Early Leave Duration (hours) × Early Leave Penalty (₹50/hour)
Overtime Payment = Overtime Duration (hours) × Overtime Rate (₹100/hour)

Final Salary = Base Salary - Late Deduction - Early Leave Deduction + Overtime Payment
```

**Important:** Final salary cannot go below ₹0 (capped at minimum 0)

---

## Configured Rates

| Parameter | Default Value |
|-----------|---------------|
| Late Penalty | ₹50 per hour |
| Early Leave Penalty | ₹50 per hour |
| Overtime Rate | ₹100 per hour |

These rates can be configured on the "Salary Calculation Settings" screen.

---

## Example Calculations

### Example 1: Simple Deduction Only

**Employee Data:**
- Employee ID: EMP001
- Daily Salary: ₹300
- Late Duration: 01:00 (1 hour)
- Early Leave Duration: 00:30 (0.5 hours)
- Overtime Duration: 00:00 (0 hours)
- Status: Present

**Calculation:**
```
Base Salary = ₹300
Late Deduction = 1.0 × ₹50 = ₹50
Early Leave Deduction = 0.5 × ₹50 = ₹25
Overtime Payment = 0.0 × ₹100 = ₹0

Final Salary = ₹300 - ₹50 - ₹25 + ₹0 = ₹225
```

---

### Example 2: With Overtime Payment

**Employee Data:**
- Employee ID: EMP002
- Daily Salary: ₹400
- Late Duration: 00:30 (0.5 hours)
- Early Leave Duration: 00:00 (0 hours)
- Overtime Duration: 01:30 (1.5 hours)
- Status: Present

**Calculation:**
```
Base Salary = ₹400
Late Deduction = 0.5 × ₹50 = ₹25
Early Leave Deduction = 0.0 × ₹50 = ₹0
Overtime Payment = 1.5 × ₹100 = ₹150

Final Salary = ₹400 - ₹25 - ₹0 + ₹150 = ₹525
```

---

### Example 3: Absent Employee

**Employee Data:**
- Employee ID: EMP003
- Daily Salary: ₹300
- Attendance Status: **Absent**

**Calculation:**
```
Final Salary = ₹0 (because employee is absent)
```

---

### Example 4: High Deductions (No Negative Salary)

**Employee Data:**
- Employee ID: EMP004
- Daily Salary: ₹100
- Late Duration: 02:00 (2 hours)
- Early Leave Duration: 02:00 (2 hours)
- Overtime Duration: 00:00 (0 hours)
- Status: Present

**Calculation:**
```
Base Salary = ₹100
Late Deduction = 2.0 × ₹50 = ₹100
Early Leave Deduction = 2.0 × ₹50 = ₹100
Overtime Payment = 0.0 × ₹100 = ₹0

Final Salary = ₹100 - ₹100 - ₹100 + ₹0 = -₹100
→ Capped at ₹0 (minimum salary is zero, not negative)

Final Salary = ₹0
```

---

## Multiple Day Aggregation

When multiple attendance files are uploaded, the system:

1. **Parses all files** and converts all time durations to decimal hours
2. **Calculates daily salary** for each day independently
3. **Aggregates totals** across all days in the summary report:
   - Total Days Processed
   - Total Late Hours
   - Total Early Leave Hours
   - Total Overtime Hours
   - Total Salary (sum of all final salaries)
   - Absent Days Count

**Example:**
- Day 1 Final Salary: ₹225
- Day 2 Final Salary: ₹400
- Day 3 Final Salary (Absent): ₹0
- **Total Salary for 3 Days: ₹625**

---

## Debugging & Verification

### Enable Debug Logging

To see detailed salary calculations, set the environment variable:

```bash
export DEBUG_SALARY=true
node server.js
```

This will log:
- Base salary
- Each duration in hours (decimal format)
- Each deduction and payment amount
- Final salary

Example output:
```
[Salary Calc] EMP001 - 2024-12-01:
{
  baseSalary: 300,
  lateDuration: 1.00,
  earlyLeaveDuration: 0.50,
  overtimeDuration: 0.00,
  lateDeduction: 50.00,
  earlyLeaveDeduction: 25.00,
  overtimePayment: 0.00,
  finalSalary: 225.00
}
```

### Enable Parse Debugging

To see sample parsed Excel records:

```bash
export DEBUG_PARSE=true
node server.js
```

This will show the first parsed record from each Excel file, including:
- All employee details
- All time durations (already converted to decimal hours)
- Attendance status

---

## Excel File Format Requirements

Your Excel file should have the following columns (Row 4 should contain headers):

| Column Name | Format | Example |
|------------|--------|---------|
| First Name | Text | John |
| Last Name | Text | Doe |
| Employee ID | Text/Number | EMP001 |
| Department | Text | Sales |
| Date | Date | 2024-12-01 |
| Weekday | Text | Monday |
| Timetable/Shift | Text | 08:00-20:00 |
| Attendance Status | Text | Present / Absent |
| Late Duration | HH:MM | 01:30 |
| Early Leave Duration | HH:MM | 00:45 |
| Overtime Duration | HH:MM | 02:15 |

**Header Matching** (case-insensitive, flexible):
- Late Duration: Must contain "late" AND "duration"
- Early Leave Duration: Must contain "early" AND ("leave" OR "go" OR "departure" OR "exit")
- Overtime Duration: Must contain "overtime" AND "duration"

---

## Workflow

1. **Upload Excel Files**
   - System parses files
   - Time durations (HH:MM) are converted to decimal hours
   - All employee records are stored in session

2. **Set Daily Salaries**
   - Configure salary for each employee (default: ₹300)
   - Can be different for each employee

3. **Configure Penalties (Optional)**
   - Late Penalty (default: ₹50/hour)
   - Early Leave Penalty (default: ₹50/hour)
   - Overtime Rate (default: ₹100/hour)

4. **Calculate Salary**
   - System processes all attendance records
   - Calculates daily salary for each employee, each day
   - Generates summary across all uploaded files

5. **Review Reports**
   - Daily Report: Salary breakdown for each day
   - Summary Report: Aggregate totals across all days
   - Export: Download as Excel file

---

## Troubleshooting

### Issue: All calculations showing as 0

**Possible causes:**
- Duration columns not being parsed (check Excel header names)
- All employees marked as "Absent"

**Solution:**
- Ensure Excel columns match the required names
- Check Attendance Status values
- Enable debug logging to inspect parsed data

### Issue: Incorrect time conversion

**Possible causes:**
- Time format not in HH:MM
- Invalid values (e.g., 25:30, 10:75)

**Solution:**
- Verify Excel time format is `HH:MM` (24-hour)
- Check for seconds (HH:MM:SS should only use first two parts)
- Enable parse debugging to see actual values

### Issue: Negative salary displayed

**Note:** This should not happen as the system caps salary at minimum ₹0.

**If it occurs:**
- Check for extreme values in Late/Early Leave hours
- Verify penalty rates are reasonable
- Enable salary debug logging

---

## Technical Implementation

### Files Modified

1. **server/utils/timeConverter.js**
   - `timeStringToDecimalHours()`: Converts HH:MM to decimal hours with validation
   - Handles edge cases (empty strings, invalid formats, etc.)

2. **server/services/excelParser.js**
   - Parses Excel files row by row
   - Flexible header matching for time duration columns
   - Automatically converts HH:MM durations to decimal hours

3. **server/services/salaryCalculator.js**
   - `calculateDailySalary()`: Main calculation function
   - Handles absent status
   - Applies deductions and overtime
   - Includes validation and optional debug logging

4. **server/controllers/salaryController.js**
   - `calculateSalary()`: API endpoint
   - Accepts employee salaries, penalties, and overtime rate
   - Processes all uploaded records
   - Returns detailed daily and summary reports

---

## Support & Verification

For verification, you can:

1. Upload a test Excel file with known values
2. Set salary to ₹300
3. Use the example from this guide
4. Compare expected vs. actual results
5. Enable debug logging if results don't match

---

**Last Updated:** March 4, 2026

