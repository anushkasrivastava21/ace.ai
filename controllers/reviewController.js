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
            try {
                const question = paper.questions.find(q => q._id.toString() === userAnswer.questionId)
                if (!question) return null

                const isMCQ = question.options && question.options.length > 0

                if (isMCQ) {
                    const userAns = (userAnswer.userAnswer || '').trim().toLowerCase()
                    const correctAns = (question.answer || '').trim().toLowerCase()

                    // If either answer is empty, can't be correct
                    if (!userAns || !correctAns) {
                        return {
                            questionId: userAnswer.questionId,
                            userAnswer: userAnswer.userAnswer,
                            score: 0,
                            feedback: !userAns
                                ? `No answer provided. The correct answer is: ${question.answer || 'Not available'}`
                                : 'Could not verify — correct answer missing from paper.'
                        }
                    }

                    const correct = userAns === correctAns
                    return {
                        questionId: userAnswer.questionId,
                        userAnswer: userAnswer.userAnswer,
                        score: correct ? 10 : 0,
                        feedback: correct
                            ? 'Correct.'
                            : `Incorrect. The correct answer is: ${question.answer}`
                    }
                }

                const prompt = buildReviewPrompt(question.question, question.answer, userAnswer.userAnswer)
                const rawResponse = await generate(prompt)
                const review = parseJSONObject(rawResponse)

                const score = Number(review.score) || 0
                const feedback = review.feedback && review.feedback.trim()
                    ? review.feedback
                    : 'No feedback could be generated for this answer.'

                return {
                    questionId: userAnswer.questionId,
                    userAnswer: userAnswer.userAnswer,
                    score,
                    feedback
                }
            } catch (err) {
                return {
                    questionId: userAnswer.questionId,
                    userAnswer: userAnswer.userAnswer,
                    score: 0,
                    feedback: 'Review failed for this question. Please try again.'
                }
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
            userId: req.userId,
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

// Get all attempts for the user (with paper config for display)
const getAttempts = async (req, res) => {
    try {
        const attempts = await Attempt.find({ userId: req.userId })
            .sort({ completedAt: -1 })

        // Fetch paper config for each attempt
        const paperIds = [...new Set(attempts.map(a => a.paperId?.toString()).filter(Boolean))]
        const papers = await Paper.find({ _id: { $in: paperIds } }).select('config questions')

        const paperMap = {}
        papers.forEach(p => {
            paperMap[p._id.toString()] = {
                config: p.config,
                questionCount: p.questions?.length || 0
            }
        })

        const attemptsWithPaper = attempts.map(a => ({
            _id: a._id,
            paperId: a.paperId,
            totalScore: a.totalScore,
            maxScore: a.maxScore,
            completedAt: a.completedAt,
            answerCount: a.answers?.length || 0,
            paper: paperMap[a.paperId?.toString()] || null
        }))

        res.status(200).json({ attempts: attemptsWithPaper })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Get single attempt with full paper questions
const getAttemptById = async (req, res) => {
    try {
        const attempt = await Attempt.findOne({
            _id: req.params.id,
            userId: req.userId
        })

        if (!attempt) {
            return res.status(404).json({ error: 'Attempt not found' })
        }

        const paper = await Paper.findById(attempt.paperId)

        res.status(200).json({
            attempt,
            paper: paper || null
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = { reviewAnswers, getAttempts, getAttemptById }