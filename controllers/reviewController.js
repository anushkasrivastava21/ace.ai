const reviewAnswers = (req, res) => {
    const { paperId, answers } = req.body

    if (!paperId || !answers) {
        return res.status(400).json({ error: 'paperId and answers are required' })
    }

    res.status(200).json({
        message: 'Answers reviewed!',
        paperId,
        totalScore: 0,   // Ollama will calculate this later
        feedback: []
    })
}

module.exports = { reviewAnswers }