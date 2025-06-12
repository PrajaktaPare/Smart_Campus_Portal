const express = require('express');
const router = express.Router();
const { getGrades } = require('../controllers/gradeController');

router.get('/:userId', getGrades);

module.exports = router;
