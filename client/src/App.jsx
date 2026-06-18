import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { ExamProvider } from './context/ExamContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Upload from './pages/Upload'
import Materials from './pages/Materials'
import Configure from './pages/Configure'
import Results from './pages/Results'
import Exam from './pages/Exam'
import Login from './pages/Login'
import Signup from './pages/Signup'
import About from './pages/About'
import AttemptedTests from './pages/AttemptedTests'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
    setMenuOpen(false)
  }

  const handleNav = (path) => {
    navigate(path)
    setMenuOpen(false)
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
    transition: 'color 0.15s ease, border-color 0.15s ease',
    cursor: 'pointer',
    background: 'none',
    border: 'none'
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

  const mobileLinkStyle = {
    display: 'block',
    padding: '12px 24px',
    color: 'var(--manila-dark)',
    textDecoration: 'none',
    fontSize: '12px',
    fontFamily: 'var(--font-body)',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    width: '100%',
    textAlign: 'left'
  }

  return (
    <nav style={{
      padding: '10px 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(58,46,40,0.5)',
      position: 'relative',
      zIndex: 100
    }}>
      {/* Left: Logo + Desktop links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
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

        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.12)' }} className="desktop-only" />

        {/* Desktop links */}
        <div className="desktop-only" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link to="/" style={linkStyle} {...hoverHandlers}>Home</Link>
          {user && (
            <>
              <Link to="/upload" style={linkStyle} {...hoverHandlers}>Upload Material</Link>
              <Link to="/materials" style={linkStyle} {...hoverHandlers}>My Material</Link>
              <Link to="/configure" style={linkStyle} {...hoverHandlers}>Create Test</Link>
              <Link to="/results" style={linkStyle} {...hoverHandlers}>Attempted Tests</Link>
            </>
          )}
          <Link to="/about" style={linkStyle} {...hoverHandlers}>About</Link>
        </div>
      </div>

      {/* Right: Desktop user info */}
      <div className="desktop-only" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        {user ? (
          <>
            <span style={{ fontFamily: 'var(--font-accent)', fontSize: '13px', color: 'var(--manila)' }}>
              Agent {user.name}
            </span>
            <button onClick={handleLogout} style={{
              fontFamily: 'var(--font-body)', fontSize: '10px', textTransform: 'uppercase',
              letterSpacing: '1.5px', padding: '5px 14px', border: '1px solid rgba(255,255,255,0.15)',
              background: 'transparent', color: 'var(--manila-dark)', cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'var(--manila-dark)' }}
            >Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={linkStyle} {...hoverHandlers}>Login</Link>
            <Link to="/signup" style={{ ...linkStyle, padding: '5px 14px', border: '1px solid rgba(255,255,255,0.15)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--manila)'; e.currentTarget.style.borderColor = 'var(--manila)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--manila-dark)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
            >Sign Up</Link>
          </>
        )}
      </div>

      {/* Hamburger button (mobile only) */}
      <button
        className="mobile-only"
        onClick={() => setMenuOpen(!menuOpen)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px'
        }}
      >
        <span style={{ display: 'block', width: '22px', height: '2px', background: 'var(--manila)', transition: 'all 0.2s ease', transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
        <span style={{ display: 'block', width: '22px', height: '2px', background: 'var(--manila)', transition: 'all 0.2s ease', opacity: menuOpen ? 0 : 1 }} />
        <span style={{ display: 'block', width: '22px', height: '2px', background: 'var(--manila)', transition: 'all 0.2s ease', transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
      </button>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="mobile-only" style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'var(--mahogany)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          zIndex: 200
        }}>
          <button onClick={() => handleNav('/')} style={mobileLinkStyle}>Home</button>
          {user && (
            <>
              <button onClick={() => handleNav('/upload')} style={mobileLinkStyle}>Upload Material</button>
              <button onClick={() => handleNav('/materials')} style={mobileLinkStyle}>My Material</button>
              <button onClick={() => handleNav('/configure')} style={mobileLinkStyle}>Create Test</button>
              <button onClick={() => handleNav('/results')} style={mobileLinkStyle}>Attempted Tests</button>
            </>
          )}
          <button onClick={() => handleNav('/about')} style={mobileLinkStyle}>About</button>

          <div style={{ padding: '12px 24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            {user ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-accent)', fontSize: '13px', color: 'var(--manila)' }}>
                  Agent {user.name}
                </span>
                <button onClick={handleLogout} style={{
                  fontFamily: 'var(--font-body)', fontSize: '10px', textTransform: 'uppercase',
                  letterSpacing: '1px', padding: '5px 14px', border: '1px solid rgba(255,255,255,0.15)',
                  background: 'transparent', color: 'var(--red)', cursor: 'pointer'
                }}>Logout</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => handleNav('/login')} style={{ ...mobileLinkStyle, borderBottom: 'none', padding: '8px 0' }}>Login</button>
                <button onClick={() => handleNav('/signup')} style={{ ...mobileLinkStyle, borderBottom: 'none', padding: '8px 0' }}>Sign Up</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Show/hide classes via CSS */}
      <style>{`
        .desktop-only { display: flex; }
        .mobile-only { display: none; }

        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .mobile-only { display: flex !important; }
        }
      `}</style>
    </nav>
  )
}

const AppRoutes = () => {
  return (
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
  )
}

const App = () => {
  return (
    <AuthProvider>
      <ExamProvider>
        <BrowserRouter>
          <Navbar />
          <AppRoutes />
        </BrowserRouter>
      </ExamProvider>
    </AuthProvider>
  )
}

export default App