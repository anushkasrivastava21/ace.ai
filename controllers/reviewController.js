const reviewAnswers = (req, res) => {
    const { paperId, answers } = req.body

    if (!paperId || !answers) {
        return res.status(400).json({ error: 'paperId and answers are required' })
    }

    // Placeholder — Ollama will do real review in Stage 6
    const reviewedAnswers = answers.map((answer) => ({
        questionId: answer.questionId,
        userAnswer: answer.userAnswer,
        score: answer.userAnswer ? 5 : 0,
        feedback: answer.userAnswer ? 'Answer received — AI review coming in Stage 6' : 'No answer provided'
    }))

    const totalScore = reviewedAnswers.reduce((sum, a) => sum + a.score, 0)

    res.status(200).json({
        message: 'Answers reviewed!',
        paperId,
        answers: reviewedAnswers,
        totalScore
    })
}

module.exports = { reviewAnswers }