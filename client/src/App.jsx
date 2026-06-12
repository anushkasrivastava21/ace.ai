import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { ExamProvider } from './context/ExamContext'
import Home from './pages/Home'
import Upload from './pages/Upload'
import Configure from './pages/Configure'
import Results from './pages/Results'
import Exam from './pages/Exam'

const Navbar = () => {
  return (
    <nav style={{ padding: '15px', borderBottom: '1px solid white', display: 'flex', gap: '20px' }}>
      <Link to="/">Home</Link>
      <Link to="/upload">Upload</Link>
      <Link to="/configure">Configure</Link>
      <Link to="/exam">Exam</Link>
      <Link to="/results">Results</Link>
    </nav>
  )
}

const App = () => {
  return (
    <ExamProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/configure" element={<Configure />} />
          <Route path="/exam" element={<Exam />} />
          <Route path="/results" element={<Results />} />
        </Routes>
      </BrowserRouter>
    </ExamProvider>
  )
}

export default App