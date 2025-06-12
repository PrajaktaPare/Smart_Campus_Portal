const express = require('express');
const router = express.Router();
const { getPlacements } = require('../controllers/placementController');

router.get('/:userId', getPlacements);

module.exports = router;
