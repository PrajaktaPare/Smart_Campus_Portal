const express = require('express');
const router = express.Router();
const { getEvents, rsvpEvent } = require('../controllers/eventController');

router.get('/', getEvents);
router.post('/:eventId/rsvp', rsvpEvent);

module.exports = router;
