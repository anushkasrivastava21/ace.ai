import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { useExam } from '../context/ExamContext'

const Results = () => {
    const { attemptId } = useParams()
    const { attempts: contextAttempts, generatedPaper } = useExam()

    const [attempt, setAttempt] = useState(null)
    const [paper, setPaper] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // If attemptId in URL, fetch from API
        if (attemptId) {
            const fetchAttempt = async () => {
                try {
                    const response = await axios.get(`http://localhost:3000/api/review/attempts/${attemptId}`)
                    setAttempt(response.data.attempt)
                    setPaper(response.data.paper)
                } catch (error) {
                    console.error('Failed to fetch attempt:', error.message)
                }
                setLoading(false)
            }
            fetchAttempt()
        } else {
            // Fallback: use latest from context (for direct exam → results flow)
            if (contextAttempts.length > 0) {
                setAttempt(contextAttempts[contextAttempts.length - 1])
                setPaper(generatedPaper)
            }
            setLoading(false)
        }
    }, [attemptId, contextAttempts, generatedPaper])

    if (loading) {
        return (
            <div style={{ textAlign: 'center', paddingTop: '80px' }}>
                <p className="font-accent" style={{ fontSize: '15px', color: 'var(--graphite)' }}>
                    Retrieving debrief...
                </p>
            </div>
        )
    }

    if (!attempt) {
        return (
            <div style={{ textAlign: 'center', paddingTop: '80px' }}>
                <div className="stamp stamp-red" style={{ fontSize: '11px', marginBottom: '32px' }}>
                    No Intel
                </div>
                <h1 className="font-stamp" style={{ fontSize: '28px', color: 'var(--ink)', marginBottom: '12px' }}>
                    No Debrief Available
                </h1>
                <p className="font-accent" style={{ fontSize: '14px', color: 'var(--graphite)', marginBottom: '32px' }}>
                    Complete an operation first to receive your debrief.
                </p>
                <a href="/configure" style={{ textDecoration: 'none' }}>
                    <button className="btn" style={{ padding: '12px 32px' }}>Create Test →</button>
                </a>
            </div>
        )
    }

    const maxScore = attempt.maxScore || (attempt.answers?.length * 10) || 100
    const percentage = Math.round((attempt.totalScore / maxScore) * 100)
    const passed = percentage >= 50

    const formatDate = (dateStr) => {
        if (!dateStr) return ''
        const d = new Date(dateStr)
        return d.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div style={{ maxWidth: '640px' }}>

            <div className={passed ? 'stamp stamp-green' : 'stamp stamp-red'}
                style={{ fontSize: '13px', marginBottom: '28px' }}
            >
                {passed ? 'Cleared for Access' : 'Intel Compromised'}
            </div>

            <h1 className="font-stamp" style={{
                fontSize: '28px',
                color: 'var(--ink)',
                marginBottom: '8px'
            }}>
                Operation Debrief
            </h1>

            <p className="font-accent" style={{
                fontSize: '14px',
                color: 'var(--graphite)',
                marginBottom: '32px'
            }}>
                {formatDate(attempt.completedAt)}
            </p>

            {/* Score card */}
            <div style={{
                border: '2px solid var(--ink)',
                padding: '28px',
                marginBottom: '32px',
                textAlign: 'center',
                background: 'var(--manila-light)',
                position: 'relative'
            }}>
                <div style={{ position: 'absolute', top: '6px', left: '6px', width: '16px', height: '16px', borderTop: '2px solid var(--ink)', borderLeft: '2px solid var(--ink)' }} />
                <div style={{ position: 'absolute', top: '6px', right: '6px', width: '16px', height: '16px', borderTop: '2px solid var(--ink)', borderRight: '2px solid var(--ink)' }} />
                <div style={{ position: 'absolute', bottom: '6px', left: '6px', width: '16px', height: '16px', borderBottom: '2px solid var(--ink)', borderLeft: '2px solid var(--ink)' }} />
                <div style={{ position: 'absolute', bottom: '6px', right: '6px', width: '16px', height: '16px', borderBottom: '2px solid var(--ink)', borderRight: '2px solid var(--ink)' }} />

                <p style={{
                    fontFamily: 'var(--font-stamp)',
                    fontSize: '11px',
                    letterSpacing: '3px',
                    color: 'var(--graphite)',
                    marginBottom: '8px',
                    textTransform: 'uppercase'
                }}>
                    Intel Accuracy Rating
                </p>

                <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '56px',
                    fontWeight: '700',
                    color: passed ? '#2d6a2e' : 'var(--red)',
                    lineHeight: 1,
                    marginBottom: '4px'
                }}>
                    {percentage}%
                </p>

                <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    color: 'var(--graphite)',
                    marginBottom: '12px'
                }}>
                    {attempt.totalScore} / {maxScore} points
                </p>

                <p style={{
                    fontFamily: 'var(--font-accent)',
                    fontSize: '13px',
                    color: passed ? '#2d6a2e' : 'var(--red)'
                }}>
                    {percentage >= 90
                        ? 'Outstanding. Top-level clearance confirmed.'
                        : percentage >= 70
                            ? 'Solid performance. Clearance approved.'
                            : percentage >= 50
                                ? 'Acceptable. Clearance granted with reservations.'
                                : percentage >= 30
                                    ? 'Below threshold. Additional training required.'
                                    : 'Critical failure. Immediate reassessment needed.'}
                </p>
            </div>

            {/* Question review */}
            <div style={{
                borderTop: '1px solid var(--manila-dark)',
                paddingTop: '24px'
            }}>
                <h2 className="font-stamp" style={{
                    fontSize: '16px',
                    color: 'var(--ink)',
                    marginBottom: '20px',
                    letterSpacing: '2px'
                }}>
                    Detailed Analysis
                </h2>

                {attempt.answers?.map((answer, index) => {
                    const matchedQuestion = paper?.questions?.find(
                        q => q._id === answer.questionId || q._id?.toString() === answer.questionId
                    )
                    const qScore = answer.score || 0
                    const isPerfect = qScore === 10
                    const isFail = qScore === 0

                    return (
                        <div key={index} style={{
                            borderLeft: `3px solid ${isPerfect ? '#2d6a2e' : isFail ? 'var(--red)' : 'var(--graphite)'}`,
                            padding: '16px 20px',
                            marginBottom: '12px',
                            background: 'var(--manila-light)'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '10px'
                            }}>
                                <p style={{
                                    fontFamily: 'var(--font-stamp)',
                                    fontSize: '12px',
                                    letterSpacing: '1.5px',
                                    color: 'var(--graphite)'
                                }}>
                                    Question {index + 1}
                                </p>
                                <span style={{
                                    fontFamily: 'var(--font-body)',
                                    fontSize: '13px',
                                    fontWeight: '700',
                                    padding: '3px 10px',
                                    border: '1px solid',
                                    borderColor: isPerfect ? '#2d6a2e' : isFail ? 'var(--red)' : 'var(--graphite)',
                                    color: isPerfect ? '#2d6a2e' : isFail ? 'var(--red)' : 'var(--graphite)'
                                }}>
                                    {qScore}/10
                                </span>
                            </div>

                            <p style={{
                                fontSize: '14px',
                                fontWeight: '700',
                                color: 'var(--ink)',
                                lineHeight: '1.6',
                                marginBottom: '12px'
                            }}>
                                {matchedQuestion?.question || '(Question text unavailable)'}
                            </p>

                            <div style={{ marginBottom: '8px' }}>
                                <span style={{
                                    fontSize: '10px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1.5px',
                                    color: 'var(--graphite)'
                                }}>
                                    Your Response:
                                </span>
                                <p style={{
                                    fontSize: '13px',
                                    color: 'var(--ink)',
                                    marginTop: '4px',
                                    padding: '8px 10px',
                                    background: 'var(--manila)',
                                    borderLeft: '2px solid var(--manila-dark)'
                                }}>
                                    {answer.userAnswer || 'No answer given'}
                                </p>
                            </div>

                            <div>
                                <span style={{
                                    fontSize: '10px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1.5px',
                                    color: 'var(--graphite)'
                                }}>
                                    Assessment:
                                </span>
                                <p className="font-accent" style={{
                                    fontSize: '13px',
                                    color: isPerfect ? '#2d6a2e' : isFail ? 'var(--red)' : 'var(--ink)',
                                    marginTop: '4px',
                                    lineHeight: '1.6'
                                }}>
                                    {answer.feedback || 'No feedback available.'}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Bottom actions */}
            <div style={{
                borderTop: '1px solid var(--manila-dark)',
                paddingTop: '24px',
                marginTop: '12px',
                display: 'flex',
                gap: '12px',
                justifyContent: 'center'
            }}>
                <a href="/results" style={{ textDecoration: 'none' }}>
                    <button className="btn" style={{ padding: '12px 24px' }}>
                        ← All Tests
                    </button>
                </a>
                <a href="/configure" style={{ textDecoration: 'none' }}>
                    <button className="btn btn-red" style={{ padding: '12px 24px' }}>
                        New Operation →
                    </button>
                </a>
            </div>
        </div>
    )
}

export default Results