const express = require('express')
const router = express.Router()
const authenticate = require('../middleware/auth')
const { reviewAnswers, getAttempts, getAttemptById } = require('../controllers/reviewController')

router.post('/answers', authenticate, reviewAnswers)
router.get('/attempts', authenticate, getAttempts)
router.get('/attempts/:id', authenticate, getAttemptById)

module.exports = router