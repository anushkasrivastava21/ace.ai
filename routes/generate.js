const express = require('express')
const router = express.Router()
const { generatePaper } = require('../controllers/generateController')

router.post('/paper', generatePaper)

module.exports = router