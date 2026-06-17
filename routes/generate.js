const express = require('express')
const router = express.Router()
const authenticate = require('../middleware/auth')
const { generatePaper } = require('../controllers/generateController')

router.post('/paper', authenticate, generatePaper)

module.exports = router