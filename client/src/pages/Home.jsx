import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

// ── SVG Scenes for each step ──

const UploadScene = () => (
    <svg viewBox="0 0 280 200" width="280" height="200" style={{ display: 'block', margin: '0 auto' }}>
        {/* Desk surface */}
        <rect x="20" y="140" width="240" height="50" rx="2" fill="var(--manila-dark)" opacity="0.3" />

        {/* Folder back */}
        <rect x="60" y="50" width="160" height="110" rx="2" fill="#c4a882" stroke="var(--graphite)" strokeWidth="0.5" />

        {/* Folder tab */}
        <path d="M80 50 L80 38 L140 38 L148 50" fill="#c4a882" stroke="var(--graphite)" strokeWidth="0.5" />
        <text x="90" y="47" fontFamily="var(--font-body)" fontSize="6" fill="var(--graphite)" letterSpacing="1">INTEL</text>

        {/* Papers stacking in — animated */}
        <g>
            <rect x="75" y="65" width="130" height="80" rx="1" fill="var(--manila)" stroke="var(--manila-dark)" strokeWidth="0.5">
                <animate attributeName="y" values="30;65" dur="0.8s" fill="freeze" />
                <animate attributeName="opacity" values="0;1" dur="0.5s" fill="freeze" />
            </rect>
            <line x1="85" y1="78" x2="175" y2="78" stroke="var(--graphite)" strokeWidth="0.5" opacity="0.3" />
            <line x1="85" y1="88" x2="160" y2="88" stroke="var(--graphite)" strokeWidth="0.5" opacity="0.3" />
            <line x1="85" y1="98" x2="170" y2="98" stroke="var(--graphite)" strokeWidth="0.5" opacity="0.3" />
            <line x1="85" y1="108" x2="145" y2="108" stroke="var(--graphite)" strokeWidth="0.5" opacity="0.3" />
        </g>

        {/* PDF icon dropping in */}
        <g>
            <rect x="170" y="70" width="32" height="40" rx="1" fill="var(--red)" opacity="0.9">
                <animate attributeName="y" values="20;70" dur="1s" begin="0.3s" fill="freeze" />
                <animate attributeName="opacity" values="0;0.9" dur="0.5s" begin="0.3s" fill="freeze" />
            </rect>
            <text x="178" y="95" fontFamily="var(--font-stamp)" fontSize="8" fill="var(--manila)">PDF</text>
        </g>

        {/* Stamp */}
        <text x="80" y="135" fontFamily="var(--font-stamp)" fontSize="9" fill="var(--red)" opacity="0.6" letterSpacing="2">RECEIVED</text>
    </svg>
)

const ConfigureScene = () => (
    <svg viewBox="0 0 280 200" width="280" height="200" style={{ display: 'block', margin: '0 auto' }}>
        {/* Terminal/screen frame */}
        <rect x="40" y="25" width="200" height="145" rx="3" fill="var(--ink)" />
        <rect x="44" y="35" width="192" height="128" rx="1" fill="#1a1a1a" />

        {/* Screen header */}
        <circle cx="52" cy="30" r="2" fill="var(--red)" />
        <circle cx="60" cy="30" r="2" fill="#c4a882" />
        <circle cx="68" cy="30" r="2" fill="#2d6a2e" />

        {/* Config lines appearing */}
        <text x="52" y="52" fontFamily="var(--font-body)" fontSize="7" fill="var(--red)">{'>'} OPERATION CONFIG</text>

        <text x="52" y="68" fontFamily="var(--font-body)" fontSize="6.5" fill="#888">
            <tspan>source:</tspan>
            <tspan fill="var(--manila)" dx="4">malware_analysis.pdf</tspan>
        </text>
        <text x="52" y="82" fontFamily="var(--font-body)" fontSize="6.5" fill="#888">
            <tspan>type:</tspan>
            <tspan fill="var(--manila)" dx="4">mcq + short_answer</tspan>
            <animate attributeName="opacity" values="0;1" dur="0.4s" begin="0.3s" fill="freeze" />
        </text>
        <text x="52" y="96" fontFamily="var(--font-body)" fontSize="6.5" fill="#888">
            <tspan>difficulty:</tspan>
            <tspan fill="var(--red)" dx="4">HARD</tspan>
            <animate attributeName="opacity" values="0;1" dur="0.4s" begin="0.6s" fill="freeze" />
        </text>
        <text x="52" y="110" fontFamily="var(--font-body)" fontSize="6.5" fill="#888">
            <tspan>count:</tspan>
            <tspan fill="var(--manila)" dx="4">15 questions</tspan>
            <animate attributeName="opacity" values="0;1" dur="0.4s" begin="0.9s" fill="freeze" />
        </text>

        {/* Blinking cursor */}
        <rect x="52" y="120" width="6" height="9" fill="var(--manila)">
            <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" />
        </rect>

        {/* Compile button */}
        <rect x="52" y="138" width="80" height="16" rx="1" fill="var(--red)" opacity="0.9">
            <animate attributeName="opacity" values="0;0.9" dur="0.3s" begin="1.2s" fill="freeze" />
        </rect>
        <text x="64" y="149" fontFamily="var(--font-stamp)" fontSize="6" fill="var(--manila)" letterSpacing="1">
            COMPILE
            <animate attributeName="opacity" values="0;1" dur="0.3s" begin="1.2s" fill="freeze" />
        </text>
    </svg>
)

