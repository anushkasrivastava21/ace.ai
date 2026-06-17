import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { ExamProvider } from './context/ExamContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Upload from './pages/Upload'
import Materials from './pages/Materials'
import Configure from './pages/Configure'
import AttemptedTests from './pages/AttemptedTests'
import Results from './pages/Results'
import Exam from './pages/Exam'
import Login from './pages/Login'
import Signup from './pages/Signup'
import About from './pages/About'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const linkStyle = {
    color: 'var(--manila-dark)',
    textDecoration: 'none',
    fontSize: '11px',
    fontFamily: 'var(--font-body)',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    padding: '6px 0',
    borderBottom: '1px solid transparent',
    transition: 'color 0.15s ease, border-color 0.15s ease'
  }

  const hoverHandlers = {
    onMouseEnter: (e) => {
      e.currentTarget.style.color = 'var(--manila)'
      e.currentTarget.style.borderBottomColor = 'var(--manila)'
    },
    onMouseLeave: (e) => {
      e.currentTarget.style.color = 'var(--manila-dark)'
      e.currentTarget.style.borderBottomColor = 'transparent'
    }
  }

  return (
    <nav style={{
      padding: '10px 28px',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(58,46,40,0.5)',
      flexWrap: 'wrap'
    }}>
      {/* Logo */}
      <Link to="/" style={{
        textDecoration: 'none',
        fontFamily: 'var(--font-stamp)',
        fontSize: '14px',
        letterSpacing: '2px',
        color: 'var(--manila)',
        marginRight: '4px'
      }}>
        ACE.AI
      </Link>

      <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.12)' }} />

      {/* Public links */}
      <Link to="/" style={linkStyle} {...hoverHandlers}>Home</Link>

      {/* Auth-required links */}
      {user && (
        <>
          <Link to="/upload" style={linkStyle} {...hoverHandlers}>Upload Material</Link>
          <Link to="/materials" style={linkStyle} {...hoverHandlers}>My Material</Link>
          <Link to="/configure" style={linkStyle} {...hoverHandlers}>Create Test</Link>
          <Link to="/results" style={linkStyle} {...hoverHandlers}>Attempted Tests</Link>
        </>
      )}

      <Link to="/about" style={linkStyle} {...hoverHandlers}>About</Link>

      {/* Right side */}
      <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px', alignItems: 'center' }}>
        {user ? (
          <>
            <span style={{
              fontFamily: 'var(--font-accent)',
              fontSize: '13px',
              color: 'var(--manila)'
            }}>
              Agent {user.name}
            </span>
            <button onClick={handleLogout} style={{
              fontFamily: 'var(--font-body)',
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              padding: '5px 14px',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'transparent',
              color: 'var(--manila-dark)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'var(--manila-dark)' }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={linkStyle}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--manila)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--manila-dark)' }}
            >Login</Link>
            <Link to="/signup" style={{
              ...linkStyle,
              padding: '5px 14px',
              border: '1px solid rgba(255,255,255,0.15)'
            }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--manila)'; e.currentTarget.style.borderColor = 'var(--manila)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--manila-dark)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
            >Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  )
}

const App = () => {
  return (
    <AuthProvider>
      <ExamProvider>
        <BrowserRouter>
          <Navbar />
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/materials" element={<Materials />} />
              <Route path="/configure" element={<Configure />} />
              <Route path="/exam" element={<Exam />} />
              <Route path="/results" element={<AttemptedTests />} />
              <Route path="/results/:attemptId" element={<Results />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </ExamProvider>
    </AuthProvider>
  )
}

export default App