const express = require('express')
const router = express.Router()
const authenticate = require('../middleware/auth')
const { generatePaper, getLatestPaper, getPaperById, renamePaper } = require('../controllers/generateController')

router.post('/paper', authenticate, generatePaper)
router.get('/paper/latest', authenticate, getLatestPaper)
router.get('/paper/:id', authenticate, getPaperById)
router.put('/paper/:id', authenticate, renamePaper)

module.exports = router