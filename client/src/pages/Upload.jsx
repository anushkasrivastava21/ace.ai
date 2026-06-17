import { useState } from 'react'
import axios from 'axios'
import { useExam } from '../context/ExamContext'

const Upload = () => {
    const [file, setFile] = useState(null)
    const [materialType, setMaterialType] = useState('notes')
    const [status, setStatus] = useState('')
    const { materials, setMaterials } = useExam()

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!file) {
            setStatus('Please select a PDF file')
            return
        }

        const formData = new FormData()
        formData.append('file', file)
        formData.append('materialType', materialType)

        try {
            const response = await axios.post('http://localhost:3000/api/materials/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            setMaterials([...materials, response.data.material])
            setStatus('Material uploaded successfully!')
            setFile(null)
            setMaterialType('notes')
        } catch (error) {
            setStatus(error.response?.data?.error || 'Upload failed. Try again.')
        }
    }

    return (
        <div style={{ padding: '20px', maxWidth: '500px' }}>
            <h1>Upload Materials</h1>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <label>Select PDF</label><br />
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setFile(e.target.files[0])}
                    />
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label>Material Type</label><br />
                    <select
                        value={materialType}
                        onChange={(e) => setMaterialType(e.target.value)}
                        style={{ width: '100%', padding: '8px' }}
                    >
                        <option value="notes">Study Notes / Textbook</option>
                        <option value="previous_paper">Previous Year Paper</option>
                    </select>
                </div>

                <button type="submit">Upload</button>
            </form>

            {status && <p>{status}</p>}

            <h2>Uploaded Materials ({materials.length})</h2>
            {materials.map((material) => (
                <div key={material._id} style={{ border: '1px solid white', padding: '10px', margin: '10px 0' }}>
                    <h3>{material.filename}</h3>
                    <p style={{ fontSize: '0.8em', opacity: 0.7 }}>{material.materialType || 'notes'}</p>
                    <p>{material.originalText?.substring(0, 100)}...</p>
                </div>
            ))}
        </div>
    )
}

export default Upload