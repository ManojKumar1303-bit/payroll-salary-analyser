# Troubleshooting Guide

Solutions for common issues and problems.

## 🔴 Critical Issues

### Server Won't Start

**Error: `Port 5000 already in use`**

```bash
# Linux/Mac - Find and kill process
lsof -i :5000
kill -9 <PID>

# Windows - Find and kill process
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or use different port
PORT=5001 npm run dev
```

**Error: `Module not found: exceljs`**

```bash
# Reinstall dependencies
cd server
npm install

# Or install specific package
npm install exceljs
```

**Error: `Cannot find module 'express'`**

```bash
cd server
npm install
npm install express
```

**Error: `EACCES: permission denied`**

```bash
# Fix permissions
sudo chown -R $USER:$USER ./server
npm install

# Or use npm without sudo
npm config set prefix ~/.npm-global
```

---

## 🟡 Server Issues

### Backend Starts but Frontend Can't Connect

**Error: `Cannot POST /api/upload-attendance`**

1. Check backend is actually running
   ```bash
   # Terminal where backend runs should show:
   # "Payroll Server is running on http://localhost:5000"
   ```

2. Check port 5000 is accessible
   ```bash
   curl http://localhost:5000/health
   # Should return: {"status":"Server is running"}
   ```

3. Check CORS is configured
   - In `server/server.js`, CORS should be enabled:
   ```javascript
   app.use(cors());
   ```

4. Check API URL in frontend
   - Should be `http://localhost:5000/api`

**Solution:**
- Kill and restart backend server
- Check firewall allows port 5000
- Check no other process uses port 5000

### Server Crashes on File Upload

**Error: `Cannot read property 'path' of undefined`**

This means multer didn't properly process the file upload.

1. Check file is being sent correctly
2. Check multer is configured
3. Check `server/uploads` directory exists

**Solution:**
```bash
# Create uploads directory
mkdir server/uploads

# Restart server
npm run dev
```

### Server Memory Usage High

**Issue: Memory grows after multiple uploads**

This is normal for in-memory processing. If it's excessive:

```bash
# Restart server periodically
pm2 restart payroll-server

# Or set memory limit
node --max-old-space-size=4096 server.js
```

**Solution:**
- Clear old session data periodically
- Consider implementing a queue system for large uploads
- Monitor with: `node --trace-warnings server.js`

---

## 🟡 Frontend Issues

### Frontend Won't Start

**Error: `Port 3000 already in use`**

```bash
# Linux/Mac - Find and kill process
lsof -i :3000
kill -9 <PID>

# Windows - Find and kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port
npm run dev -- --port 3001
```

**Error: `Module not found: react`**

```bash
cd client
npm install
npm install react react-dom
```

**Error: `Vite configuration failed`**

Check `client/vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
})
```

**Solution:**
```bash
cd client
npm install
npm run dev
```

### Blank Page or No Content

**Issue: Browser shows blank page**

1. Check browser console (F12)
2. Check for errors in the terminal where frontend runs
3. Check `index.html` has `<div id="root"></div>`

**Solution:**
- Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- Clear browser cache
- Restart frontend server

### Styling Not Applied

**Issue: Page appears without CSS styling**

1. Check `App.css` is imported in `App.jsx`:
   ```javascript
   import './App.css'
   ```

2. Check CSS file exists: `client/src/App.css`

**Solution:**
```bash
# Restart frontend
npm run dev

# Or hard reload browser
Ctrl+Shift+R
```

### Navigation Not Working

**Issue: Clicking nav buttons doesn't switch pages**

1. Check `Navbar.jsx` has correct onClick handlers
2. Check page components are imported in `App.jsx`
3. Check `currentPage` state updates

**Solution:**
- Restart frontend server
- Check browser console for errors
- Verify `pages/UploadPage.jsx` and `pages/ReportsPage.jsx` exist

---

## 🟡 File Upload Issues

### File Upload Fails Silently

**Issue: Upload button does nothing**

1. Check backend is running
2. Check file is valid Excel (.xlsx or .xls)
3. Check file isn't corrupted
4. Check file size is under 50MB

**Solution:**
```javascript
// Check FileUpload.jsx logs
// Look for error in network tab (F12)
// Check server console for errors
```

### "Only Excel files are allowed" Error

**Issue: Excel file rejected**

1. Check file extension is .xlsx or .xls
2. Check file is actually Excel format
3. Try saving Excel file again to ensure valid format

**Solution:**
```bash
# Create new test Excel file with correct format
# See QUICKSTART.md for sample data generation
```

### "No valid records found in uploaded files"

