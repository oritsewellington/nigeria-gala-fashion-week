const express = require('express');
const sponsorController = require('../controllers/sponsorController');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', sponsorController.getSponsors);

router.use(protect, restrictTo('superadmin', 'host'));

router.post('/', upload.single('logo'), sponsorController.createSponsor);
router.patch('/:id', upload.single('logo'), sponsorController.updateSponsor);
router.delete('/:id', sponsorController.deleteSponsor);

module.exports = router;