const ExamScene = () => (
    <svg viewBox="0 0 280 200" width="280" height="200" style={{ display: 'block', margin: '0 auto' }}>
        {/* Paper */}
        <rect x="50" y="20" width="180" height="165" rx="1" fill="var(--manila)" stroke="var(--manila-dark)" strokeWidth="0.5" />

        {/* Top secret header */}
        <text x="60" y="40" fontFamily="var(--font-stamp)" fontSize="7" fill="var(--red)" letterSpacing="2">TOP SECRET</text>
        <line x1="60" y1="45" x2="220" y2="45" stroke="var(--ink)" strokeWidth="0.8" />

        {/* Timer */}
        <rect x="175" y="26" width="48" height="18" rx="1" fill="none" stroke="var(--ink)" strokeWidth="1" />
        <text x="184" y="38" fontFamily="var(--font-body)" fontSize="9" fill="var(--ink)" fontWeight="700">
            24:31
            <animate attributeName="opacity" values="1;0.6;1" dur="1.5s" repeatCount="indefinite" />
        </text>

        {/* Question */}
        <text x="60" y="62" fontFamily="var(--font-stamp)" fontSize="6" fill="var(--graphite)">QUESTION 7.</text>
        <text x="60" y="76" fontFamily="var(--font-body)" fontSize="7" fill="var(--ink)">Which protocol ensures secure</text>
        <text x="60" y="87" fontFamily="var(--font-body)" fontSize="7" fill="var(--ink)">data transmission over HTTP?</text>

        {/* MCQ options */}
        {[
            { letter: 'A', text: 'FTP', y: 100, selected: false },
            { letter: 'B', text: 'TLS/SSL', y: 118, selected: true },
            { letter: 'C', text: 'SMTP', y: 136, selected: false },
            { letter: 'D', text: 'DNS', y: 154, selected: false }
        ].map(opt => (
            <g key={opt.letter}>
                <circle cx="72" cy={opt.y + 2} r="8" fill={opt.selected ? 'var(--red)' : 'none'} stroke={opt.selected ? 'var(--red)' : 'var(--graphite)'} strokeWidth="1">
                    {opt.selected && <animate attributeName="r" values="0;8" dur="0.3s" begin="0.8s" fill="freeze" />}
                </circle>
                <text x="68" y={opt.y + 5} fontFamily="var(--font-stamp)" fontSize="6" fill={opt.selected ? 'var(--manila)' : 'var(--graphite)'} textAnchor="middle">{opt.letter}</text>
                <text x="86" y={opt.y + 5} fontFamily="var(--font-body)" fontSize="7" fill="var(--ink)">{opt.text}</text>
            </g>
        ))}
    </svg>
)

