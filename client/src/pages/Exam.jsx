import { useState, useEffect } from 'react'
import axios from 'axios'
import { useExam } from '../context/ExamContext'

const Exam = () => {
    const { generatedPaper, setAttempts } = useExam()
    const [answers, setAnswers] = useState({})
    const [currentQ, setCurrentQ] = useState(0)
    const [timeLeft, setTimeLeft] = useState(1800)
    const [submitted, setSubmitted] = useState(false)
    const [reviewing, setReviewing] = useState(false)
    const [status, setStatus] = useState('')

    const questions = generatedPaper?.questions || []

    useEffect(() => {
        if (submitted || reviewing) return
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 0) { clearInterval(timer); return 0 }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(timer)
    }, [submitted, reviewing])

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
            setSubmitted(true)
            setStatus('Operation complete. Proceed to Results for your debrief.')
        } catch (error) {
            setReviewing(false)
            setStatus('Submission failed. Try again.')
        }
    }

    const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F']

    // ── Folder wrapper styles ──
    const folderStyle = {
        position: 'relative',
        background: 'var(--manila-light)',
        border: '1px solid var(--manila-dark)',
        boxShadow: '2px 3px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.5)',
        padding: '36px 32px 32px',
        marginTop: '36px',
        minHeight: '400px'
    }

    // Folder tab
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

    // Paper clip SVG
    const PaperClip = () => (
        <svg width="32" height="80" viewBox="0 0 32 80" style={{
            position: 'absolute',
            top: '-16px',
            right: '40px',
            opacity: 0.6,
            filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.2))'
        }}>
            <path
                d="M16 4 C8 4 4 10 4 18 L4 58 C4 68 10 76 16 76 C22 76 28 68 28 58 L28 22 C28 14 24 10 20 10 C16 10 12 14 12 22 L12 52"
                fill="none"
                stroke="#888"
                strokeWidth="2.5"
                strokeLinecap="round"
            />
        </svg>
    )

    const WaxSeal = ({ onClick, disabled }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{
                position: 'relative',
                width: '110px',
                height: '110px',
                border: 'none',
                background: 'transparent',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.4 : 1,
                transition: 'transform 0.2s ease',
                padding: 0
            }}
            onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.transform = 'scale(1.08) rotate(-2deg)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1) rotate(0deg)' }}
        >
            <svg viewBox="0 0 200 200" width="110" height="110" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    {/* Wax texture */}
                    <filter id="waxTexture" x="-20%" y="-20%" width="140%" height="140%">
                        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" seed="3" result="noise" />
                        <feDiffuseLighting in="noise" lightingColor="#d43a3a" surfaceScale="2" result="lit">
                            <feDistantLight azimuth="225" elevation="45" />
                        </feDiffuseLighting>
                        <feComposite in="lit" in2="SourceGraphic" operator="in" result="textured" />
                    </filter>

                    {/* 3D emboss effect for center stamp */}
                    <filter id="emboss">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur" />
                        <feSpecularLighting in="blur" surfaceScale="5" specularConstant="0.8" specularExponent="20" result="spec">
                            <fePointLight x="70" y="50" z="100" />
                        </feSpecularLighting>
                        <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut" />
                        <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
                    </filter>

                    {/* Drop shadow for depth */}
                    <filter id="sealShadow">
                        <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="rgba(0,0,0,0.6)" />
                    </filter>

                    {/* Main gradient */}
                    <radialGradient id="waxMain" cx="40%" cy="35%" r="55%">
                        <stop offset="0%" stopColor="#e04040" />
                        <stop offset="30%" stopColor="#cc2222" />
                        <stop offset="60%" stopColor="#9b1515" />
                        <stop offset="85%" stopColor="#6b0d0d" />
                        <stop offset="100%" stopColor="#450808" />
                    </radialGradient>

                    {/* Highlight */}
                    <radialGradient id="waxHighlight" cx="35%" cy="30%" r="30%">
                        <stop offset="0%" stopColor="rgba(255,180,160,0.35)" />
                        <stop offset="100%" stopColor="rgba(255,180,160,0)" />
                    </radialGradient>

                    {/* Rim shadow */}
                    <radialGradient id="rimDark" cx="50%" cy="50%" r="50%">
                        <stop offset="70%" stopColor="rgba(0,0,0,0)" />
                        <stop offset="95%" stopColor="rgba(0,0,0,0.3)" />
                        <stop offset="100%" stopColor="rgba(0,0,0,0.5)" />
                    </radialGradient>
                </defs>

                {/* Outer irregular wax shape */}
                <g filter="url(#sealShadow)">
                    <path
                        d="M100 12
               C112 10 124 14 134 22 C137 24 142 21 146 26
               C152 34 160 40 163 50 C165 54 170 56 170 62
               C170 70 166 78 162 84 C160 88 163 92 158 96
               C152 104 146 112 136 118 C132 120 130 126 125 128
               C116 132 108 136 100 136 C92 136 84 134 76 130
               C72 128 68 132 64 128 C56 122 48 116 42 108
               C38 104 34 106 32 100 C28 92 26 82 26 72
               C26 66 22 62 24 56 C28 46 32 36 40 28
               C44 24 42 18 48 16 C56 12 66 10 76 10
               C84 10 90 12 100 12 Z"
                        fill="url(#waxMain)"
                    />
                    {/* Texture overlay */}
                    <path
                        d="M100 12
               C112 10 124 14 134 22 C137 24 142 21 146 26
               C152 34 160 40 163 50 C165 54 170 56 170 62
               C170 70 166 78 162 84 C160 88 163 92 158 96
               C152 104 146 112 136 118 C132 120 130 126 125 128
               C116 132 108 136 100 136 C92 136 84 134 76 130
               C72 128 68 132 64 128 C56 122 48 116 42 108
               C38 104 34 106 32 100 C28 92 26 82 26 72
               C26 66 22 62 24 56 C28 46 32 36 40 28
               C44 24 42 18 48 16 C56 12 66 10 76 10
               C84 10 90 12 100 12 Z"
                        filter="url(#waxTexture)"
                        opacity="0.3"
                    />
                    {/* Highlight gloss */}
                    <path
                        d="M100 12
               C112 10 124 14 134 22 C137 24 142 21 146 26
               C152 34 160 40 163 50 C165 54 170 56 170 62
               C170 70 166 78 162 84 C160 88 163 92 158 96
               C152 104 146 112 136 118 C132 120 130 126 125 128
               C116 132 108 136 100 136 C92 136 84 134 76 130
               C72 128 68 132 64 128 C56 122 48 116 42 108
               C38 104 34 106 32 100 C28 92 26 82 26 72
               C26 66 22 62 24 56 C28 46 32 36 40 28
               C44 24 42 18 48 16 C56 12 66 10 76 10
               C84 10 90 12 100 12 Z"
                        fill="url(#waxHighlight)"
                    />
                    {/* Rim darkening */}
                    <path
                        d="M100 12
               C112 10 124 14 134 22 C137 24 142 21 146 26
               C152 34 160 40 163 50 C165 54 170 56 170 62
               C170 70 166 78 162 84 C160 88 163 92 158 96
               C152 104 146 112 136 118 C132 120 130 126 125 128
               C116 132 108 136 100 136 C92 136 84 134 76 130
               C72 128 68 132 64 128 C56 122 48 116 42 108
               C38 104 34 106 32 100 C28 92 26 82 26 72
               C26 66 22 62 24 56 C28 46 32 36 40 28
               C44 24 42 18 48 16 C56 12 66 10 76 10
               C84 10 90 12 100 12 Z"
                        fill="url(#rimDark)"
                    />
                </g>

                {/* Embossed center stamp area */}
                <g filter="url(#emboss)">
                    {/* Outer ring */}
                    <circle cx="100" cy="74" r="42" fill="none" stroke="rgba(60,10,10,0.5)" strokeWidth="3" />
                    {/* Inner ring */}
                    <circle cx="100" cy="74" r="32" fill="none" stroke="rgba(60,10,10,0.4)" strokeWidth="2" />
                    {/* Dot pattern around outer ring */}
                    {Array.from({ length: 24 }).map((_, i) => {
                        const angle = (i * 15) * Math.PI / 180
                        const cx = 100 + 37 * Math.cos(angle)
                        const cy = 74 + 37 * Math.sin(angle)
                        return <circle key={i} cx={cx} cy={cy} r="1.5" fill="rgba(60,10,10,0.35)" />
                    })}
                    {/* Star emblem */}
                    <polygon
                        points="100,52 105,66 120,66 108,75 113,90 100,80 87,90 92,75 80,66 95,66"
                        fill="rgba(80,15,15,0.5)"
                        stroke="rgba(60,10,10,0.4)"
                        strokeWidth="1"
                    />
                </g>

                {/* Text — embossed into seal */}
                <text
                    x="100" y="62"
                    textAnchor="middle"
                    fontFamily="'Black Ops One', cursive"
                    fontSize="9"
                    letterSpacing="3"
                    fill="rgba(50,10,10,0.55)"
                >
                    ACE.AI
                </text>
                <text
                    x="100" y="96"
                    textAnchor="middle"
                    fontFamily="'Black Ops One', cursive"
                    fontSize="13"
                    letterSpacing="4"
                    fill="rgba(50,10,10,0.55)"
                >
                    SEALED
                </text>
            </svg>
        </button>
    )

    // ── REVIEWING SCREEN ──
    if (reviewing && !submitted) {
        return (
            <div style={folderStyle}>
                <div style={folderTabStyle}>Processing</div>
                <PaperClip />
                <div style={{ textAlign: 'center', paddingTop: '60px' }}>
                    <div className="stamp stamp-red" style={{ fontSize: '13px', marginBottom: '32px' }}>
                        Stand By
                    </div>
                    <h1 className="font-stamp" style={{ fontSize: '24px', color: 'var(--ink)', marginBottom: '16px' }}>
                        Verifying Intel...
                    </h1>
                    <p className="font-accent" style={{ fontSize: '14px', color: 'var(--graphite)', marginBottom: '24px' }}>
                        Your responses are being analyzed. Do not close this file.
                    </p>
                    <div style={{
                        width: '40px', height: '40px',
                        border: '3px solid var(--manila-dark)',
                        borderTop: '3px solid var(--red)',
                        borderRadius: '50%',
                        margin: '0 auto',
                        animation: 'spin 1s linear infinite'
                    }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
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
                    <div className="stamp stamp-green" style={{ fontSize: '13px', marginBottom: '32px' }}>
                        Sealed & Filed
                    </div>
                    <h1 className="font-stamp" style={{ fontSize: '24px', color: 'var(--ink)', marginBottom: '12px' }}>
                        Dossier Submitted
                    </h1>
                    <p className="font-accent" style={{ fontSize: '14px', color: 'var(--graphite)', marginBottom: '32px' }}>
                        {status}
                    </p>
                    <a href="/results" style={{ textDecoration: 'none' }}>
                        <button className="btn btn-red" style={{ padding: '12px 32px' }}>
                            View Debrief →
                        </button>
                    </a>
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
                    <div className="stamp stamp-red" style={{ fontSize: '11px', marginBottom: '32px' }}>
                        No Active Mission
                    </div>
                    <h1 className="font-stamp" style={{ fontSize: '24px', color: 'var(--ink)', marginBottom: '12px' }}>
                        No Dossier Found
                    </h1>
                    <p className="font-accent" style={{ fontSize: '14px', color: 'var(--graphite)', marginBottom: '32px' }}>
                        Compile a dossier from the Configure page first.
                    </p>
                    <a href="/configure" style={{ textDecoration: 'none' }}>
                        <button className="btn" style={{ padding: '12px 32px' }}>Go to Mission Setup →</button>
                    </a>
                </div>
            </div>
        )
    }

    const currentQuestion = questions[currentQ]
    const hasMCQOptions = currentQuestion.options && currentQuestion.options.length > 0
    const answeredCount = Object.keys(answers).filter(k => answers[k]).length

    return (
        <div style={folderStyle}>
            <div style={folderTabStyle}>Exam Dossier</div>
            <PaperClip />

            {/* ── TOP SECRET HEADER ── */}
            <div style={{
                borderBottom: '2px solid var(--ink)',
                paddingBottom: '16px',
                marginBottom: '20px'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                }}>
                    <div>
                        <p style={{
                            fontFamily: 'var(--font-stamp)',
                            fontSize: '13px',
                            color: 'var(--red)',
                            letterSpacing: '3px',
                            marginBottom: '4px'
                        }}>
                            TOP SECRET //
                        </p>
                        <h1 className="font-stamp" style={{
                            fontSize: '20px',
                            color: 'var(--ink)',
                            margin: '0 0 6px',
                            letterSpacing: '2px'
                        }}>
                            Strategic Analysis
                        </h1>
                        <p style={{
                            fontSize: '11px',
                            color: 'var(--graphite)',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}>
                            {answeredCount}/{questions.length} responses logged
                        </p>
                    </div>

                    {/* Timer */}
                    <div style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '26px',
                        fontWeight: '700',
                        letterSpacing: '3px',
                        color: timeLeft < 300 ? 'var(--red)' : 'var(--ink)',
                        padding: '10px 18px',
                        border: '2px solid',
                        borderColor: timeLeft < 300 ? 'var(--red)' : 'var(--ink)',
                        background: timeLeft < 300 ? 'rgba(179,27,27,0.06)' : 'transparent',
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        lineHeight: 1
                    }}>
                        <div style={{ fontSize: '9px', letterSpacing: '2px', marginBottom: '4px', fontWeight: '400' }}>
                            REMAINING
                        </div>
                        {formatTime(timeLeft)}
                    </div>
                </div>
            </div>

            {/* ── QUESTION NAV DOTS ── */}
            <div style={{
                display: 'flex',
                gap: '4px',
                marginBottom: '20px',
                flexWrap: 'wrap'
            }}>
                {questions.map((q, index) => {
                    const isActive = currentQ === index
                    const isAnswered = answers[q._id] && answers[q._id].trim()
                    return (
                        <button
                            key={q._id}
                            onClick={() => setCurrentQ(index)}
                            style={{
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontFamily: 'var(--font-body)',
                                fontSize: '12px',
                                fontWeight: isActive ? '700' : '400',
                                border: isActive ? '2px solid var(--ink)' : '1px solid var(--manila-dark)',
                                background: isActive ? 'var(--ink)' : isAnswered ? 'var(--manila-dark)' : 'transparent',
                                color: isActive ? 'var(--manila)' : isAnswered ? 'var(--ink)' : 'var(--graphite)',
                                cursor: 'pointer',
                                transition: 'all 0.1s ease'
                            }}
                        >
                            {index + 1}
                        </button>
                    )
                })}
            </div>

            {/* ── QUESTION CARD ── */}
            <div style={{
                background: 'var(--manila)',
                border: '1px solid var(--manila-dark)',
                borderLeft: '4px solid var(--red)',
                padding: '28px 24px',
                marginBottom: '24px',
                boxShadow: '1px 2px 6px rgba(0,0,0,0.08)'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px'
                }}>
                    <p style={{
                        fontFamily: 'var(--font-stamp)',
                        fontSize: '13px',
                        letterSpacing: '2px',
                        color: 'var(--graphite)'
                    }}>
                        Question {currentQ + 1}.
                    </p>
                    {currentQuestion.type && (
                        <span style={{
                            padding: '3px 10px',
                            border: '1px solid var(--manila-dark)',
                            fontSize: '10px',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            fontFamily: 'var(--font-body)',
                            color: 'var(--graphite)'
                        }}>
                            {currentQuestion.type === 'mcq' ? 'MCQ' : currentQuestion.type === 'short' ? 'SHORT' : currentQuestion.type === 'long' ? 'LONG' : currentQuestion.type.toUpperCase()}
                        </span>
                    )}
                </div>

                <h3 style={{
                    fontSize: '15px',
                    fontWeight: '700',
                    color: 'var(--ink)',
                    lineHeight: '1.7',
                    marginBottom: '20px',
                    fontFamily: 'var(--font-body)'
                }}>
                    {currentQuestion.question}
                </h3>

                {/* MCQ options with letter circles */}
                {hasMCQOptions ? (
                    <div>
                        {currentQuestion.options.map((option, i) => {
                            const isSelected = answers[currentQuestion._id] === option
                            const letter = optionLetters[i] || String(i + 1)
                            return (
                                <label
                                    key={i}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '14px',
                                        padding: '12px 14px',
                                        marginBottom: '8px',
                                        border: '1px solid',
                                        borderColor: isSelected ? 'var(--red)' : 'var(--manila-dark)',
                                        background: isSelected ? 'rgba(179,27,27,0.06)' : 'transparent',
                                        cursor: 'pointer',
                                        transition: 'all 0.1s ease',
                                        fontSize: '14px',
                                        color: 'var(--ink)'
                                    }}
                                >
                                    <input
                                        type="radio"
                                        name={`question-${currentQuestion._id}`}
                                        value={option}
                                        checked={isSelected}
                                        onChange={(e) => handleAnswer(currentQuestion._id, e.target.value)}
                                        style={{ display: 'none' }}
                                    />
                                    {/* Letter circle */}
                                    <span style={{
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '50%',
                                        border: '2px solid',
                                        borderColor: isSelected ? 'var(--red)' : 'var(--graphite)',
                                        background: isSelected ? 'var(--red)' : 'transparent',
                                        color: isSelected ? 'var(--manila)' : 'var(--graphite)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontFamily: 'var(--font-stamp)',
                                        fontSize: '12px',
                                        flexShrink: 0,
                                        transition: 'all 0.1s ease'
                                    }}>
                                        {letter}
                                    </span>
                                    {option}
                                </label>
                            )
                        })}
                    </div>
                ) : (
                    <textarea
                        value={answers[currentQuestion._id] || ''}
                        onChange={(e) => handleAnswer(currentQuestion._id, e.target.value)}
                        placeholder="Type your response here..."
                        rows="6"
                        className="input"
                        style={{
                            resize: 'vertical',
                            lineHeight: '1.7',
                            fontSize: '14px',
                            background: 'var(--manila-light)'
                        }}
                    />
                )}
            </div>

            {/* ── BOTTOM BAR: Nav + Wax Seal ── */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid var(--manila-dark)',
                paddingTop: '20px'
            }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
                        disabled={currentQ === 0}
                        className="btn"
                        style={{ padding: '10px 20px', fontSize: '12px' }}
                    >
                        ← Prev
                    </button>
                    <button
                        onClick={() => setCurrentQ(Math.min(questions.length - 1, currentQ + 1))}
                        disabled={currentQ === questions.length - 1}
                        className="btn"
                        style={{ padding: '10px 20px', fontSize: '12px' }}
                    >
                        Next →
                    </button>
                </div>

                <WaxSeal onClick={handleSubmit} disabled={!generatedPaper} />
            </div>

            {status && (
                <p style={{
                    marginTop: '16px',
                    fontSize: '13px',
                    color: 'var(--red)',
                    fontFamily: 'var(--font-accent)'
                }}>
                    {status}
                </p>
            )}
        </div>
    )
}

export default Exam