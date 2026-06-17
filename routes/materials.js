const express = require('express')
const router = express.Router()
const upload = require('../middleware/upload')
const authenticate = require('../middleware/auth')
const { getAllMaterials, uploadMaterial, deleteMaterial } = require('../controllers/materialscontroller')

router.get('/', authenticate, getAllMaterials)
router.post('/upload', authenticate, upload.single('file'), uploadMaterial)
router.delete('/:id', authenticate, deleteMaterial)

module.exports = router