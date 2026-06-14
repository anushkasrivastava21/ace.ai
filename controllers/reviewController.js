const Paper = require('../models/Paper')
const Attempt = require('../models/Attempt')
const { buildReviewPrompt } = require('../agent/prompts')
const { generate, parseJSONObject } = require('../agent/llm')

const reviewAnswers = async (req, res) => {
    try {
        const { paperId, answers } = req.body

        if (!paperId || !answers) {
            return res.status(400).json({ error: 'paperId and answers are required' })
        }

        const paper = await Paper.findById(paperId)
        if (!paper) {
            return res.status(404).json({ error: 'Paper not found' })
        }

        const reviewOne = async (userAnswer) => {
            const question = paper.questions.find(q => q._id.toString() === userAnswer.questionId)

            if (!question) return null

            const prompt = buildReviewPrompt(question.question, question.answer, userAnswer.userAnswer)
            const rawResponse = await generate(prompt)
            const review = parseJSONObject(rawResponse)

            const score = typeof review.score === 'number' ? review.score : 0
            const feedback = review.feedback && review.feedback.trim()
                ? review.feedback
                : 'No feedback could be generated for this answer.'

            return {
                questionId: userAnswer.questionId,
                userAnswer: userAnswer.userAnswer,
                score,
                feedback
            }
        }

        const reviewedAnswers = []
        const BATCH_SIZE = 2

        for (let i = 0; i < answers.length; i += BATCH_SIZE) {
            const batch = answers.slice(i, i + BATCH_SIZE)
            const results = await Promise.all(batch.map(reviewOne))
            reviewedAnswers.push(...results.filter(r => r !== null))
        }

        const totalScore = reviewedAnswers.reduce((sum, a) => sum + a.score, 0)
        const maxScore = reviewedAnswers.length * 10

        const attempt = new Attempt({
            paperId,
            answers: reviewedAnswers,
            totalScore,
            maxScore
        })
        await attempt.save()

        res.status(200).json({
            message: 'Answers reviewed!',
            attempt
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = { reviewAnswers }