import { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from './AuthContext'

const ExamContext = createContext()

export const ExamProvider = ({ children }) => {
    const { token } = useAuth()
    const [materials, setMaterials] = useState([])
    const [examConfig, setExamConfig] = useState({
        materialIds: [],
        difficulty: 'medium',
        count: 10,
        type: 'mcq',
        mode: 'single',
        typeCounts: { mcq: 5, short: 3, long: 2 },
        paperStrategy: 'material_only'
    })
    const [generatedPaper, setGeneratedPaper] = useState(null)
    const [attempts, setAttempts] = useState([])

    // Fetch user's materials when logged in or on page refresh
    useEffect(() => {
        if (!token) {
            setMaterials([])
            setGeneratedPaper(null)
            setAttempts([])
            return
        }

        const fetchMaterials = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/materials')
                setMaterials(response.data.materials)
            } catch (error) {
                console.error('Failed to fetch materials:', error.message)
            }
        }

        fetchMaterials()
    }, [token])

    return (
        <ExamContext.Provider value={{
            materials, setMaterials,
            examConfig, setExamConfig,
            generatedPaper, setGeneratedPaper,
            attempts, setAttempts
        }}>
            {children}
        </ExamContext.Provider>
    )
}

export const useExam = () => useContext(ExamContext)