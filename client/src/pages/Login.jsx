import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [status, setStatus] = useState('')
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!email || !password) {
            setStatus('Please fill in all fields')
            return
        }

        try {
            await login(email, password)
            setStatus('Login successful!')
            navigate('/')
        } catch (error) {
            setStatus(error.response?.data?.error || 'Login failed. Try again.')
        }
    }

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto', paddingTop: '48px' }}>

            <div className="stamp stamp-red" style={{ fontSize: '11px', marginBottom: '32px' }}>
                Identify Yourself
            </div>

            <h1 className="font-stamp" style={{
                fontSize: '28px',
                color: 'var(--ink)',
                marginBottom: '8px'
            }}>
                Agent Login
            </h1>

            <p className="font-accent" style={{
                fontSize: '14px',
                color: 'var(--graphite)',
                marginBottom: '32px'
            }}>
                Present your credentials to access the dossier.
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
                    Authenticate →
                </button>
            </div>

            {status && (
                <p style={{
                    marginTop: '16px',
                    fontSize: '13px',
                    color: status.includes('successful') ? '#2d6a2e' : 'var(--red)',
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
                New recruit? <Link to="/signup">Request Access</Link>
            </p>
        </div>
    )
}

export default Login