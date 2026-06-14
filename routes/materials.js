const express = require('express')
const router = express.Router()
const upload = require('../middleware/upload')
const { getAllMaterials, uploadMaterial, deleteMaterial } = require('../controllers/materialsController')

router.get('/', getAllMaterials)
router.post('/upload', upload.single('file'), uploadMaterial)
router.delete('/:id', deleteMaterial)

module.exports = router