const ResultsScene = () => (
    <svg viewBox="0 0 280 200" width="280" height="200" style={{ display: 'block', margin: '0 auto' }}>
        {/* Report paper */}
        <rect x="50" y="15" width="180" height="170" rx="1" fill="var(--manila)" stroke="var(--manila-dark)" strokeWidth="0.5" />

        {/* Header */}
        <text x="140" y="38" fontFamily="var(--font-stamp)" fontSize="8" fill="var(--ink)" textAnchor="middle" letterSpacing="2">OPERATION DEBRIEF</text>
        <line x1="70" y1="44" x2="210" y2="44" stroke="var(--ink)" strokeWidth="0.5" />

        {/* Score */}
        <text x="140" y="58" fontFamily="var(--font-body)" fontSize="6" fill="var(--graphite)" textAnchor="middle" letterSpacing="2">INTEL ACCURACY RATING</text>
        <text x="140" y="86" fontFamily="var(--font-body)" fontSize="28" fill="#2d6a2e" textAnchor="middle" fontWeight="700">
            87%
            <animate attributeName="opacity" values="0;1" dur="0.5s" begin="0.3s" fill="freeze" />
        </text>

        {/* Stamp — rotated CLEARED */}
        <g transform="translate(140, 120) rotate(-8)">
            <rect x="-52" y="-14" width="104" height="28" rx="2" fill="none" stroke="#2d6a2e" strokeWidth="2.5" opacity="0">
                <animate attributeName="opacity" values="0;0.8" dur="0.15s" begin="0.8s" fill="freeze" />
            </rect>
            <text x="0" y="6" fontFamily="var(--font-stamp)" fontSize="14" fill="#2d6a2e" textAnchor="middle" letterSpacing="4" opacity="0">
                CLEARED
                <animate attributeName="opacity" values="0;0.8" dur="0.15s" begin="0.8s" fill="freeze" />
            </text>
        </g>

        {/* Score bars */}
        {[
            { q: 'Q1', w: 60, color: '#2d6a2e' },
            { q: 'Q2', w: 60, color: '#2d6a2e' },
            { q: 'Q3', w: 36, color: 'var(--graphite)' },
            { q: 'Q4', w: 60, color: '#2d6a2e' },
            { q: 'Q5', w: 0, color: 'var(--red)' }
        ].map((bar, i) => (
            <g key={bar.q}>
                <text x="70" y={150 + i * 12} fontFamily="var(--font-body)" fontSize="5.5" fill="var(--graphite)">{bar.q}</text>
                <rect x="88" y={144 + i * 12} width="0" height="6" fill={bar.color} opacity="0.7">
                    <animate attributeName="width" values={`0;${bar.w}`} dur="0.5s" begin={`${0.4 + i * 0.1}s`} fill="freeze" />
                </rect>
            </g>
        ))}
    </svg>
)

// ── Main Home Component ──

