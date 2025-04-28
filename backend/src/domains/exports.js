const express = require('express');
const { Parser } = require('json2csv');
const router = express.Router();


// Middleware to check admin permissions
const checkAdminPermission = (req, res, next) => {
  if (!req.user || !['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};

// Helper function for exporting table data
const exportTableData = async (model, filename, res) => {
  try {
    const data = await model.findAll();
    const jsonData = data.map(item => item.toJSON());
    
    if (jsonData.length === 0) {
      return res.status(404).json({ message: `No ${filename} data found` });
    }
    
    const fields = Object.keys(jsonData[0]);
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(jsonData);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);
    res.status(200).send(csv);
  } catch (error) {
    console.error(`Error exporting ${filename}:`, error);
    res.status(500).json({ message: `Failed to export ${filename}` });
  }
};

// 1. Export Users
router.get('/export-users', checkAdminPermission, async (req, res) => {
  await exportTableData(User, 'users', res);
});

// 2. Export Businesses
router.get('/export-businesses', checkAdminPermission, async (req, res) => {
  await exportTableData(Business, 'businesses', res);
});

// 3. Export Reviewers
router.get('/export-reviewers', checkAdminPermission, async (req, res) => {
  await exportTableData(Reviewer, 'reviewers', res);
});

// 4. Export Services
router.get('/export-services', checkAdminPermission, async (req, res) => {
  await exportTableData(Service, 'services', res);
});

// 5. Export Transactions
router.get('/export-transactions', checkAdminPermission, async (req, res) => {
  await exportTableData(Transaction, 'transactions', res);
});

// 6. Export Claims
router.get('/export-claims', checkAdminPermission, async (req, res) => {
  await exportTableData(Claim, 'claims', res);
});

// 7. Export Admin Settings
router.get('/export-admin-settings', checkAdminPermission, async (req, res) => {
  await exportTableData(AdminSetting, 'admin-settings', res);
});

module.exports = router;