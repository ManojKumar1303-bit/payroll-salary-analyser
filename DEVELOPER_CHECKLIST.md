# Developer Checklist

Verify your setup before running the application.

## ✅ Pre-Installation

- [ ] Node.js v14+ installed (`node --version`)
- [ ] npm v6+ installed (`npm --version`)
- [ ] Git installed (for version control)
- [ ] A code editor (VS Code recommended)
- [ ] Ports 3000 and 5000 are available
- [ ] Administrator access for creating directories

## ✅ Project Setup

- [ ] Clone or download the project
- [ ] Navigate to project root directory
- [ ] All folders created:
  - [ ] `server/` folder exists
  - [ ] `server/controllers/` folder exists
  - [ ] `server/routes/` folder exists
  - [ ] `server/services/` folder exists
  - [ ] `server/utils/` folder exists
  - [ ] `client/` folder exists
  - [ ] `client/src/` folder exists
  - [ ] `client/src/components/` folder exists
  - [ ] `client/src/pages/` folder exists
  - [ ] `client/src/services/` folder exists

## ✅ Backend Files

**Controllers:**
- [ ] `server/controllers/uploadController.js` exists
- [ ] `server/controllers/salaryController.js` exists

**Routes:**
- [ ] `server/routes/uploadRoutes.js` exists

**Services:**
- [ ] `server/services/excelParser.js` exists
- [ ] `server/services/salaryCalculator.js` exists

**Utils:**
- [ ] `server/utils/timeConverter.js` exists

**Configuration:**
- [ ] `server/server.js` exists
- [ ] `server/package.json` exists
- [ ] `server/.env.example` exists

## ✅ Frontend Files

**Components:**
- [ ] `client/src/components/FileUpload.jsx` exists
- [ ] `client/src/components/SalarySettings.jsx` exists
- [ ] `client/src/components/EmployeeSalaryTable.jsx` exists
- [ ] `client/src/components/DailyReport.jsx` exists
- [ ] `client/src/components/SummaryReport.jsx` exists
- [ ] `client/src/components/Navbar.jsx` exists

**Pages:**
- [ ] `client/src/pages/UploadPage.jsx` exists
- [ ] `client/src/pages/ReportsPage.jsx` exists

**Services:**
- [ ] `client/src/services/api.js` exists

**Configuration:**
- [ ] `client/src/App.jsx` exists
- [ ] `client/src/App.css` exists
- [ ] `client/src/main.jsx` exists
- [ ] `client/index.html` exists
- [ ] `client/vite.config.js` exists
- [ ] `client/package.json` exists

## ✅ Documentation Files

- [ ] `README.md` exists
- [ ] `QUICKSTART.md` exists
- [ ] `API_DOCUMENTATION.md` exists
- [ ] `DEPLOYMENT.md` exists
- [ ] `PROJECT_SUMMARY.md` exists
- [ ] `.gitignore` exists

## ✅ Dependencies Installation

### Backend
```bash
cd server
npm install
```
- [ ] `node_modules/` folder created
- [ ] `package-lock.json` created
- [ ] All dependencies installed:
  - [ ] express
  - [ ] cors
  - [ ] multer
  - [ ] exceljs
  - [ ] dotenv
  - [ ] nodemon (dev)

### Frontend
```bash
cd ../client
npm install
```
- [ ] `node_modules/` folder created
- [ ] `package-lock.json` created
- [ ] All dependencies installed:
  - [ ] react
  - [ ] react-dom
  - [ ] axios
  - [ ] vite (dev)
  - [ ] @vitejs/plugin-react (dev)

## ✅ Configuration

### Backend
- [ ] Create `server/.env` (optional, can use defaults):
  ```
  PORT=5000
  NODE_ENV=development
  ```
- [ ] `server/uploads/` directory will be created automatically

### Frontend
- [ ] Vite config points to correct API URL
- [ ] No configuration needed for development (proxy handled)

## ✅ Development Start

### Terminal 1 - Backend
```bash
cd server
npm run dev
```
- [ ] Server starts on `http://localhost:5000`
- [ ] Shows "Payroll Server is running..."
- [ ] No errors in console

### Terminal 2 - Frontend
```bash
cd client
npm run dev
```
- [ ] Client starts on `http://localhost:3000`
- [ ] No compilation errors
- [ ] Hot reload working

## ✅ Browser Testing

Open `http://localhost:3000`:
- [ ] Application loads successfully
- [ ] Navbar displays correctly
- [ ] "Upload & Calculate" page loads
- [ ] "Reports" page accessible
- [ ] Styling applied correctly
- [ ] No console errors (F12)

## ✅ Feature Testing

### FileUpload Component
- [ ] File input visible
- [ ] Can select Excel files
- [ ] Only Excel files accepted
- [ ] "Upload Files" button present
- [ ] Error messages display
- [ ] Success messages display

### SalarySettings Component
- [ ] Late Penalty input visible
- [ ] Early Leave Penalty input visible
- [ ] Overtime Pay input visible
- [ ] Settings summary displays
- [ ] Values update in real-time

### Backend API
Test these endpoints with curl or Postman:

