const Material = require('../models/Material')
const Paper = require('../models/Paper')
const { retrieveRelevantChunks } = require('../agent/retriever')
const { buildGenerationPrompt } = require('../agent/prompts')
const { generate, parseJSONResponse } = require('../agent/llm')

const generatePaper = async (req, res) => {
    try {
        const { materialIds, difficulty, count, type, mode, typeCounts, paperStrategy, timerMinutes } = req.body

        if (!materialIds || !Array.isArray(materialIds) || materialIds.length === 0) {
            return res.status(400).json({ error: 'Select at least one material' })
        }
        if (!difficulty) {
            return res.status(400).json({ error: 'Difficulty is required' })
        }

        let totalCount
        if (mode === 'mixed' && typeCounts) {
            totalCount = (typeCounts.mcq || 0) + (typeCounts.short || 0) + (typeCounts.long || 0)
            if (totalCount === 0) {
                return res.status(400).json({ error: 'Set at least one question type count' })
            }
        } else {
            if (!count || !type) {
                return res.status(400).json({ error: 'Type and count are required for single mode' })
            }
            totalCount = count
        }

        const notesMaterials = await Material.find({
            _id: { $in: materialIds },
            userId: req.userId,
            'chunks.0': { $exists: true },
            materialType: { $ne: 'previous_paper' }
        })

        if (notesMaterials.length === 0) {
            return res.status(400).json({ error: 'No processed study materials found for the selected items.' })
        }

        const query = notesMaterials.map(m => m.filename.replace('.pdf', '').replace(/_/g, ' ')).join(' ')
        const topK = Math.min(notesMaterials.length * 4, 12)
        const relevantChunks = await retrieveRelevantChunks(query, notesMaterials, topK)

        let pyqChunks = []
        const strategy = paperStrategy || 'material_only'

        if (strategy !== 'material_only') {
            const pyqMaterials = await Material.find({
                userId: req.userId,
                'chunks.0': { $exists: true },
                materialType: 'previous_paper'
            })

            if (pyqMaterials.length > 0) {
                pyqChunks = await retrieveRelevantChunks(query, pyqMaterials, 3)
            }
        }

        const promptConfig = {
            type: mode === 'mixed' ? 'mixed' : type,
            difficulty,
            count: totalCount,
            mode: mode || 'single',
            typeCounts: mode === 'mixed' ? typeCounts : undefined
        }

        const prompt = buildGenerationPrompt(relevantChunks, promptConfig, strategy, pyqChunks)
        const rawResponse = await generate(prompt)
        const questions = parseJSONResponse(rawResponse)

        // Build paper name from materials
        const paperName = notesMaterials.map(m => m.filename.replace('.pdf', '')).join(' + ')

        const paper = new Paper({
            userId: req.userId,
            materialId: materialIds[0],
            name: paperName,
            config: {
                type: mode === 'mixed' ? 'mixed' : type,
                difficulty,
                count: totalCount,
                mode: mode || 'single',
                typeCounts: mode === 'mixed' ? typeCounts : undefined,
                materialIds,
                timerMinutes: timerMinutes || 30
            },
            questions: questions.map(q => ({
                question: q.question,
                answer: q.answer,
                options: q.options || [],
                type: q.type || type,
                sourceChunk: relevantChunks[0]?.text?.substring(0, 200) || ''
            }))
        })
        await paper.save()

        res.status(201).json({
            message: 'Paper generated!',
            paper
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const getLatestPaper = async (req, res) => {
    try {
        const paper = await Paper.findOne({ userId: req.userId }).sort({ generatedAt: -1 })
        if (!paper) {
            return res.status(200).json({ paper: null })
        }
        res.status(200).json({ paper })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const getPaperById = async (req, res) => {
    try {
        const paper = await Paper.findOne({ _id: req.params.id, userId: req.userId })
        if (!paper) {
            return res.status(404).json({ error: 'Paper not found' })
        }
        res.status(200).json({ paper })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const renamePaper = async (req, res) => {
    try {
        const { name } = req.body

        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Name is required' })
        }

        const paper = await Paper.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            { name: name.trim() },
            { new: true }
        )

        if (!paper) {
            return res.status(404).json({ error: 'Paper not found' })
        }

        res.status(200).json({ message: 'Paper renamed!', paper })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = { generatePaper, getLatestPaper, getPaperById, renamePaper }