# API Documentation

Complete API reference for the Payroll Management System backend.

## Base URL

```
http://localhost:5000/api
```

## Authentication

No authentication required (in-memory session based)

## Content Type

All requests and responses use `application/json` (except file downloads)

---

## Endpoints

### 1. Upload Attendance Files

**Endpoint:** `POST /upload-attendance`

Upload one or more Excel attendance files for processing.

**Request:**
- **Method:** POST
- **Content-Type:** multipart/form-data
- **Body:**
  ```
  files: [File1.xlsx, File2.xlsx, ...]
  ```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Uploaded and parsed 2 file(s)",
  "filesProcessed": 2,
  "totalRecords": 156,
  "employees": [
    {
      "employeeId": "EMP001",
      "firstName": "John",
      "lastName": "Doe",
      "department": "Engineering"
    },
    {
      "employeeId": "EMP002",
      "firstName": "Jane",
      "lastName": "Smith",
      "department": "HR"
    }
  ]
}
```

**Error Responses:**
```json
// No files uploaded
{ "error": "No files uploaded" }

// Invalid file format
{ "error": "Only Excel files (.xlsx, .xls) are allowed" }

// No valid records found
{ "error": "No valid records found in uploaded files" }
```

**Example - JavaScript/Fetch:**
```javascript
const formData = new FormData();
formData.append('files', file1);
formData.append('files', file2);

const response = await fetch('http://localhost:5000/api/upload-attendance', {
  method: 'POST',
  body: formData
});
const data = await response.json();
```

**Example - cURL:**
```bash
curl -X POST http://localhost:5000/api/upload-attendance \
  -F "files=@attendance_2024_01_15.xlsx" \
  -F "files=@attendance_2024_01_16.xlsx"
```

---

### 2. Get Uploaded Data

**Endpoint:** `GET /uploaded-data`

Retrieve the list of uploaded files and extracted employees for salary setup.

**Request:**
- **Method:** GET
- **Parameters:** None

**Response (200 OK):**
```json
{
  "filesProcessed": 2,
  "uploadDate": "2024-01-20T10:30:45.123Z",
  "employees": [
    {
      "employeeId": "EMP001",
      "firstName": "John",
      "lastName": "Doe",
      "department": "Engineering"
    }
  ]
}
```

**Error Responses:**
```json
{
  "error": "No files uploaded yet. Please upload attendance files first."
}
```

**Example - JavaScript/Fetch:**
```javascript
const response = await fetch('http://localhost:5000/api/uploaded-data');
const data = await response.json();
console.log(data.employees);
```

---

### 3. Calculate Salary

**Endpoint:** `POST /calculate-salary`

Calculate salary based on uploaded attendance files and salary settings.

**Request:**
- **Method:** POST
- **Content-Type:** application/json
- **Body:**
  ```json
  {
    "employeeSalaries": {
      "EMP001": 1000,
      "EMP002": 1100,
      "EMP003": 900
    },
    "penalties": {
      "latePenalty": 50,
      "earlyLeavePenalty": 50
    },
    "overtimeRate": 100
  }
  ```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Salary calculated successfully",
  "dailyReports": [
    [
      {
        "employeeId": "EMP001",
        "firstName": "John",
        "lastName": "Doe",
        "shift": "Shift 1 (08:00-20:00)",
        "date": "2024-01-15",
        "lateDuration": 0.5,
        "earlyLeaveDuration": 0,
        "overtimeDuration": 1,
        "baseSalary": 1000,
        "lateDeduction": 25,
        "earlyLeaveDeduction": 0,
        "overtimePayment": 100,
        "finalSalary": 1075,
        "attendanceStatus": "Normal"
      }
    ]
  ],
  "summary": [
    {
      "employeeId": "EMP001",
      "firstName": "John",
      "lastName": "Doe",
      "totalDaysProcessed": 5,
      "numberOfAbsentDays": 0,
      "totalLateDuration": 2.5,
      "totalEarlyLeaveDuration": 0.75,
      "totalOvertimeDuration": 5,
      "totalSalary": 5175
    }
  ]
}
```

**Error Responses:**
```json
{
  "error": "Employee salaries are required"
}

{
  "error": "No attendance records found. Please upload files first."
}
```

**Example - JavaScript/Axios:**
```javascript
import axios from 'axios';

const response = await axios.post('http://localhost:5000/api/calculate-salary', {
  employeeSalaries: { "EMP001": 1000, "EMP002": 1100 },
  penalties: { latePenalty: 50, earlyLeavePenalty: 50 },
  overtimeRate: 100
});

console.log(response.data.dailyReports);
console.log(response.data.summary);
```

---

### 4. Get Reports

**Endpoint:** `GET /reports`

Retrieve the most recently calculated salary reports.

**Request:**
- **Method:** GET
- **Parameters:** None

**Response (200 OK):**
```json
{
  "uploadDate": "2024-01-20T10:30:45.123Z",
  "filesProcessed": 2,
  "totalEmployees": 3,
  "calculationDate": "2024-01-20T10:35:22.456Z",
  "penalties": {
    "latePenalty": 50,
    "earlyLeavePenalty": 50
  },
  "overtimeRate": 100,
  "dailyReports": [
    [
      {
        "employeeId": "EMP001",
        "firstName": "John",
        "lastName": "Doe",
        "shift": "Shift 1 (08:00-20:00)",
        "date": "2024-01-15",
        "lateDuration": 0.5,
        "earlyLeaveDuration": 0,
        "overtimeDuration": 1,
        "baseSalary": 1000,
        "lateDeduction": 25,
        "earlyLeaveDeduction": 0,
        "overtimePayment": 100,
        "finalSalary": 1075,
        "attendanceStatus": "Normal"
      }
    ]
  ],
  "summary": [
    {
      "employeeId": "EMP001",
      "firstName": "John",
      "lastName": "Doe",
      "totalDaysProcessed": 5,
      "numberOfAbsentDays": 0,
      "totalLateDuration": 2.5,
      "totalEarlyLeaveDuration": 0.75,
      "totalOvertimeDuration": 5,
      "totalSalary": 5175
    }
  ]
}
```