**Issue: File uploaded but no data extracted**

1. Check Excel file has required columns:
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

2. Check at least First Name and ID exist
3. Check data is in rows (not just headers)

**Solution:**
- Use sample data from QUICKSTART.md
- Verify all columns are present
- Ensure data rows exist below headers

### File Upload Takes Too Long

**Issue: Upload hangs or times out**

1. Check file size (max 50MB)
2. Check connection speed
3. Check server has enough resources

**Solution:**
```bash
# Increase timeout in axios (if needed)
// services/api.js
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000  // 30 seconds
})

# For large files, split into smaller uploads
```

---

## 🟡 Calculation Issues

### Salary Calculation Results Wrong

**Issue: Final salary doesn't match expected value**

Check the calculation formula:
```
Final Salary = Base Salary - Late Deduction - Early Leave Deduction + Overtime Payment

Where:
  Late Deduction = Late Hours × Late Penalty Rate
  Early Leave Deduction = Early Leave Hours × Early Leave Penalty Rate
  Overtime Payment = Overtime Hours × Overtime Rate
```

Common mistakes:
- Time format not converted (should be decimal)
- Salary for zero (missing in salary setup)
- Wrong penalty rates applied

**Solution:**
1. Verify employee salary is entered correctly
2. Check penalty rates are correct
3. Check time durations are in correct format (01:30 = 1.5 hours)
4. Verify Excel data is correct

### All Employees Show 0 Salary

**Issue: Final salary is 0 for everyone**

1. Check salary setup - all employees must have salary entered
2. Check spreadsheet has "Absent" status (missing column defaults to not present)

**Solution:**
- Verify salary setup table filled completely
- Check Excel file doesn't have unintended "Absent" status

### No Reports Generated

**Issue: Click "Calculate Salary" but no reports appear**

1. Check backend is running
2. Check uploaded files have valid data
3. Check all employee salaries are entered
4. Check browser console for errors

**Solution:**
```javascript
// Enable client-side logging
// Check developer tools (F12) → Console tab
// Check server console for errors
```

---

## 🟡 Export Issues

### Excel Export Fails

**Error: "Failed to export salary report"**

1. Check backend is running
2. Check calculations were done
3. Check server has enough memory
4. Check disk has space

**Solution:**
```bash
# Restart server
npm run dev

# Or check free disk space
# Windows: `dir C:\`
# Linux: `df -h`
```

### Downloaded File is Corrupted

**Issue: Excel file won't open**

1. Check file downloaded completely
2. Check browser didn't interrupt download
3. Check file size looks reasonable

**Solution:**
- Retry export
- Try different browser
- Check file extension is .xlsx

### Excel File Missing Data

**Issue: Excel file empty or incomplete**

1. Check calculations completed successfully
2. Check both sheets exist (Daily Reports and Summary)
3. Check data displays correctly in browser

**Solution:**
```bash
# Restart from file upload
# Recalculate salary
# Try exporting again
```

---

## 🟡 UI/Display Issues

### Text Appears Overlapped

**Issue: Layout is broken**

1. Hard refresh: `Ctrl+Shift+R`
2. Clear browser cache
3. Check CSS file is loaded

**Solution:**
- Drag browser corner to resize
- Check responsive breakpoints
- Restart frontend server

### Tables Not Displaying Correctly

**Issue: Table columns misaligned**

1. Check browser window width
2. Try zooming out (Ctrl + -)
3. Check on different browser

**Solution:**
- Use full-screen browser
- Test on desktop vs mobile
- Check CSS media queries

### Colors Look Wrong

**Issue: UI colors different than expected**

1. Check CSS file loaded: F12 → Network tab → App.css
2. Check no other CSS conflicting
3. Check browser dark mode setting

**Solution:**
- Hard refresh browser
- Disable browser extensions
- Test in incognito mode

---

## 🔵 Performance Issues

### Slow File Upload

**Issue: Upload is very slow**

1. Check network speed
2. Check CPU usage (Task Manager/Activity Monitor)
3. Check file size is reasonable
4. Check server resources

**Solution:**
```bash
# Monitor server
top  # Linux/Mac
tasklist  # Windows

# Upload smaller files
# Split large file into multiple files
```

### Slow Calculation

**Issue: Salary calculation takes long time**

1. Check file size (how many records)
2. Check server resources
3. Check no other processes using resources

**Solution:**
```bash
# For 10,000+ records, expect 5-10 seconds
# Monitor memory usage
# Consider upgrading server specs
```

### Browser Freezes During Upload

**Issue: UI unresponsive during calculation**

