const express = require('express');
const contestantController = require('../controllers/contestantController');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', contestantController.getContestants);
router.get('/leaderboard/:categorySlug', contestantController.getLeaderboardByCategory);
router.get('/:id', contestantController.getContestant);

router.use(protect, restrictTo('superadmin', 'host'));

router.post('/', upload.single('photo'), contestantController.createContestant);
router.patch('/:id', upload.single('photo'), contestantController.updateContestant);
router.delete('/:id', contestantController.deleteContestant);

module.exports = router;
