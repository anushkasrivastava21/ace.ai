const generatePaper = (req, res) => {
    const { subject, difficulty, count } = req.body

    if (!subject || !difficulty || !count) {
        return res.status(400).json({ error: 'subject, difficulty and count are required' })
    }

    res.status(200).json({
        message: 'Paper generated!',
        config: { subject, difficulty, count },
        questions: []   // Ollama will fill this later
    })
}

module.exports = { generatePaper }