This is normal for large datasets (in-memory processing).

**Solution:**
- Browser should respond after calculation
- Use smaller file batches
- Upgrade server memory
- Consider async processing (future enhancement)

---

## 🔵 Data Issues

### Employees Not Appearing

**Issue: Uploaded files but no employees extracted**

1. Check file format is valid Excel
2. Check required columns exist
3. Check Employee ID column has values
4. Check First Name column has values

**Solution:**
- Verify Excel structure matches requirements
- Check for typos in column names (case-sensitive in code)
- Create new test file

### Duplicate Employees in List

**Issue: Same employee appears multiple times**

This shouldn't happen - the system deduplicates by Employee ID.

**Check:**
- Excel file has duplicate Employee IDs
- Try uploading one file at a time

**Solution:**
- Clean up Excel data to remove duplicates
- Or it's expected if different files have same employee

---

## 🟣 Browser Console Errors

### Uncaught SyntaxError

**Issue: JavaScript syntax error**

Look at the error message and line number:
- Check file for typos
- Verify file was saved correctly

**Solution:**
```bash
# Restart frontend
npm run dev

# Or check for corrupted files
# Restore from backup
```

### Undefined Reference Error

**Example: Cannot read property 'map' of undefined**

Means data isn't loaded yet.

**Solution:**
- Wait for API response
- Verify backend is running
- Check API calls are correct

### CORS Error

**Error: Access to XMLHttpRequest blocked by CORS policy**

Backend CORS not configured correctly.

**Solution:**
Check `server/server.js`:
```javascript
import cors from 'cors';
app.use(cors());  // Required
```

Restart backend server.

---

## 🟣 Network Issues

### API Timeout

**Error: Network request timeout**

1. Check backend is running
2. Check internet connection
3. Check firewall allows connection

**Solution:**
```bash
# Test connection
curl http://localhost:5000/health

# Restart backend
npm run dev
```

### 404 Not Found

**Error: Endpoint not found**

1. Check endpoint URL is correct
2. Check all routes are configured
3. Check backend has restarted

**Solution:**
- Verify endpoint in `API_DOCUMENTATION.md`
- Check route file `uploadRoutes.js`
- Restart backend server

### 500 Server Error

**Error: Internal Server Error**

1. Check server console for error
2. Check logs for details
3. Check request format is correct

**Solution:**
- Restart server
- Check request body format
- Look at server console error message

---

## ✅ Quick Fixes Checklist

If something doesn't work, try these in order:

1. [ ] Hard refresh browser: `Ctrl+Shift+R`
2. [ ] Restart frontend: Stop with `Ctrl+C`, then `npm run dev`
3. [ ] Restart backend: Stop with `Ctrl+C`, then `npm run dev`
4. [ ] Check browser console: `F12` → Console tab
5. [ ] Check server console: Look at terminal output
6. [ ] Kill all node processes and restart
7. [ ] Clear npm cache: `npm cache clean --force`
8. [ ] Reinstall dependencies:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
9. [ ] Check ports are free: `lsof -i :3000` and `lsof -i :5000`
10. [ ] Restart the computer (if all else fails)

---

## 📞 Getting Help

1. **Check documentation:** `README.md`, `API_DOCUMENTATION.md`
2. **Review code comments:** Check file for inline documentation
3. **Search issues:** GitHub issues if using Git
4. **Review logs:** Check both browser and server console
5. **Create minimal test case:** Isolate the problem
6. **Ask for help:** Include error message and steps to reproduce

---

## 🔧 Debug Mode

Enable more detailed logging:

**Server:**
```javascript
// In server.js
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});
```

**Frontend:**
```javascript
// In api.js
apiClient.interceptors.response.use(response => {
  console.log('API Response:', response.data);
  return response;
});
```

---

## 📋 When Contacting Support

Include:

1. **Error message** (exact text)
2. **Steps to reproduce** (how to trigger the issue)
3. **What you expect** (expected behavior)
4. **What you see** (actual behavior)
5. **Environment details:**
   - OS (Windows/Mac/Linux)
   - Node version (`node --version`)
   - npm version (`npm --version`)
6. **Screenshot** (if visual issue)
7. **Console errors** (`F12` → Console tab)
8. **Server logs** (terminal output)

---

## 📚 Additional Resources

- [Node.js Documentation](https://nodejs.org/en/docs/)
- [Express.js Guide](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [Vite Guide](https://vitejs.dev/)
- [ExcelJS Library](https://github.com/exceljs/exceljs)

---

Last Updated: March 2026
Version: 1.0
