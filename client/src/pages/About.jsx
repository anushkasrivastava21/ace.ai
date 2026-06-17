const About = () => {
    return (
        <div style={{ maxWidth: '560px' }}>

            <div className="stamp stamp-red" style={{ fontSize: '11px', marginBottom: '28px' }}>
                Dossier
            </div>

            <h1 className="font-stamp" style={{
                fontSize: '28px',
                color: 'var(--ink)',
                marginBottom: '8px'
            }}>
                About Ace.ai
            </h1>

            <p className="font-accent" style={{
                fontSize: '14px',
                color: 'var(--graphite)',
                marginBottom: '32px'
            }}>
                The classified details behind the operation.
            </p>

            <div style={{ borderTop: '1px solid var(--manila-dark)', paddingTop: '28px' }}>

                {/* What it is */}
                <div style={{ marginBottom: '28px' }}>
                    <h3 className="font-stamp" style={{
                        fontSize: '13px',
                        color: 'var(--ink)',
                        letterSpacing: '2px',
                        marginBottom: '8px'
                    }}>
                        What is Ace.ai?
                    </h3>
                    <p style={{
                        fontSize: '14px',
                        color: 'var(--ink)',
                        lineHeight: '1.8'
                    }}>
                        Ace.ai is an AI-powered exam preparation platform. Upload your study
                        materials, configure test parameters, and receive a custom-generated
                        question paper — then take the exam and get AI-graded feedback.
                        All powered by local AI, no external APIs.
                    </p>
                </div>

                {/* How it works */}
                <div style={{ marginBottom: '28px', borderTop: '1px solid var(--manila-dark)', paddingTop: '24px' }}>
                    <h3 className="font-stamp" style={{
                        fontSize: '13px',
                        color: 'var(--ink)',
                        letterSpacing: '2px',
                        marginBottom: '8px'
                    }}>
                        How It Works
                    </h3>
                    <p style={{
                        fontSize: '14px',
                        color: 'var(--ink)',
                        lineHeight: '1.8'
                    }}>
                        Your PDFs are parsed into text, split into chunks, and converted into
                        vector embeddings. When you create a test, the system retrieves the
                        most relevant sections using semantic search, then generates questions
                        through a locally-hosted language model (LLaMA 3.2 via Ollama). Answers
                        are reviewed by the same AI for scoring and feedback.
                    </p>
                </div>

                {/* Tech stack */}
                <div style={{ marginBottom: '28px', borderTop: '1px solid var(--manila-dark)', paddingTop: '24px' }}>
                    <h3 className="font-stamp" style={{
                        fontSize: '13px',
                        color: 'var(--ink)',
                        letterSpacing: '2px',
                        marginBottom: '12px'
                    }}>
                        Tech Stack
                    </h3>
                    {[
                        { label: 'Frontend', value: 'React 19, Vite, Framer Motion' },
                        { label: 'Backend', value: 'Node.js, Express, Mongoose' },
                        { label: 'AI/ML', value: 'Ollama (LLaMA 3.2), Xenova Embeddings' },
                        { label: 'Database', value: 'MongoDB (Local)' },
                        { label: 'Auth', value: 'JWT + bcrypt' }
                    ].map(item => (
                        <div key={item.label} style={{
                            display: 'flex',
                            gap: '12px',
                            padding: '8px 0',
                            borderBottom: '1px solid var(--manila-dark)',
                            fontSize: '13px'
                        }}>
                            <span style={{
                                width: '90px',
                                flexShrink: 0,
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                fontSize: '10px',
                                color: 'var(--graphite)',
                                paddingTop: '2px'
                            }}>
                                {item.label}
                            </span>
                            <span style={{ color: 'var(--ink)' }}>{item.value}</span>
                        </div>
                    ))}
                </div>

                {/* Privacy */}
                <div style={{ marginBottom: '28px', borderTop: '1px solid var(--manila-dark)', paddingTop: '24px' }}>
                    <h3 className="font-stamp" style={{
                        fontSize: '13px',
                        color: 'var(--ink)',
                        letterSpacing: '2px',
                        marginBottom: '8px'
                    }}>
                        Privacy & Security
                    </h3>
                    <p style={{
                        fontSize: '14px',
                        color: 'var(--ink)',
                        lineHeight: '1.8'
                    }}>
                        All AI inference runs locally on your machine via Ollama. No data is
                        sent to external servers. Your materials, questions, and results stay
                        on your hardware. No external agencies involved.
                    </p>
                </div>

                {/* Built by */}
                <div style={{
                    borderTop: '1px solid var(--manila-dark)',
                    paddingTop: '24px',
                    textAlign: 'center'
                }}>
                    <p className="font-accent" style={{
                        fontSize: '14px',
                        color: 'var(--graphite)'
                    }}>
                        Built by Anushka — VIT Chennai
                    </p>
                </div>
            </div>
        </div>
    )
}

export default About