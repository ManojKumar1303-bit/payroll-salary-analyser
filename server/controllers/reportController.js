import SummaryReport from '../models/SummaryReport.js';

/**
 * Get all summary reports (excluding the heavy reportData)
 * GET /api/report-history
 */
export const getReportHistory = async (req, res) => {
  try {
    // Exclude employees for an optimized list view
    const reports = await SummaryReport.find({}, { employees: 0 })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, reports });
  } catch (error) {
    console.error('Error fetching report history:', error);
    res.status(500).json({ error: 'Failed to fetch report history' });
  }
};

/**
 * Get a specific summary report by ID (including all reportData)
 * GET /api/report-history/:id
 */
export const getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await SummaryReport.findById(id);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.status(200).json({ success: true, report });
  } catch (error) {
    console.error(`Error fetching report ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch report details' });
  }
};

/**
 * Delete a specific summary report by ID
 * DELETE /api/reports/:id
 */
export const deleteReportHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await SummaryReport.findByIdAndDelete(id);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.status(200).json({ success: true, message: 'Report deleted successfully' });
  } catch (error) {
    console.error(`Error deleting report ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete report' });
  }
};
