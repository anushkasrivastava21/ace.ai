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
        paperStrategy: 'material_only',
        timerMinutes: 30
    })
    const [generatedPaper, setGeneratedPaper] = useState(null)
    const [attempts, setAttempts] = useState([])

    useEffect(() => {
        if (!token) {
            setMaterials([])
            setGeneratedPaper(null)
            setAttempts([])
            return
        }

        const fetchData = async () => {
            try {
                const materialsRes = await axios.get('http://localhost:3000/api/materials')
                setMaterials(materialsRes.data.materials)
            } catch (error) {
                console.error('Failed to fetch materials:', error.message)
            }

            try {
                const paperRes = await axios.get('http://localhost:3000/api/generate/paper/latest')
                if (paperRes.data.paper) {
                    setGeneratedPaper(paperRes.data.paper)
                }
            } catch (error) {
                console.error('Failed to fetch latest paper:', error.message)
            }
        }

        fetchData()
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