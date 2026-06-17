import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const AttemptedTests = () => {
    const { token } = useAuth()
    const [attempts, setAttempts] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        if (!token) return

        const fetchAttempts = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/review/attempts')
                setAttempts(response.data.attempts)
            } catch (error) {
                console.error('Failed to fetch attempts:', error.message)
            }
            setLoading(false)
        }

        fetchAttempts()
    }, [token])

    if (loading) {
        return (
            <div style={{ textAlign: 'center', paddingTop: '80px' }}>
                <p className="font-accent" style={{ fontSize: '15px', color: 'var(--graphite)' }}>
                    Retrieving records from the archive...
                </p>
            </div>
        )
    }

    if (attempts.length === 0) {
        return (
            <div style={{ textAlign: 'center', paddingTop: '80px' }}>
                <div className="stamp stamp-red" style={{ fontSize: '11px', marginBottom: '32px' }}>
                    No Records
                </div>
                <h1 className="font-stamp" style={{ fontSize: '28px', color: 'var(--ink)', marginBottom: '12px' }}>
                    No Attempted Tests
                </h1>
                <p className="font-accent" style={{ fontSize: '14px', color: 'var(--graphite)', marginBottom: '32px' }}>
                    Complete an operation to see your records here.
                </p>
                <a href="/configure" style={{ textDecoration: 'none' }}>
                    <button className="btn" style={{ padding: '12px 32px' }}>Create Test →</button>
                </a>
            </div>
        )
    }

    const formatDate = (dateStr) => {
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
        <div style={{ maxWidth: '600px' }}>

            <div className="stamp stamp-red" style={{ fontSize: '11px', marginBottom: '28px' }}>
                Field Records
            </div>

            <h1 className="font-stamp" style={{
                fontSize: '28px',
                color: 'var(--ink)',
                marginBottom: '8px'
            }}>
                Attempted Tests
            </h1>

            <p className="font-accent" style={{
                fontSize: '14px',
                color: 'var(--graphite)',
                marginBottom: '32px'
            }}>
                {attempts.length} operation{attempts.length !== 1 ? 's' : ''} on record. Select any to review the debrief.
            </p>

            <div style={{ borderTop: '1px solid var(--manila-dark)', paddingTop: '20px' }}>
                {attempts.map((attempt, index) => {
                    const percentage = attempt.maxScore
                        ? Math.round((attempt.totalScore / attempt.maxScore) * 100)
                        : 0
                    const passed = percentage >= 50
                    const config = attempt.paper?.config

                    return (
                        <div
                            key={attempt._id}
                            onClick={() => navigate(`/results/${attempt._id}`)}
                            style={{
                                borderLeft: `3px solid ${passed ? '#2d6a2e' : 'var(--red)'}`,
                                padding: '16px 20px',
                                marginBottom: '12px',
                                background: 'var(--manila-light)',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--manila)'
                                e.currentTarget.style.boxShadow = '2px 2px 8px rgba(0,0,0,0.1)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'var(--manila-light)'
                                e.currentTarget.style.boxShadow = 'none'
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: '8px'
                            }}>
                                <div>
                                    <p style={{
                                        fontFamily: 'var(--font-stamp)',
                                        fontSize: '13px',
                                        color: 'var(--ink)',
                                        letterSpacing: '1.5px',
                                        marginBottom: '4px'
                                    }}>
                                        Operation #{attempts.length - index}
                                    </p>
                                    <p style={{
                                        fontSize: '11px',
                                        color: 'var(--graphite)',
                                        fontFamily: 'var(--font-body)'
                                    }}>
                                        {formatDate(attempt.completedAt)}
                                    </p>
                                </div>

                                {/* Score badge */}
                                <div style={{
                                    textAlign: 'right'
                                }}>
                                    <p style={{
                                        fontFamily: 'var(--font-body)',
                                        fontSize: '22px',
                                        fontWeight: '700',
                                        color: passed ? '#2d6a2e' : 'var(--red)',
                                        lineHeight: 1
                                    }}>
                                        {percentage}%
                                    </p>
                                    <p style={{
                                        fontSize: '10px',
                                        color: 'var(--graphite)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px'
                                    }}>
                                        {attempt.totalScore}/{attempt.maxScore}
                                    </p>
                                </div>
                            </div>

                            {/* Config tags */}
                            {config && (
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                    {config.type && (
                                        <span style={{
                                            fontSize: '10px',
                                            padding: '2px 8px',
                                            border: '1px solid var(--manila-dark)',
                                            color: 'var(--graphite)',
                                            fontFamily: 'var(--font-body)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            {config.type === 'mixed' ? 'Mixed' : config.type}
                                        </span>
                                    )}
                                    {config.difficulty && (
                                        <span style={{
                                            fontSize: '10px',
                                            padding: '2px 8px',
                                            border: '1px solid var(--manila-dark)',
                                            color: 'var(--graphite)',
                                            fontFamily: 'var(--font-body)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            {config.difficulty}
                                        </span>
                                    )}
                                    <span style={{
                                        fontSize: '10px',
                                        padding: '2px 8px',
                                        border: '1px solid var(--manila-dark)',
                                        color: 'var(--graphite)',
                                        fontFamily: 'var(--font-body)',
                                        letterSpacing: '0.5px'
                                    }}>
                                        {attempt.answerCount} questions
                                    </span>
                                </div>
                            )}

                            {/* Click hint */}
                            <p style={{
                                fontSize: '10px',
                                color: 'var(--graphite)',
                                textAlign: 'right',
                                marginTop: '8px',
                                fontFamily: 'var(--font-accent)',
                                opacity: 0.6
                            }}>
                                Click to view debrief →
                            </p>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default AttemptedTests