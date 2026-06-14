import { useState, useEffect } from 'react'
import axios from 'axios'
import { useExam } from '../context/ExamContext'

const placeholderQuestions = [
    { _id: '1', question: 'What is the time complexity of bubble sort?' },
    { _id: '2', question: 'Explain the difference between a stack and a queue.' },
    { _id: '3', question: 'What is a binary search tree?' },
]

const Exam = () => {
    const { generatedPaper, setAttempts } = useExam()
    const [answers, setAnswers] = useState({})
    const [currentQ, setCurrentQ] = useState(0)
    const [timeLeft, setTimeLeft] = useState(1800)
    const [submitted, setSubmitted] = useState(false)
    const [status, setStatus] = useState('')

    const questions = generatedPaper?.questions || placeholderQuestions

    // Timer
    useEffect(() => {
        if (submitted) return

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 0) {
                    clearInterval(timer)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [submitted])

    // Format seconds into MM:SS
    const formatTime = (seconds) => {
        const min = Math.floor(seconds / 60)
        const sec = seconds % 60
        return `${min}:${sec < 10 ? '0' : ''}${sec}`
    }

    const handleAnswer = (questionId, value) => {
        setAnswers({ ...answers, [questionId]: value })
    }

    const handleSubmit = async () => {
        try {
            const formattedAnswers = questions.map((q) => ({
                questionId: q._id,
                userAnswer: answers[q._id] || ''
            }))

            const response = await axios.post('http://localhost:3000/api/review/answers', {
                paperId: generatedPaper?._id || 'placeholder',
                answers: formattedAnswers
            })

            setAttempts((prev) => [...prev, response.data.attempt])
            setSubmitted(true)
            setStatus('Submitted! Go to Results page.')
        } catch (error) {
            setStatus('Submission failed. Try again.')
        }
    }

    if (submitted) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h1>Exam Submitted! ✅</h1>
                <p>{status}</p>
            </div>
        )
    }

    return (
        <div style={{ padding: '20px', maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h1>Exam</h1>
                <h2 style={{ color: timeLeft < 300 ? 'red' : 'white' }}>
                    ⏱ {formatTime(timeLeft)}
                </h2>
            </div>

            {/* Question Navigation */}
            <div style={{ display: 'flex', gap: '5px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {questions.map((q, index) => (
                    <button
                        key={q._id}
                        onClick={() => setCurrentQ(index)}
                        style={{
                            padding: '8px 12px',
                            background: currentQ === index ? 'white' : 'transparent',
                            color: currentQ === index ? 'black' : 'white',
                            border: '1px solid white'
                        }}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>

            {/* Current Question */}
            <div style={{ border: '1px solid white', padding: '20px', marginBottom: '20px' }}>
                <p>Question {currentQ + 1} of {questions.length}</p>
                <h3>{questions[currentQ].question}</h3>
                <textarea
                    value={answers[questions[currentQ]._id] || ''}
                    onChange={(e) => handleAnswer(questions[currentQ]._id, e.target.value)}
                    placeholder="Type your answer here..."
                    rows="5"
                    style={{ width: '100%', padding: '8px', marginTop: '10px' }}
                />
            </div>

            {/* Navigation + Submit */}
            <div style={{ display: 'flex', gap: '10px' }}>
                <button
                    onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
                    disabled={currentQ === 0}
                >
                    ← Previous
                </button>
                <button
                    onClick={() => setCurrentQ(Math.min(questions.length - 1, currentQ + 1))}
                    disabled={currentQ === questions.length - 1}
                >
                    Next →
                </button>
                <button onClick={handleSubmit} style={{ marginLeft: 'auto' }}>
                    Submit Exam
                </button>
            </div>

            {status && <p>{status}</p>}
        </div>
    )
}

export default Exam