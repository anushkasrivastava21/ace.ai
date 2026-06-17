import { useState } from 'react'
import axios from 'axios'
import { useExam } from '../context/ExamContext'

const Configure = () => {
    const { materials, examConfig, setExamConfig, setGeneratedPaper } = useExam()
    const [status, setStatus] = useState('')
    const [loading, setLoading] = useState(false)

    const hasPYQs = materials.some(m => m.materialType === 'previous_paper')

    const handleChange = (field, value) => {
        if (field === 'paperStrategy' && value === 'follow_pattern') {
            setExamConfig({ ...examConfig, [field]: value, type: 'auto' })
        } else if (field === 'paperStrategy' && value !== 'follow_pattern' && examConfig.type === 'auto') {
            setExamConfig({ ...examConfig, [field]: value, type: 'mcq' })
        } else {
            setExamConfig({ ...examConfig, [field]: value })
        }
    }

    const handleGenerate = async (e) => {
        e.preventDefault()

        if (!examConfig.subject) {
            setStatus('Please select a material first')
            return
        }

        setLoading(true)
        setStatus('Generating paper... this may take 1-2 minutes.')

        try {
            const response = await axios.post('http://localhost:3000/api/generate/paper', examConfig)
            setGeneratedPaper(response.data.paper)
            setStatus('Paper generated! Go to Exam page.')
        } catch (error) {
            setStatus('Generation failed. Try again.')
        }

        setLoading(false)
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

                {examConfig.paperStrategy !== 'follow_pattern' && (
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
                )}

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

                {hasPYQs && (
                    <div style={{ marginBottom: '10px' }}>
                        <label>Previous Year Paper Strategy</label><br />
                        <select
                            value={examConfig.paperStrategy}
                            onChange={(e) => handleChange('paperStrategy', e.target.value)}
                            style={{ width: '100%', padding: '8px' }}
                        >
                            <option value="material_only">Use as study material only</option>
                            <option value="follow_pattern">Follow same paper pattern</option>
                            <option value="similar_questions">Include similar style questions</option>
                        </select>
                    </div>
                )}

                <button type="submit" disabled={loading}>
                    {loading ? 'Generating...' : 'Generate Paper'}
                </button>
            </form>

            {status && <p>{status}</p>}
        </div>
    )
}

export default Configure