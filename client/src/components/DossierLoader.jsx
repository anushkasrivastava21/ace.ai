import { useState, useEffect } from 'react'

const DossierLoader = ({ messages, title, subtitle }) => {
    const [currentMsg, setCurrentMsg] = useState(0)

    useEffect(() => {
        if (!messages || messages.length <= 1) return
        const interval = setInterval(() => {
            setCurrentMsg(prev => (prev + 1) % messages.length)
        }, 3000)
        return () => clearInterval(interval)
    }, [messages])

    const displayMessages = messages || ['Processing...']

    return (
        <div style={{ textAlign: 'center', paddingTop: '40px' }}>
            <div className="stamp stamp-red" style={{ fontSize: '13px', marginBottom: '32px' }}>
                {title || 'Stand By'}
            </div>

            <h1 className="font-stamp" style={{
                fontSize: '24px',
                color: 'var(--ink)',
                marginBottom: '24px'
            }}>
                {subtitle || 'Processing...'}
            </h1>

            {/* Animated bars */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '6px',
                marginBottom: '32px'
            }}>
                {[0, 1, 2, 3, 4].map(i => (
                    <div key={i} style={{
                        width: '4px',
                        height: '32px',
                        background: 'var(--red)',
                        opacity: 0.7,
                        animation: `barPulse 1s ease-in-out ${i * 0.15}s infinite`
                    }} />
                ))}
            </div>

            {/* Rotating message */}
            <div style={{
                borderLeft: '3px solid var(--red)',
                padding: '12px 20px',
                background: 'var(--manila-light)',
                maxWidth: '360px',
                margin: '0 auto',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center'
            }}>
                <p className="font-accent" style={{
                    fontSize: '14px',
                    color: 'var(--ink)',
                    margin: 0,
                    lineHeight: '1.6',
                    animation: 'fadeSwap 3s ease-in-out infinite'
                }}>
                    {displayMessages[currentMsg]}
                </p>
            </div>

            {/* Progress dots */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '24px'
            }}>
                {displayMessages.map((_, i) => (
                    <div key={i} style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: i === currentMsg ? 'var(--red)' : 'var(--manila-dark)',
                        transition: 'background 0.3s ease'
                    }} />
                ))}
            </div>

            <style>{`
        @keyframes barPulse {
          0%, 100% { transform: scaleY(0.4); opacity: 0.4; }
          50% { transform: scaleY(1); opacity: 0.9; }
        }
        @keyframes fadeSwap {
          0%, 100% { opacity: 1; }
          45% { opacity: 1; }
          50% { opacity: 0.3; }
          55% { opacity: 1; }
        }
      `}</style>
        </div>
    )
}

export default DossierLoader