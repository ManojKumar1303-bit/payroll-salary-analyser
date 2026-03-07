import Employee from '../models/Employee.js';
import ExcelJS from 'exceljs';
import { unlink } from 'fs/promises';

/**
 * GET /api/employees
 * Get all employees
 */
export const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ isActive: true }).sort({ 'createdAt': -1 });
    res.json({
      success: true,
      count: employees.length,
      employees,
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
};

/**
 * GET /api/employees/:employeeId
 * Get a single employee by employeeId
 */
export const getEmployeeById = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await Employee.findOne({ employeeId, isActive: true });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({
      success: true,
      employee,
    });
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
};

/**
 * POST /api/employees
 * Create a new employee
 */
export const createEmployee = async (req, res) => {
  try {
    const { employeeId, name, dailySalary, latePenalty, earlyLeavePenalty, overtimeRate } = req.body;

    // Validate required fields
    if (!employeeId || !name || dailySalary === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: employeeId, name, dailySalary',
      });
    }

    // Check if employee already exists
    const existingEmployee = await Employee.findOne({ employeeId });
    if (existingEmployee) {
      return res.status(409).json({
        error: `Employee with ID ${employeeId} already exists`,
      });
    }

    const employee = new Employee({
      employeeId,
      name,
      dailySalary,
      latePenalty: latePenalty || 50,
      earlyLeavePenalty: earlyLeavePenalty || 50,
      overtimeRate: overtimeRate || 100,
      isActive: true,
    });

    await employee.save();

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      employee,
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    if (error.code === 11000) {
      return res.status(409).json({
        error: `Employee with ID ${req.body.employeeId} already exists`,
      });
    }
    res.status(500).json({ error: 'Failed to create employee' });
  }
};

/**
 * PUT /api/employees/:employeeId
 * Update employee salary and penalty settings
 */
