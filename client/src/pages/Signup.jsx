import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

const Signup = () => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [status, setStatus] = useState('')
    const { signup } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!name || !email || !password) {
            setStatus('Please fill in all fields')
            return
        }

        try {
            await signup(name, email, password)
            setStatus('Account created!')
            navigate('/')
        } catch (error) {
            setStatus(error.response?.data?.error || 'Signup failed. Try again.')
        }
    }

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto', paddingTop: '48px' }}>

            <div className="stamp stamp-red" style={{ fontSize: '11px', marginBottom: '32px' }}>
                Recruitment Form
            </div>

            <h1 className="font-stamp" style={{
                fontSize: '28px',
                color: 'var(--ink)',
                marginBottom: '8px'
            }}>
                New Agent
            </h1>

            <p className="font-accent" style={{
                fontSize: '14px',
                color: 'var(--graphite)',
                marginBottom: '32px'
            }}>
                Register to receive clearance for classified operations.
            </p>

            <div style={{
                borderTop: '1px solid var(--manila-dark)',
                paddingTop: '28px'
            }}>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '1.5px',
                        color: 'var(--graphite)',
                        marginBottom: '6px'
                    }}>
                        Agent Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input"
                        placeholder="Your codename"
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '1.5px',
                        color: 'var(--graphite)',
                        marginBottom: '6px'
                    }}>
                        Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input"
                        placeholder="agent@aceai.ops"
                    />
                </div>

                <div style={{ marginBottom: '28px' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '1.5px',
                        color: 'var(--graphite)',
                        marginBottom: '6px'
                    }}>
                        Password
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input"
                        placeholder="••••••••"
                    />
                </div>

                <button onClick={handleSubmit} className="btn" style={{ width: '100%' }}>
                    Request Clearance →
                </button>
            </div>

            {status && (
                <p style={{
                    marginTop: '16px',
                    fontSize: '13px',
                    color: status.includes('created') ? '#2d6a2e' : 'var(--red)',
                    fontFamily: 'var(--font-accent)'
                }}>
                    {status}
                </p>
            )}

            <p style={{
                marginTop: '24px',
                fontSize: '13px',
                color: 'var(--graphite)'
            }}>
                Already an agent? <Link to="/login">Authenticate here</Link>
            </p>
        </div>
    )
}

export default Signup