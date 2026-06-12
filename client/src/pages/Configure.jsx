import { useState } from 'react'
import axios from 'axios'
import { useExam } from '../context/ExamContext'

const Configure = () => {
    const { materials, examConfig, setExamConfig, setGeneratedPaper } = useExam()
    const [status, setStatus] = useState('')

    const handleChange = (field, value) => {
        setExamConfig({ ...examConfig, [field]: value })
    }

    const handleGenerate = async (e) => {
        e.preventDefault()

        if (!examConfig.subject) {
            setStatus('Please select a material first')
            return
        }

        try {
            const response = await axios.post('http://localhost:3000/api/generate/paper', examConfig)
            setGeneratedPaper(response.data)
            setStatus('Paper generated! Go to Exam page.')
        } catch (error) {
            setStatus('Generation failed. Try again.')
        }
    }

    return (
        <div style={{ padding: '20px', maxWidth: '500px' }}>
            <h1>Configure Your Test</h1>

            <form onSubmit={handleGenerate}>
                <div style={{ marginBottom: '10px' }}>
                    <label>Material</label><br />
                    <select
                        value={examConfig.subject}
                        onChange={(e) => handleChange('subject', e.target.value)}
                        style={{ width: '100%', padding: '8px' }}
                    >
                        <option value="">-- Select a material --</option>
                        {materials.map((material) => (
                            <option key={material._id} value={material.filename}>
                                {material.filename}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label>Question Type</label><br />
                    <select
                        value={examConfig.type}
                        onChange={(e) => handleChange('type', e.target.value)}
                        style={{ width: '100%', padding: '8px' }}
                    >
                        <option value="mcq">Multiple Choice</option>
                        <option value="short">Short Answer</option>
                        <option value="long">Long Answer</option>
                    </select>
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label>Difficulty</label><br />
                    <select
                        value={examConfig.difficulty}
                        onChange={(e) => handleChange('difficulty', e.target.value)}
                        style={{ width: '100%', padding: '8px' }}
                    >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label>Number of Questions</label><br />
                    <input
                        type="number"
                        value={examConfig.count}
                        onChange={(e) => handleChange('count', Number(e.target.value))}
                        min="1"
                        max="50"
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>

                <button type="submit">Generate Paper</button>
            </form>

            {status && <p>{status}</p>}
        </div>
    )
}

export default Configure