const Home = () => {
    const { user } = useAuth()
    const [activeScene, setActiveScene] = useState(-1)
    const [typedText, setTypedText] = useState('')
    const [briefingDone, setBriefingDone] = useState(false)

    const briefingText = user
        ? `Welcome back, Agent ${user.name}. Your workstation is ready. Review the operation protocol.`
        : 'A new operation has been assigned to your desk. Review the protocol below.'

    const scenes = [
        {
            key: 'upload',
            number: '01',
            title: 'Acquire Intel',
            desc: 'Upload classified study materials. PDFs are parsed, chunked, and embedded locally. No external transmission.',
            visual: <UploadScene />
        },
        {
            key: 'configure',
            number: '02',
            title: 'Set Parameters',
            desc: 'Select sources, question format, difficulty, and strategy. The AI compiles a custom dossier from your materials.',
            visual: <ConfigureScene />
        },
        {
            key: 'exam',
            number: '03',
            title: 'Execute Operation',
            desc: 'Timed examination. MCQ, short answer, or mixed format. Every response is logged against the clock.',
            visual: <ExamScene />
        },
        {
            key: 'results',
            number: '04',
            title: 'Review Debrief',
            desc: 'AI-evaluated results. Per-question scoring, detailed feedback, and your final intel accuracy rating.',
            visual: <ResultsScene />
        }
    ]

    // Typewriter effect
    useEffect(() => {
        let i = 0
        const interval = setInterval(() => {
            if (i <= briefingText.length) {
                setTypedText(briefingText.substring(0, i))
                i++
            } else {
                clearInterval(interval)
                setBriefingDone(true)
                // Auto-reveal first scene
                setTimeout(() => setActiveScene(0), 300)
            }
        }, 25)
        return () => clearInterval(interval)
    }, [briefingText])

    // Auto-advance scenes
    useEffect(() => {
        if (activeScene < 0 || activeScene >= scenes.length - 1) return
        const timer = setTimeout(() => setActiveScene(prev => prev + 1), 2200)
        return () => clearTimeout(timer)
    }, [activeScene])

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                <div className="stamp stamp-red" style={{ fontSize: '11px', marginBottom: '24px' }}>
                    Classified
                </div>
                <h1 className="font-stamp" style={{
                    fontSize: '48px',
                    color: 'var(--ink)',
                    letterSpacing: '4px',
                    margin: '0 0 8px'
                }}>
                    ACE.AI
                </h1>
                <p style={{
                    fontSize: '12px',
                    color: 'var(--graphite)',
                    textTransform: 'uppercase',
                    letterSpacing: '2.5px',
                    fontFamily: 'var(--font-body)'
                }}>
                    AI-Powered Exam Preparation Platform
                </p>
            </div>

            {/* Briefing text */}
            <div style={{
                borderLeft: '3px solid var(--red)',
                padding: '14px 20px',
                marginBottom: '36px',
                background: 'var(--manila-light)',
                minHeight: '50px'
            }}>
                <p style={{
                    fontFamily: 'var(--font-accent)',
                    fontSize: '15px',
                    color: 'var(--ink)',
                    lineHeight: '1.7',
                    margin: 0
                }}>
                    {typedText}
                    <span style={{
                        display: 'inline-block',
                        width: '7px',
                        height: '15px',
                        background: 'var(--ink)',
                        marginLeft: '2px',
                        verticalAlign: 'text-bottom',
                        animation: 'blink 0.8s step-end infinite'
                    }} />
                </p>
                <style>{`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }`}</style>
            </div>

            {/* Protocol label */}
            {briefingDone && (
                <p style={{
                    fontFamily: 'var(--font-stamp)',
                    fontSize: '11px',
                    letterSpacing: '3px',
                    color: 'var(--graphite)',
                    marginBottom: '16px',
                    opacity: briefingDone ? 1 : 0,
                    transition: 'opacity 0.4s ease'
                }}>
                    OPERATION PROTOCOL
                </p>
            )}

            {/* Scene cards */}
            {scenes.map((scene, index) => (
                <div
                    key={scene.key}
                    style={{
                        borderTop: '1px solid var(--manila-dark)',
                        padding: '28px 0',
                        opacity: index <= activeScene ? 1 : 0,
                        transform: index <= activeScene ? 'translateY(0)' : 'translateY(20px)',
                        transition: 'opacity 0.6s ease, transform 0.6s ease',
                        pointerEvents: index <= activeScene ? 'auto' : 'none'
                    }}
                >
                    {/* Step number + title row */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        marginBottom: '16px'
                    }}>
                        <span style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '32px',
                            fontWeight: '700',
                            color: 'var(--manila-dark)',
                            lineHeight: 1
                        }}>
                            {scene.number}
                        </span>
                        <div>
                            <h3 className="font-stamp" style={{
                                fontSize: '16px',
                                color: 'var(--ink)',
                                letterSpacing: '2px',
                                margin: 0,
                                textTransform: 'uppercase'
                            }}>
                                {scene.title}
                            </h3>
                            <p style={{
                                fontSize: '12px',
                                color: 'var(--graphite)',
                                lineHeight: '1.6',
                                marginTop: '4px'
                            }}>
                                {scene.desc}
                            </p>
                        </div>
                    </div>

                    {/* Visual */}
                    <div style={{
                        background: 'var(--manila-light)',
                        border: '1px solid var(--manila-dark)',
                        padding: '20px 12px',
                        opacity: index <= activeScene ? 1 : 0,
                        transition: 'opacity 0.8s ease 0.3s'
                    }}>
                        {scene.visual}
                    </div>
                </div>
            ))}

            {/* Bottom divider */}
            <div style={{ borderTop: '1px solid var(--manila-dark)' }} />

            {/* CTA */}
            <div style={{
                textAlign: 'center',
                paddingTop: '32px',
                paddingBottom: '20px',
                opacity: activeScene >= scenes.length - 1 ? 1 : 0,
                transform: activeScene >= scenes.length - 1 ? 'translateY(0)' : 'translateY(12px)',
                transition: 'opacity 0.5s ease, transform 0.5s ease'
            }}>
                <p className="font-accent" style={{
                    fontSize: '13px',
                    color: 'var(--graphite)',
                    marginBottom: '20px'
                }}>
                    All analysis is conducted locally. No external agencies involved.
                </p>
                <a href={user ? '/upload' : '/login'} style={{ textDecoration: 'none' }}>
                    <button className="btn btn-red" style={{ fontSize: '14px', padding: '14px 36px' }}>
                        {user ? 'Begin Operation →' : 'Request Clearance →'}
                    </button>
                </a>
            </div>
        </div>
    )
}

export default Home