export const updateEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { name, dailySalary, latePenalty, earlyLeavePenalty, overtimeRate } = req.body;

    const employee = await Employee.findOne({ employeeId });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Update only provided fields
    if (name !== undefined) employee.name = name;
    if (dailySalary !== undefined) employee.dailySalary = dailySalary;
    if (latePenalty !== undefined) employee.latePenalty = latePenalty;
    if (earlyLeavePenalty !== undefined) employee.earlyLeavePenalty = earlyLeavePenalty;
    if (overtimeRate !== undefined) employee.overtimeRate = overtimeRate;

    await employee.save();

    res.json({
      success: true,
      message: 'Employee updated successfully',
      employee,
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
};

/**
 * DELETE /api/employees/:employeeId
 * Permanently delete an employee from the database
 */
export const deleteEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Permanently delete the employee from the database
    const result = await Employee.findOneAndDelete({ employeeId });

    if (!result) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({
      success: true,
      message: 'Employee deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
};

/**
 * POST /api/employees/bulk-upsert
 * Create or update multiple employees (bulk operation)
 */
export const bulkUpsertEmployees = async (req, res) => {
  try {
    const { employees } = req.body;

    if (!Array.isArray(employees) || employees.length === 0) {
      return res.status(400).json({
        error: 'Employees array is required and must not be empty',
      });
    }

    const results = {
      created: 0,
      updated: 0,
      failed: 0,
      errors: [],
    };

    for (const emp of employees) {
      try {
        const { employeeId, name, dailySalary, latePenalty, earlyLeavePenalty, overtimeRate } = emp;

        if (!employeeId || !name || dailySalary === undefined) {
          results.failed++;
          results.errors.push({
            employeeId: employeeId || 'unknown',
            error: 'Missing required fields: employeeId, name, dailySalary',
          });
          continue;
        }

        const existingEmployee = await Employee.findOne({ employeeId });

        if (existingEmployee) {
          // Update
          existingEmployee.name = name;
          existingEmployee.dailySalary = dailySalary;
          if (latePenalty !== undefined) existingEmployee.latePenalty = latePenalty;
          if (earlyLeavePenalty !== undefined) existingEmployee.earlyLeavePenalty = earlyLeavePenalty;
          if (overtimeRate !== undefined) existingEmployee.overtimeRate = overtimeRate;
          existingEmployee.isActive = true; // Reactivate if previously deleted
          await existingEmployee.save();
          results.updated++;
        } else {
          // Create
          const newEmployee = new Employee({
            employeeId,
            name,
            dailySalary,
            latePenalty: latePenalty || 50,
            earlyLeavePenalty: earlyLeavePenalty || 50,
            overtimeRate: overtimeRate || 100,
            isActive: true,
          });
          await newEmployee.save();
          results.created++;
        }
      } catch (error) {
        results.failed++;
        results.errors.push({
          employeeId: emp.employeeId || 'unknown',
          error: error.message,
        });
      }
    }

    res.json({
      success: true,
      message: `Bulk upsert completed: ${results.created} created, ${results.updated} updated, ${results.failed} failed`,
      results,
    });
  } catch (error) {
    console.error('Error in bulk upsert:', error);
    res.status(500).json({ error: 'Bulk upsert failed' });
  }
};

/**
 * POST /api/employees/import
 * Import employees from Excel file
 * Expected columns: First Name, Last Name, ID
 * Maps: ID → employeeId, First Name + Last Name → name
 * Creates employees with default salary and penalty values
 */
export const importEmployees = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    let stats = {
      addedEmployees: 0,
      skippedEmployees: 0,
      errors: [],
    };

    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);

      if (!workbook.worksheets.length) {
        return res.status(400).json({ error: 'Excel file is empty' });
      }

      const worksheet = workbook.worksheets[0];
      let headerRowIndex = -1;
      let firstNameColIndex = -1;
      let lastNameColIndex = -1;
      let idColIndex = -1;

      // Find header row and column indices by exact column names
      worksheet.eachRow((row, rowNumber) => {
        if (headerRowIndex === -1) {
          const headers = row.values || [];
          for (let colIndex = 1; colIndex < headers.length; colIndex++) {
            const headerCell = headers[colIndex];
            const headerText = String(headerCell || '').trim();
            
            if (headerText === 'First Name') {
              firstNameColIndex = colIndex;
            }
            if (headerText === 'Last Name') {
              lastNameColIndex = colIndex;
            }
            if (headerText === 'ID') {
              idColIndex = colIndex;
            }
          }

          // If all headers found, mark this as header row
          if (firstNameColIndex !== -1 && idColIndex !== -1) {
            headerRowIndex = rowNumber;
          }
        }
      });

      // If headers not explicitly found, assume first row is headers
      if (headerRowIndex === -1) {
        const firstRow = worksheet.getRow(1);
        const values = firstRow.values || [];
        
        // Try to identify columns by exact name match
        for (let colIndex = 1; colIndex < values.length; colIndex++) {
          const cellValue = String(values[colIndex] || '').trim();
          if (cellValue === 'First Name') {
            firstNameColIndex = colIndex;
          }
          if (cellValue === 'Last Name') {
            lastNameColIndex = colIndex;
          }
          if (cellValue === 'ID') {
            idColIndex = colIndex;
          }
        }

        // If not found, try flexible matching as fallback
        if (firstNameColIndex === -1 || idColIndex === -1) {
          for (let colIndex = 1; colIndex < values.length; colIndex++) {
            const cellValue = String(values[colIndex] || '').toLowerCase().trim();
            if (cellValue.includes('first') && cellValue.includes('name')) {
              firstNameColIndex = colIndex;
            }
            if (cellValue.includes('last') && cellValue.includes('name')) {
              lastNameColIndex = colIndex;
            }
            if (cellValue === 'id' || cellValue.includes('employee') && cellValue.includes('id')) {
              idColIndex = colIndex;
            }
          }
        }

        // If still not found, assume standard position: First Name (1), Last Name (2), ID (3)
        if (firstNameColIndex === -1) firstNameColIndex = 1;
        if (lastNameColIndex === -1) lastNameColIndex = 2;
        if (idColIndex === -1) idColIndex = 3;
        
        headerRowIndex = 1;
      }

      // Process data rows (skip header row)
      const rows = [];
      worksheet.eachRow((row, index) => {
        if (index <= headerRowIndex) return; // Skip header
        rows.push(row);
      });

      // Process all rows sequentially
      for (const row of rows) {
        const values = row.values || [];
        const employeeId = String(values[idColIndex] || '').trim();
        const firstName = String(values[firstNameColIndex] || '').trim();
        const lastName = String(values[lastNameColIndex] || '').trim();

        // Skip rows where ID is empty
        if (!employeeId) {
          continue;
        }

        // Construct name: First Name + Last Name (handle missing/empty Last Name)
        let name;
        if (lastName && lastName !== '--') {
          name = `${firstName} ${lastName}`.trim();
        } else {
          name = firstName.trim();
        }

        // Skip if name is empty
        if (!name) {
          continue;
        }

        try {
          // Check if employee already exists
          const existingEmployee = await Employee.findOne({ employeeId });

          if (existingEmployee) {
            stats.skippedEmployees++;
            continue;
          }

          // Create new employee with default values
          const newEmployee = new Employee({
            employeeId,
            name,
            dailySalary: 0,
            latePenalty: 0,
            earlyLeavePenalty: 0,
            overtimeRate: 0,
            isActive: true,
          });

          await newEmployee.save();
          stats.addedEmployees++;
        } catch (error) {
          console.error(`Error importing employee ${employeeId}:`, error);
          stats.errors.push({
            employeeId,
            error: error.message,
          });
        }
      }

      // Delete temporary file
      try {
        await unlink(filePath);
      } catch (delErr) {
        console.warn(`Failed to delete temp file ${filePath}:`, delErr.message);
      }

      res.json({
        success: true,
        message: `${stats.addedEmployees} employees imported successfully. ${stats.skippedEmployees} duplicates skipped.`,
        ...stats,
      });
    } catch (parseError) {
      console.error('Error parsing Excel file:', parseError);
      
      // Delete temporary file
      try {
        await unlink(filePath);
      } catch (delErr) {
        console.warn(`Failed to delete temp file ${filePath}:`, delErr.message);
      }

      res.status(400).json({
        error: 'Failed to parse Excel file. Ensure it has "First Name", "Last Name", and "ID" columns.',
      });
    }
  } catch (error) {
    console.error('Error in importEmployees:', error);
    res.status(500).json({ error: 'Failed to import employees' });
  }
};
