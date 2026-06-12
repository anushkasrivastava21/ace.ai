import { createContext, useState, useContext } from 'react'

// 1. Create the context
const ExamContext = createContext()

// 2. Create the provider — wraps your app and holds the data
export const ExamProvider = ({ children }) => {
    const [materials, setMaterials] = useState([])
    const [examConfig, setExamConfig] = useState({
        subject: '',
        difficulty: 'medium',
        count: 10,
        type: 'mcq'
    })
    const [generatedPaper, setGeneratedPaper] = useState(null)
    const [attempts, setAttempts] = useState([])

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

// 3. Custom hook — makes using context clean and simple
export const useExam = () => useContext(ExamContext)