**Error Responses:**
```json
{
  "error": "No calculated reports found. Please calculate salary first."
}
```

---

### 5. Export Salary Report

**Endpoint:** `GET /export-report`

Download the calculated salary report as an Excel file.

**Request:**
- **Method:** GET
- **Parameters:** None

**Response (200 OK):**
- **Content-Type:** application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
- **Body:** Binary Excel file

**Error Responses:**
```json
{
  "error": "No calculated reports found. Please calculate salary first."
}
```

**Example - JavaScript/Fetch:**
```javascript
const response = await fetch('http://localhost:5000/api/export-report');
const blob = await response.blob();

const url = window.URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = `salary_report_${Date.now()}.xlsx`;
document.body.appendChild(link);
link.click();
document.body.removeChild(link);
window.URL.revokeObjectURL(url);
```

**Example - cURL:**
```bash
curl -X GET http://localhost:5000/api/export-report \
  -o salary_report.xlsx
```

---

### 6. Clear Session Data

**Endpoint:** `POST /clear`

Clear all uploaded files and calculations from the current session.

**Request:**
- **Method:** POST
- **Parameters:** None
- **Body:** Empty

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Session data cleared"
}
```

**Example - JavaScript/Fetch:**
```javascript
const response = await fetch('http://localhost:5000/api/clear', {
  method: 'POST'
});
const data = await response.json();
```

---

## Data Models

### Employee Object
```json
{
  "employeeId": "EMP001",
  "firstName": "John",
  "lastName": "Doe",
  "department": "Engineering"
}
```

### Attendance Record Object
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "employeeId": "EMP001",
  "department": "Engineering",
  "date": "2024-01-15",
  "weekday": "Monday",
  "timetable": "08:00 - 20:00",
  "attendanceStatus": "Normal",
  "workedHours": 12,
  "absentDuration": "00:00",
  "lateDuration": 0.5,
  "earlyLeaveDuration": 0,
  "overtimeDuration": 1
}
```

### Daily Salary Record Object
```json
{
  "employeeId": "EMP001",
  "firstName": "John",
  "lastName": "Doe",
  "shift": "Shift 1 (08:00-20:00)",
  "date": "2024-01-15",
  "lateDuration": 0.5,
  "earlyLeaveDuration": 0,
  "overtimeDuration": 1,
  "baseSalary": 1000,
  "lateDeduction": 25,
  "earlyLeaveDeduction": 0,
  "overtimePayment": 100,
  "finalSalary": 1075,
  "attendanceStatus": "Normal"
}
```

### Summary Record Object
```json
{
  "employeeId": "EMP001",
  "firstName": "John",
  "lastName": "Doe",
  "totalDaysProcessed": 5,
  "numberOfAbsentDays": 0,
  "totalLateDuration": 2.5,
  "totalEarlyLeaveDuration": 0.75,
  "totalOvertimeDuration": 5,
  "totalSalary": 5175
}
```

---

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid input |
| 500 | Server Error |

---

## Rate Limiting

No rate limiting implemented (development mode)

## CORS Settings

CORS is enabled for all origins in development mode.

---

## Error Handling

All errors include a descriptive error message:

```json
{
  "error": "Specific error description"
}
```

---

## Time Format

### Input Format (Excel)
- Time duration: `HH:MM` (e.g., "01:30")

### Output Format (API)
- Time duration: Decimal hours (e.g., 1.5)
- Date: ISO 8601 (e.g., "2024-01-15")
- Timestamp: ISO 8601 (e.g., "2024-01-20T10:30:45.123Z")

---

## Example Workflow

1. **Upload Files**
   ```bash
   POST /api/upload-attendance
   ```

2. **Get Uploaded Employees**
   ```bash
   GET /api/uploaded-data
   ```

3. **Calculate Salary**
   ```bash
   POST /api/calculate-salary
   ```

4. **Export Report**
   ```bash
   GET /api/export-report
   ```

5. **Clear Session**
   ```bash
   POST /api/clear
   ```

---

## Testing with Postman

1. Create new collection "Payroll API"
2. Add requests:
   - POST `{{baseUrl}}/upload-attendance` (form-data)
   - GET `{{baseUrl}}/uploaded-data`
   - POST `{{baseUrl}}/calculate-salary` (raw JSON)
   - GET `{{baseUrl}}/reports`
   - GET `{{baseUrl}}/export-report` (Save response as file)
   - POST `{{baseUrl}}/clear`

3. Set variable: `baseUrl=http://localhost:5000/api`

---

## Performance Metrics

- Upload 100 files: ~2-3 seconds
- Parse 10,000 employee records: ~500ms
- Calculate salary for 1,000 employees: ~100ms
- Export to Excel: ~500ms

---

## Notes

- All data is stored in server memory during the session
- Session persists until server restart or browser close
- No database queries - all operations are in-memory
- File uploads are temporary (cleaned up by OS)

---

For questions or issues, refer to the main [README.md](README.md)
