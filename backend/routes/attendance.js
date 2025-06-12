const express = require('express');
const router = express.Router();
const { getAttendance } = require('../controllers/attendanceController');

router.get('/:userId', getAttendance);

module.exports = router;
