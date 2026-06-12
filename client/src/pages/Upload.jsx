import { useState } from 'react'
import axios from 'axios'
import { useExam } from '../context/ExamContext'

const Upload = () => {
    const [filename, setFilename] = useState('')
    const [originalText, setOriginalText] = useState('')
    const [status, setStatus] = useState('')
    const { materials, setMaterials } = useExam()

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!filename || !originalText) {
            setStatus('Please fill in both fields')
            return
        }

        try {
            const response = await axios.post('http://localhost:3000/api/materials/upload', {
                filename,
                originalText
            })

            setMaterials([...materials, response.data.material])
            setStatus('Material uploaded successfully!')
            setFilename('')
            setOriginalText('')
        } catch (error) {
            setStatus('Upload failed. Try again.')
        }
    }

    return (
        <div style={{ padding: '20px', maxWidth: '500px' }}>
            <h1>Upload Materials</h1>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <label>Filename</label><br />
                    <input
                        type="text"
                        value={filename}
                        onChange={(e) => setFilename(e.target.value)}
                        placeholder="e.g. algorithms-notes.pdf"
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label>Content</label><br />
                    <textarea
                        value={originalText}
                        onChange={(e) => setOriginalText(e.target.value)}
                        placeholder="Paste your notes here..."
                        rows="6"
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>

                <button type="submit">Upload</button>
            </form>

            {status && <p>{status}</p>}

            <h2>Uploaded Materials ({materials.length})</h2>
            {materials.map((material) => (
                <div key={material._id} style={{ border: '1px solid white', padding: '10px', margin: '10px 0' }}>
                    <h3>{material.filename}</h3>
                </div>
            ))}
        </div>
    )
}

export default Upload