```bash
# Health check
curl http://localhost:5000/health

# Should return: {"status":"Server is running"}
```

- [ ] GET `/health` returns status
- [ ] POST `/api/upload-attendance` ready (needs file)
- [ ] GET `/api/uploaded-data` returns 400 (no upload yet)
- [ ] GET `/api/reports` returns 400 (no calculation yet)

## ✅ Sample Data Test

1. Create sample Excel file with columns:
   - First Name
   - Last Name
   - ID
   - Department
   - Date
   - Weekday
   - Timetable
   - Attendance Status
   - Worked Hours
   - Absent Duration
   - Late Duration
   - Early Leave Duration
   - Overtime Duration

2. Upload file:
   - [ ] File uploads successfully
   - [ ] Employee list appears
   - [ ] Salary table appears

3. Enter salaries:
   - [ ] Can input values
   - [ ] Can click "Calculate Salary"
   - [ ] Reports display

4. View reports:
   - [ ] Daily reports show
   - [ ] Summary shows correct totals
   - [ ] Can download Excel

## ✅ Code Quality

- [ ] No JavaScript syntax errors
- [ ] No React warnings
- [ ] Console clean (F12)
- [ ] File structure organized
- [ ] Code is readable and commented
- [ ] Component names follow conventions
- [ ] Variable names are descriptive

## ✅ File Validation

Verify key file contents:

### server.js
- [ ] Imports all necessary modules
- [ ] CORS enabled
- [ ] Routes registered
- [ ] Server listens on correct port
- [ ] Error handling middleware present

### App.jsx
- [ ] Imports all components
- [ ] Navigation working
- [ ] Page switching works
- [ ] State management proper

### API endpoints
- [ ] All 6 endpoints implemented
- [ ] Correct HTTP methods
- [ ] Response formats correct
- [ ] Error handling present

## ✅ Performance

- [ ] File upload is responsive
- [ ] Calculations complete quickly
- [ ] Reports render smoothly
- [ ] No memory leaks detected
- [ ] No performance warnings

## ✅ Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers

## ✅ Documentation Review

- [ ] README.md is complete
- [ ] QUICKSTART.md is clear
- [ ] API_DOCUMENTATION.md is detailed
- [ ] DEPLOYMENT.md is helpful
- [ ] PROJECT_SUMMARY.md is informative

## ✅ Deployment Readiness

- [ ] `.env` template created
- [ ] `.gitignore` configured
- [ ] No secrets in code
- [ ] No hardcoded URLs
- [ ] Environment variables used
- [ ] Error messages user-friendly

## ✅ Common Troubleshooting

If something doesn't work:

**Port 3000 in use:**
```bash
# Find and kill process on port 3000
# Linux/Mac: lsof -ti:3000 | xargs kill -9
# Windows: netstat -ano | findstr :3000
```
- [ ] Port freed

**Port 5000 in use:**
```bash
# Find and kill process on port 5000
# Linux/Mac: lsof -ti:5000 | xargs kill -9
# Windows: netstat -ano | findstr :5000
```
- [ ] Port freed

**Dependencies not installing:**
```bash
npm cache clean --force
npm install
```
- [ ] Dependencies installed

**File upload failing:**
- [ ] Check file is .xlsx or .xls
- [ ] Check file has all required columns
- [ ] Check backend is running
- [ ] Check file is not corrupted

**Reports not showing:**
- [ ] Check backend is running
- [ ] Verify upload was successful
- [ ] Verify salaries were entered
- [ ] Check browser console for errors

## ✅ Ready for Production?

### Before deploying:
- [ ] All tests passing
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Security reviewed
- [ ] Environment variables set
- [ ] Backups configured
- [ ] Monitoring setup
- [ ] Documentation updated
- [ ] Team trained
- [ ] Rollback plan ready

## ✅ Final Verification

Run through entire workflow:

1. Start servers
   - [ ] Backend starts successfully
   - [ ] Frontend starts successfully

2. Upload files
   - [ ] Files upload correctly
   - [ ] Employees extracted
   - [ ] Employee count correct

3. Configure settings
   - [ ] Can change penalty rates
   - [ ] Default values correct
   - [ ] Settings apply immediately

4. Enter salaries
   - [ ] All employee fields present
   - [ ] Can input salary values
   - [ ] Validation works

5. Calculate
   - [ ] Calculation completes
   - [ ] Results are accurate
   - [ ] Both reports present

6. Export
   - [ ] Excel file downloads
   - [ ] File opens in Excel
   - [ ] Data formatted correctly
   - [ ] Both sheets present

7. New upload
   - [ ] Can start fresh
   - [ ] Previous data cleared
   - [ ] System ready for new data

## 📝 Notes

Use this checklist:
- When first setting up the project
- Before deploying to production
- For onboarding new developers
- As a reference for troubleshooting
- When verifying features work

---

## 📞 Issues?

1. Check browser console (F12)
2. Check server terminal for errors
3. Review QUICKSTART.md
4. Check API_DOCUMENTATION.md
5. Review README.md troubleshooting section

---

**Status: All items should be checked before considering the project complete.**

Last Updated: March 2026
