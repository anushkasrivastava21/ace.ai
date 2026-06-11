const express = require('express')
const router = express.Router()
const { reviewAnswers } = require('../controllers/reviewController')

router.post('/answers', reviewAnswers)

module.exports = router