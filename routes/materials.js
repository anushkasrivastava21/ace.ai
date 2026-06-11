const express = require('express')
const router = express.Router()
const { getAllMaterials, uploadMaterial, deleteMaterial } = require('../controllers/materialscontroller')

router.get('/', getAllMaterials)
router.post('/upload', uploadMaterial)
router.delete('/:id', deleteMaterial)

module.exports = router