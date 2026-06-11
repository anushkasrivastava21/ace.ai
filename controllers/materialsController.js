// All the logic for materials lives here

const Material = require('../models/Material')

// READ ALL — GET /api/materials
const getAllMaterials = async (req, res) => {
    try {
        const materials = await Material.find()
        res.status(200).json({
            count: materials.length,
            materials
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// CREATE — POST /api/materials/upload
const uploadMaterial = async (req, res) => {
    try {
        const { filename, originalText } = req.body

        if (!filename || !originalText) {
            return res.status(400).json({ error: 'filename and originalText are required' })
        }

        const material = new Material({ filename, originalText })
        await material.save()

        res.status(201).json({
            message: 'Material saved!',
            material
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// DELETE — DELETE /api/materials/:id
const deleteMaterial = async (req, res) => {
    try {
        const material = await Material.findByIdAndDelete(req.params.id)

        if (!material) {
            return res.status(404).json({ error: 'Material not found' })
        }

        res.status(200).json({ message: 'Material deleted!' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = { getAllMaterials, uploadMaterial, deleteMaterial }
