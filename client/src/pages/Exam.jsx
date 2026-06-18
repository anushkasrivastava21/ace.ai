import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useExam } from '../context/ExamContext'
import DossierLoader from '../components/DossierLoader'
const getExamDuration = (paper) => {
    const minutes = paper?.config?.timerMinutes || 30
    return minutes * 60
}

const Exam = () => {
    const { generatedPaper, setAttempts } = useExam()
    const navigate = useNavigate()

    const questions = generatedPaper?.questions || []
    const paperId = generatedPaper?._id
    const EXAM_DURATION = getExamDuration(generatedPaper)
    // Check if this exam was already started (timer persistence)
    const getSavedTime = () => {
        const savedPaperId = localStorage.getItem('exam_paper_id')
        const startedAt = localStorage.getItem('exam_started_at')

        if (savedPaperId === paperId && startedAt) {
            const elapsed = Math.floor((Date.now() - Number(startedAt)) / 1000)
            const remaining = EXAM_DURATION - elapsed
            return remaining > 0 ? remaining : 0
        }
        return null
    }

    const savedTime = getSavedTime()

    const [started, setStarted] = useState(savedTime !== null)
    const [answers, setAnswers] = useState(() => {
        // Restore answers from localStorage
        try {
            const saved = localStorage.getItem('exam_answers')
            const savedPaper = localStorage.getItem('exam_paper_id')
            if (savedPaper === paperId && saved) return JSON.parse(saved)
        } catch { }
        return {}
    })
    const [currentQ, setCurrentQ] = useState(0)
    const [timeLeft, setTimeLeft] = useState(savedTime !== null ? savedTime : EXAM_DURATION)
    const [submitted, setSubmitted] = useState(false)
    const [reviewing, setReviewing] = useState(false)
    const [status, setStatus] = useState('')

    // Timer
    useEffect(() => {
        if (!started || submitted || reviewing) return
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    handleSubmit()
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(timer)
    }, [started, submitted, reviewing])

    // Save answers to localStorage on change
    useEffect(() => {
        if (started && paperId) {
            localStorage.setItem('exam_answers', JSON.stringify(answers))
        }
    }, [answers, started, paperId])

    const handleStart = () => {
        localStorage.setItem('exam_paper_id', paperId)
        localStorage.setItem('exam_started_at', String(Date.now()))
        localStorage.setItem('exam_answers', JSON.stringify({}))
        setStarted(true)
        setTimeLeft(EXAM_DURATION)
    }

    const clearExamStorage = () => {
        localStorage.removeItem('exam_paper_id')
        localStorage.removeItem('exam_started_at')
        localStorage.removeItem('exam_answers')
    }

    const formatTime = (seconds) => {
        const min = Math.floor(seconds / 60)
        const sec = seconds % 60
        return `${min}:${sec < 10 ? '0' : ''}${sec}`
    }

    const handleAnswer = (questionId, value) => {
        setAnswers({ ...answers, [questionId]: value })
    }

    const handleSubmit = async () => {
        setReviewing(true)
        try {
            const formattedAnswers = questions.map((q) => ({
                questionId: q._id,
                userAnswer: answers[q._id] || ''
            }))
            const response = await axios.post('http://localhost:3000/api/review/answers', {
                paperId: generatedPaper._id,
                answers: formattedAnswers
            })
            setAttempts((prev) => [...prev, response.data.attempt])
            clearExamStorage()
            setSubmitted(true)
            setStatus('Operation complete. Redirecting to debrief...')
            setTimeout(() => navigate(`/results/${response.data.attempt._id}`), 1500)
        } catch (error) {
            setReviewing(false)
            setStatus('Submission failed. Try again.')
        }
    }

    const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F']

    const folderStyle = {
        position: 'relative',
        background: 'var(--manila-light)',
        border: '1px solid var(--manila-dark)',
        boxShadow: '2px 3px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.5)',
        padding: '36px 32px 32px',
        marginTop: '36px',
        minHeight: '400px'
    }

    const folderTabStyle = {
        position: 'absolute',
        top: '-30px',
        left: '24px',
        background: 'var(--manila-dark)',
        padding: '6px 20px 4px',
        fontFamily: 'var(--font-stamp)',
        fontSize: '11px',
        letterSpacing: '2px',
        color: 'var(--ink)',
        borderRadius: '4px 4px 0 0',
        textTransform: 'uppercase'
    }

    const PaperClip = () => (
        <svg width="32" height="80" viewBox="0 0 32 80" style={{
            position: 'absolute', top: '-16px', right: '40px', opacity: 0.6,
            filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.2))'
        }}>
            <path d="M16 4 C8 4 4 10 4 18 L4 58 C4 68 10 76 16 76 C22 76 28 68 28 58 L28 22 C28 14 24 10 20 10 C16 10 12 14 12 22 L12 52" fill="none" stroke="#888" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
    )

    const WaxSeal = ({ onClick, disabled }) => (
        <button onClick={onClick} disabled={disabled} style={{
            position: 'relative', width: '100px', height: '100px', border: 'none',
            background: 'transparent', cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.4 : 1, transition: 'transform 0.2s ease', padding: 0
        }}
            onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.transform = 'scale(1.08)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
        >
            <div style={{
                width: '100px', height: '100px', borderRadius: '50%',
                background: disabled
                    ? 'radial-gradient(circle at 38% 32%, #888, #555, #333)'
                    : 'radial-gradient(circle at 38% 32%, #d43a3a, #b31b1b, #7a1010, #4a0808)',
                boxShadow: disabled
                    ? '0 2px 8px rgba(0,0,0,0.3)'
                    : '0 6px 16px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,200,180,0.25), inset 0 -3px 6px rgba(0,0,0,0.4)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                position: 'relative', overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', width: '72px', height: '72px', borderRadius: '50%', border: '1.5px solid rgba(0,0,0,0.2)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', width: '54px', height: '54px', borderRadius: '50%', border: '1px solid rgba(0,0,0,0.15)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }} />
                <span style={{ fontFamily: 'var(--font-stamp)', fontSize: '7px', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(255,220,210,0.7)', textShadow: '0 1px 2px rgba(0,0,0,0.5)', position: 'relative', zIndex: 1 }}>ACE.AI</span>
                <span style={{ fontFamily: 'var(--font-stamp)', fontSize: '14px', letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(255,230,220,0.9)', textShadow: '0 1px 3px rgba(0,0,0,0.5)', position: 'relative', zIndex: 1, marginTop: '2px' }}>SEAL</span>
            </div>
        </button>
    )

    // ── REVIEWING SCREEN ──
    if (reviewing && !submitted) {
        return (
            <div style={folderStyle}>
                <div style={folderTabStyle}>Processing</div>
                <PaperClip />
                <DossierLoader
                    title="Stand By"
                    subtitle="Verifying Intel..."
                    messages={[
                        'Analyzing your responses...',
                        'Comparing against source material...',
                        'Evaluating answer accuracy...',
                        'Generating detailed feedback...',
                        'Calculating intel accuracy rating...',
                        'Compiling debrief report...',
                        'Do not close this file...'
                    ]}
                />
            </div>
        )
    }

    // ── SUBMITTED SCREEN ──
    if (submitted) {
        return (
            <div style={folderStyle}>
                <div style={folderTabStyle}>Complete</div>
                <PaperClip />
                <div style={{ textAlign: 'center', paddingTop: '60px' }}>
                    <div className="stamp stamp-green" style={{ fontSize: '13px', marginBottom: '32px' }}>Sealed & Filed</div>
                    <h1 className="font-stamp" style={{ fontSize: '24px', color: 'var(--ink)', marginBottom: '12px' }}>Dossier Submitted</h1>
                    <p className="font-accent" style={{ fontSize: '14px', color: 'var(--graphite)', marginBottom: '32px' }}>{status}</p>
                </div>
            </div>
        )
    }

    // ── NO EXAM SCREEN ──
    if (questions.length === 0) {
        return (
            <div style={folderStyle}>
                <div style={folderTabStyle}>Empty</div>
                <PaperClip />
                <div style={{ textAlign: 'center', paddingTop: '60px' }}>
                    <div className="stamp stamp-red" style={{ fontSize: '11px', marginBottom: '32px' }}>No Active Mission</div>
                    <h1 className="font-stamp" style={{ fontSize: '24px', color: 'var(--ink)', marginBottom: '12px' }}>No Dossier Found</h1>
                    <p className="font-accent" style={{ fontSize: '14px', color: 'var(--graphite)', marginBottom: '32px' }}>Compile a dossier from the Configure page first.</p>
                    <a href="/configure" style={{ textDecoration: 'none' }}>
                        <button className="btn" style={{ padding: '12px 32px' }}>Go to Mission Setup →</button>
                    </a>
                </div>
            </div>
        )
    }

    // ── START SCREEN (before exam begins) ──
    if (!started) {
        const config = generatedPaper.config || {}
        return (
            <div style={folderStyle}>
                <div style={folderTabStyle}>Briefing</div>
                <PaperClip />
                <div style={{ textAlign: 'center', paddingTop: '40px' }}>
                    <div className="stamp stamp-red" style={{ fontSize: '13px', marginBottom: '32px' }}>
                        Ready to Deploy
                    </div>

                    <h1 className="font-stamp" style={{ fontSize: '24px', color: 'var(--ink)', marginBottom: '24px' }}>
                        Mission Briefing
                    </h1>

                    <div style={{
                        border: '1px solid var(--manila-dark)',
                        padding: '24px',
                        marginBottom: '32px',
                        background: 'var(--manila)',
                        textAlign: 'left',
                        maxWidth: '360px',
                        margin: '0 auto 32px'
                    }}>
                        {[
                            { label: 'Questions', value: questions.length },
                            { label: 'Format', value: config.type === 'mixed' ? 'Mixed Types' : (config.type || 'mcq').toUpperCase() },
                            { label: 'Difficulty', value: (config.difficulty || 'medium').toUpperCase() },
                            { label: 'Time Limit', value: `${Math.floor(EXAM_DURATION / 60)} minutes` }
                        ].map(item => (
                            <div key={item.label} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '8px 0',
                                borderBottom: '1px solid var(--manila-dark)',
                                fontSize: '13px'
                            }}>
                                <span style={{
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    fontSize: '10px',
                                    color: 'var(--graphite)',
                                    paddingTop: '2px'
                                }}>
                                    {item.label}
                                </span>
                                <span style={{ color: 'var(--ink)', fontWeight: '700' }}>{item.value}</span>
                            </div>
                        ))}
                    </div>

                    <p className="font-accent" style={{
                        fontSize: '13px',
                        color: 'var(--graphite)',
                        marginBottom: '24px',
                        maxWidth: '360px',
                        margin: '0 auto 24px',
                        lineHeight: '1.7'
                    }}>
                        Once you begin, the timer cannot be paused. Your progress will be saved if you refresh the page.
                    </p>

                    <button onClick={handleStart} className="btn btn-red" style={{ padding: '14px 40px', fontSize: '15px' }}>
                        Begin Operation →
                    </button>
                </div>
            </div>
        )
    }

    // ── ACTIVE EXAM ──
    const currentQuestion = questions[currentQ]
    const hasMCQOptions = currentQuestion.options && currentQuestion.options.length > 0
    const answeredCount = Object.keys(answers).filter(k => answers[k]).length

    return (
        <div style={folderStyle}>
            <div style={folderTabStyle}>Exam Dossier</div>
            <PaperClip />

            <div style={{ borderBottom: '2px solid var(--ink)', paddingBottom: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <p style={{ fontFamily: 'var(--font-stamp)', fontSize: '13px', color: 'var(--red)', letterSpacing: '3px', marginBottom: '4px' }}>TOP SECRET //</p>
                        <h1 className="font-stamp" style={{ fontSize: '20px', color: 'var(--ink)', margin: '0 0 6px', letterSpacing: '2px' }}>Strategic Analysis</h1>
                        <p style={{ fontSize: '11px', color: 'var(--graphite)', textTransform: 'uppercase', letterSpacing: '1px' }}>{answeredCount}/{questions.length} responses logged</p>
                    </div>
                    <div style={{
                        fontFamily: 'var(--font-body)', fontSize: '26px', fontWeight: '700', letterSpacing: '3px',
                        color: timeLeft < 300 ? 'var(--red)' : 'var(--ink)', padding: '10px 18px', border: '2px solid',
                        borderColor: timeLeft < 300 ? 'var(--red)' : 'var(--ink)',
                        background: timeLeft < 300 ? 'rgba(179,27,27,0.06)' : 'transparent',
                        textAlign: 'center', transition: 'all 0.3s ease', lineHeight: 1
                    }}>
                        <div style={{ fontSize: '9px', letterSpacing: '2px', marginBottom: '4px', fontWeight: '400' }}>REMAINING</div>
                        {formatTime(timeLeft)}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {questions.map((q, index) => {
                    const isActive = currentQ === index
                    const isAnswered = answers[q._id] && answers[q._id].trim()
                    return (
                        <button key={q._id} onClick={() => setCurrentQ(index)} style={{
                            width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: isActive ? '700' : '400',
                            border: isActive ? '2px solid var(--ink)' : '1px solid var(--manila-dark)',
                            background: isActive ? 'var(--ink)' : isAnswered ? 'var(--manila-dark)' : 'transparent',
                            color: isActive ? 'var(--manila)' : isAnswered ? 'var(--ink)' : 'var(--graphite)',
                            cursor: 'pointer', transition: 'all 0.1s ease'
                        }}>{index + 1}</button>
                    )
                })}
            </div>

            <div style={{
                background: 'var(--manila)', border: '1px solid var(--manila-dark)', borderLeft: '4px solid var(--red)',
                padding: '28px 24px', marginBottom: '24px', boxShadow: '1px 2px 6px rgba(0,0,0,0.08)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <p style={{ fontFamily: 'var(--font-stamp)', fontSize: '13px', letterSpacing: '2px', color: 'var(--graphite)' }}>Question {currentQ + 1}.</p>
                    {currentQuestion.type && (
                        <span style={{ padding: '3px 10px', border: '1px solid var(--manila-dark)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'var(--font-body)', color: 'var(--graphite)' }}>
                            {currentQuestion.type === 'mcq' ? 'MCQ' : currentQuestion.type === 'short' ? 'SHORT' : currentQuestion.type === 'long' ? 'LONG' : currentQuestion.type.toUpperCase()}
                        </span>
                    )}
                </div>

                <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--ink)', lineHeight: '1.7', marginBottom: '20px', fontFamily: 'var(--font-body)' }}>
                    {currentQuestion.question}
                </h3>

                {hasMCQOptions ? (
                    <div>
                        {currentQuestion.options.map((option, i) => {
                            const isSelected = answers[currentQuestion._id] === option
                            const letter = optionLetters[i] || String(i + 1)
                            return (
                                <label key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 14px', marginBottom: '8px',
                                    border: '1px solid', borderColor: isSelected ? 'var(--red)' : 'var(--manila-dark)',
                                    background: isSelected ? 'rgba(179,27,27,0.06)' : 'transparent',
                                    cursor: 'pointer', transition: 'all 0.1s ease', fontSize: '14px', color: 'var(--ink)'
                                }}>
                                    <input type="radio" name={`question-${currentQuestion._id}`} value={option} checked={isSelected}
                                        onChange={(e) => handleAnswer(currentQuestion._id, e.target.value)} style={{ display: 'none' }} />
                                    <span style={{
                                        width: '28px', height: '28px', borderRadius: '50%', border: '2px solid',
                                        borderColor: isSelected ? 'var(--red)' : 'var(--graphite)',
                                        background: isSelected ? 'var(--red)' : 'transparent',
                                        color: isSelected ? 'var(--manila)' : 'var(--graphite)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontFamily: 'var(--font-stamp)', fontSize: '12px', flexShrink: 0, transition: 'all 0.1s ease'
                                    }}>{letter}</span>
                                    {option}
                                </label>
                            )
                        })}
                    </div>
                ) : (
                    <textarea value={answers[currentQuestion._id] || ''} onChange={(e) => handleAnswer(currentQuestion._id, e.target.value)}
                        placeholder="Type your response here..." rows="6" className="input"
                        style={{ resize: 'vertical', lineHeight: '1.7', fontSize: '14px', background: 'var(--manila-light)' }} />
                )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--manila-dark)', paddingTop: '20px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0} className="btn" style={{ padding: '10px 20px', fontSize: '12px' }}>← Prev</button>
                    <button onClick={() => setCurrentQ(Math.min(questions.length - 1, currentQ + 1))} disabled={currentQ === questions.length - 1} className="btn" style={{ padding: '10px 20px', fontSize: '12px' }}>Next →</button>
                </div>
                <WaxSeal onClick={handleSubmit} disabled={!generatedPaper} />
            </div>

            {status && <p style={{ marginTop: '16px', fontSize: '13px', color: 'var(--red)', fontFamily: 'var(--font-accent)' }}>{status}</p>}
        </div>
    )
}

export default Exam