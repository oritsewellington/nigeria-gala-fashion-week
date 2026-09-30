const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.use(protect, restrictTo('superadmin', 'host'));

router.get('/overview', dashboardController.getOverview);
router.get('/transactions', dashboardController.getTransactions);
router.get('/payouts', dashboardController.getPayoutSummary);

module.exports = router;
