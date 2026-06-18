import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useExam } from '../context/ExamContext'

const AttemptedTests = () => {
    const { token } = useAuth()
    const { setGeneratedPaper, setExamConfig } = useExam()
    const [attempts, setAttempts] = useState([])
    const [loading, setLoading] = useState(true)
    const [reattemptOpen, setReattemptOpen] = useState(null)
    const [reattemptLoading, setReattemptLoading] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [editName, setEditName] = useState('')
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

    const handleReattemptSame = async (attempt) => {
        setReattemptLoading(true)
        try {
            const response = await axios.get(`http://localhost:3000/api/generate/paper/${attempt.paperId}`)
            if (response.data.paper) {
                setGeneratedPaper(response.data.paper)
                localStorage.removeItem('exam_paper_id')
                localStorage.removeItem('exam_started_at')
                localStorage.removeItem('exam_answers')
                navigate('/exam')
            }
        } catch (error) {
            console.error('Failed to load paper:', error.message)
        }
        setReattemptLoading(false)
    }

    const handleReattemptNew = (attempt) => {
        const config = attempt.paper?.config
        if (!config) return

        setExamConfig({
            materialIds: config.materialIds || [],
            difficulty: config.difficulty || 'medium',
            count: config.count || 10,
            type: config.type === 'mixed' ? 'mcq' : (config.type || 'mcq'),
            mode: config.mode || 'single',
            typeCounts: config.typeCounts || { mcq: 5, short: 3, long: 2 },
            paperStrategy: 'material_only',
            timerMinutes: config.timerMinutes || 30
        })
        navigate('/configure')
    }

    const startEditName = (attempt, currentName, index) => {
        setEditingId(attempt._id)
        setEditName(currentName || `Operation #${attempts.length - index}`)
    }

    const saveEditName = async (paperId) => {
        if (!editName.trim()) return
        try {
            await axios.put(`http://localhost:3000/api/generate/paper/${paperId}`, {
                name: editName.trim()
            })
            setAttempts(attempts.map(a =>
                a.paperId?.toString() === paperId?.toString()
                    ? { ...a, paper: { ...a.paper, name: editName.trim() } }
                    : a
            ))
            setEditingId(null)
            setEditName('')
        } catch (error) {
            console.error('Rename failed:', error.message)
        }
    }

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
                <div className="stamp stamp-red" style={{ fontSize: '11px', marginBottom: '32px' }}>No Records</div>
                <h1 className="font-stamp" style={{ fontSize: '28px', color: 'var(--ink)', marginBottom: '12px' }}>No Attempted Tests</h1>
                <p className="font-accent" style={{ fontSize: '14px', color: 'var(--graphite)', marginBottom: '32px' }}>Complete an operation to see your records here.</p>
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

            <div className="stamp stamp-red" style={{ fontSize: '11px', marginBottom: '28px' }}>Field Records</div>

            <h1 className="font-stamp" style={{ fontSize: '28px', color: 'var(--ink)', marginBottom: '8px' }}>
                Attempted Tests
            </h1>

            <p className="font-accent" style={{ fontSize: '14px', color: 'var(--graphite)', marginBottom: '32px' }}>
                {attempts.length} operation{attempts.length !== 1 ? 's' : ''} on record. Select any to review or reattempt.
            </p>

            <div style={{ borderTop: '1px solid var(--manila-dark)', paddingTop: '20px' }}>
                {attempts.map((attempt, index) => {
                    const percentage = attempt.maxScore
                        ? Math.round((attempt.totalScore / attempt.maxScore) * 100)
                        : 0
                    const passed = percentage >= 50
                    const config = attempt.paper?.config
                    const isReattemptOpen = reattemptOpen === attempt._id

                    return (
                        <div key={attempt._id} style={{
                            borderLeft: `3px solid ${passed ? '#2d6a2e' : 'var(--red)'}`,
                            padding: '16px 20px',
                            marginBottom: '12px',
                            background: 'var(--manila-light)'
                        }}>
                            {/* Clickable main area */}
                            <div
                                onClick={() => { if (editingId !== attempt._id) navigate(`/results/${attempt._id}`) }}
                                style={{ cursor: editingId === attempt._id ? 'default' : 'pointer' }}
                                onMouseEnter={(e) => { if (editingId !== attempt._id) e.currentTarget.style.opacity = '0.85' }}
                                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                    <div>
                                        {/* Editable name */}
                                        {editingId === attempt._id ? (
                                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') saveEditName(attempt.paperId)
                                                        if (e.key === 'Escape') { setEditingId(null); setEditName('') }
                                                    }}
                                                    className="input"
                                                    style={{ fontSize: '12px', padding: '4px 8px', width: '200px' }}
                                                    autoFocus
                                                />
                                                <button onClick={() => saveEditName(attempt.paperId)} className="btn" style={{ padding: '3px 10px', fontSize: '9px' }}>Save</button>
                                                <button onClick={() => { setEditingId(null); setEditName('') }} style={{
                                                    padding: '3px 10px', fontSize: '9px', fontFamily: 'var(--font-body)',
                                                    textTransform: 'uppercase', letterSpacing: '1px', border: '1px solid var(--manila-dark)',
                                                    background: 'transparent', color: 'var(--graphite)', cursor: 'pointer'
                                                }}>Esc</button>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                                <p style={{ fontFamily: 'var(--font-stamp)', fontSize: '13px', color: 'var(--ink)', letterSpacing: '1.5px' }}>
                                                    {attempt.paper?.name || `Operation #${attempts.length - index}`}
                                                </p>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); startEditName(attempt, attempt.paper?.name, index) }}
                                                    style={{
                                                        background: 'none', border: 'none', cursor: 'pointer',
                                                        fontSize: '12px', color: 'var(--graphite)', opacity: 0.6,
                                                        padding: '2px', transition: 'opacity 0.15s'
                                                    }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '1' }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6' }}
                                                    title="Rename test"
                                                >✎</button>
                                            </div>
                                        )}

                                        <p style={{ fontSize: '11px', color: 'var(--graphite)', fontFamily: 'var(--font-body)' }}>
                                            {formatDate(attempt.completedAt)}
                                        </p>
                                    </div>

                                    {/* Score badge */}
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '22px', fontWeight: '700', color: passed ? '#2d6a2e' : 'var(--red)', lineHeight: 1 }}>
                                            {percentage}%
                                        </p>
                                        <p style={{ fontSize: '10px', color: 'var(--graphite)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                            {attempt.totalScore}/{attempt.maxScore}
                                        </p>
                                    </div>
                                </div>

                                {/* Config tags */}
                                {config && (
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                        {config.type && (
                                            <span style={{
                                                fontSize: '10px', padding: '2px 8px', border: '1px solid var(--manila-dark)',
                                                color: 'var(--graphite)', fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.5px'
                                            }}>
                                                {config.type === 'mixed' ? 'Mixed' : config.type}
                                            </span>
                                        )}
                                        {config.difficulty && (
                                            <span style={{
                                                fontSize: '10px', padding: '2px 8px', border: '1px solid var(--manila-dark)',
                                                color: 'var(--graphite)', fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.5px'
                                            }}>
                                                {config.difficulty}
                                            </span>
                                        )}
                                        <span style={{
                                            fontSize: '10px', padding: '2px 8px', border: '1px solid var(--manila-dark)',
                                            color: 'var(--graphite)', fontFamily: 'var(--font-body)', letterSpacing: '0.5px'
                                        }}>
                                            {attempt.answerCount} questions
                                        </span>
                                        {config.timerMinutes && (
                                            <span style={{
                                                fontSize: '10px', padding: '2px 8px', border: '1px solid var(--manila-dark)',
                                                color: 'var(--graphite)', fontFamily: 'var(--font-body)', letterSpacing: '0.5px'
                                            }}>
                                                {config.timerMinutes} min
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Action buttons */}
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '10px', borderTop: '1px solid var(--manila-dark)', paddingTop: '10px' }}>
                                <button
                                    onClick={() => navigate(`/results/${attempt._id}`)}
                                    className="btn"
                                    style={{ padding: '5px 14px', fontSize: '10px' }}
                                >
                                    View Debrief
                                </button>

                                <button
                                    onClick={() => setReattemptOpen(isReattemptOpen ? null : attempt._id)}
                                    style={{
                                        fontFamily: 'var(--font-body)', fontSize: '10px', textTransform: 'uppercase',
                                        letterSpacing: '1px', padding: '5px 14px', border: '2px solid var(--red)',
                                        background: isReattemptOpen ? 'var(--red)' : 'transparent',
                                        color: isReattemptOpen ? 'var(--manila)' : 'var(--red)',
                                        cursor: 'pointer', transition: 'all 0.15s ease'
                                    }}
                                >
                                    Reattempt {isReattemptOpen ? '▲' : '▼'}
                                </button>
                            </div>

                            {/* Reattempt options */}
                            {isReattemptOpen && (
                                <div style={{
                                    marginTop: '10px',
                                    padding: '14px',
                                    background: 'var(--manila)',
                                    border: '1px solid var(--manila-dark)'
                                }}>
                                    <p style={{
                                        fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px',
                                        color: 'var(--graphite)', marginBottom: '10px'
                                    }}>
                                        Reattempt Options
                                    </p>

                                    <button
                                        onClick={() => handleReattemptSame(attempt)}
                                        disabled={reattemptLoading}
                                        style={{
                                            display: 'block', width: '100%', textAlign: 'left',
                                            padding: '10px 14px', marginBottom: '6px',
                                            fontFamily: 'var(--font-body)', fontSize: '13px',
                                            border: '1px solid var(--manila-dark)',
                                            background: 'var(--manila-light)', color: 'var(--ink)',
                                            cursor: 'pointer', transition: 'all 0.1s ease'
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--ink)' }}
                                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--manila-dark)' }}
                                    >
                                        <strong>Same Questions</strong>
                                        <br />
                                        <span style={{ fontSize: '11px', color: 'var(--graphite)' }}>
                                            Retake the exact same paper — test if you've improved.
                                        </span>
                                    </button>

                                    <button
                                        onClick={() => handleReattemptNew(attempt)}
                                        style={{
                                            display: 'block', width: '100%', textAlign: 'left',
                                            padding: '10px 14px',
                                            fontFamily: 'var(--font-body)', fontSize: '13px',
                                            border: '1px solid var(--manila-dark)',
                                            background: 'var(--manila-light)', color: 'var(--ink)',
                                            cursor: 'pointer', transition: 'all 0.1s ease'
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--ink)' }}
                                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--manila-dark)' }}
                                    >
                                        <strong>New Questions, Same Material</strong>
                                        <br />
                                        <span style={{ fontSize: '11px', color: 'var(--graphite)' }}>
                                            Generate fresh questions from the same study material and settings.
                                        </span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default AttemptedTests