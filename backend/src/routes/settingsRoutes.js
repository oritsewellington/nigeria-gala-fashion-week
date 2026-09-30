const express = require('express');
const settingsController = require('../controllers/settingsController');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/public', settingsController.getPublicSettings);
router.get('/public-stats', settingsController.getPublicStats);

router.use(protect, restrictTo('superadmin', 'host'));

router.get('/', settingsController.getSettings);
router.patch('/', upload.array('heroImages', 6), restrictTo('superadmin'), settingsController.updateSettings);
router.delete('/hero-image/:publicId', restrictTo('superadmin'), settingsController.deleteHeroImage);

module.exports = router;
