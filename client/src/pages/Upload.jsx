import { useState, useMemo } from 'react'
import axios from 'axios'
import { useExam } from '../context/ExamContext'

const Upload = () => {
    const [file, setFile] = useState(null)
    const [materialType, setMaterialType] = useState('notes')
    const [tags, setTags] = useState([])
    const [tagInput, setTagInput] = useState('')
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [status, setStatus] = useState('')
    const [uploading, setUploading] = useState(false)
    const { materials, setMaterials } = useExam()

    // Derive all unique existing tags from materials for autocomplete
    const existingTags = useMemo(() => {
        const all = materials.flatMap(m => m.topics || [])
        return [...new Set(all)].sort()
    }, [materials])

    // Filter suggestions based on current input
    const suggestions = useMemo(() => {
        if (!tagInput.trim()) return []
        return existingTags.filter(
            t => t.includes(tagInput.trim().toLowerCase()) && !tags.includes(t)
        )
    }, [tagInput, existingTags, tags])

    const addTag = (tag) => {
        const cleaned = tag.trim().toLowerCase()
        if (cleaned && !tags.includes(cleaned)) {
            setTags([...tags, cleaned])
        }
        setTagInput('')
        setShowSuggestions(false)
    }

    const removeTag = (tagToRemove) => {
        setTags(tags.filter(t => t !== tagToRemove))
    }

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            if (tagInput.trim()) addTag(tagInput)
        }
        if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
            setTags(tags.slice(0, -1))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!file) {
            setStatus('Please select a PDF file')
            return
        }

        setUploading(true)
        setStatus('Filing intel into the archive...')

        const formData = new FormData()
        formData.append('file', file)
        formData.append('materialType', materialType)
        formData.append('tags', JSON.stringify(tags))

        try {
            const response = await axios.post('http://localhost:3000/api/materials/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            setMaterials([...materials, response.data.material])
            setStatus('Material archived successfully.')
            setFile(null)
            setMaterialType('notes')
            setTags([])
        } catch (error) {
            setStatus(error.response?.data?.error || 'Upload failed. Try again.')
        }

        setUploading(false)
    }

    const labelStyle = {
        display: 'block',
        fontSize: '11px',
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        color: 'var(--graphite)',
        marginBottom: '6px'
    }

    return (
        <div style={{ maxWidth: '560px' }}>

            <div className="stamp stamp-red" style={{ fontSize: '11px', marginBottom: '28px' }}>
                File Intake
            </div>

            <h1 className="font-stamp" style={{
                fontSize: '28px',
                color: 'var(--ink)',
                marginBottom: '8px'
            }}>
                Upload Intel
            </h1>

            <p className="font-accent" style={{
                fontSize: '14px',
                color: 'var(--graphite)',
                marginBottom: '32px'
            }}>
                Submit documents for analysis. All materials are processed and archived locally.
            </p>

            <div style={{ borderTop: '1px solid var(--manila-dark)', paddingTop: '28px' }}>

                {/* File drop zone */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={labelStyle}>Select Document (PDF)</label>
                    <div style={{
                        border: '2px dashed var(--manila-dark)',
                        padding: '24px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: 'var(--manila-light)',
                        transition: 'border-color 0.15s ease'
                    }}
                        onClick={() => document.getElementById('file-input').click()}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--red)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--manila-dark)'}
                    >
                        <input
                            id="file-input"
                            type="file"
                            accept="application/pdf"
                            onChange={(e) => setFile(e.target.files[0])}
                            style={{ display: 'none' }}
                        />
                        <p className="font-accent" style={{
                            fontSize: '15px',
                            color: file ? 'var(--ink)' : 'var(--graphite)',
                            margin: 0
                        }}>
                            {file ? `📎 ${file.name}` : 'Click to select a PDF file'}
                        </p>
                    </div>
                </div>

                {/* Material type */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={labelStyle}>Document Classification</label>
                    <select
                        value={materialType}
                        onChange={(e) => setMaterialType(e.target.value)}
                        className="select-field"
                    >
                        <option value="notes">Study Notes / Textbook</option>
                        <option value="previous_paper">Previous Year Paper</option>
                    </select>
                </div>

                {/* Tags input */}
                <div style={{ marginBottom: '24px', position: 'relative' }}>
                    <label style={labelStyle}>Tags (press Enter to add)</label>

                    {/* Tag chips */}
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px',
                        marginBottom: tags.length > 0 ? '8px' : '0'
                    }}>
                        {tags.map(tag => (
                            <span key={tag} style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 10px',
                                fontSize: '12px',
                                fontFamily: 'var(--font-body)',
                                background: 'var(--ink)',
                                color: 'var(--manila)',
                                letterSpacing: '0.5px'
                            }}>
                                {tag}
                                <span
                                    onClick={() => removeTag(tag)}
                                    style={{ cursor: 'pointer', opacity: 0.7, fontSize: '14px' }}
                                >
                                    ×
                                </span>
                            </span>
                        ))}
                    </div>

                    <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => {
                            setTagInput(e.target.value)
                            setShowSuggestions(true)
                        }}
                        onKeyDown={handleTagKeyDown}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                        className="input"
                        placeholder={tags.length === 0 ? 'e.g. machine learning, chapter 5, physics' : 'Add another tag...'}
                    />

                    {/* Autocomplete suggestions */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            background: 'var(--manila-light)',
                            border: '1px solid var(--manila-dark)',
                            borderTop: 'none',
                            zIndex: 10,
                            maxHeight: '120px',
                            overflowY: 'auto'
                        }}>
                            {suggestions.map(s => (
                                <div
                                    key={s}
                                    onMouseDown={() => addTag(s)}
                                    style={{
                                        padding: '8px 12px',
                                        fontSize: '13px',
                                        fontFamily: 'var(--font-body)',
                                        cursor: 'pointer',
                                        color: 'var(--ink)',
                                        borderBottom: '1px solid var(--manila-dark)'
                                    }}
                                >
                                    {s}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    onClick={handleSubmit}
                    className="btn"
                    style={{ width: '100%' }}
                    disabled={uploading}
                >
                    {uploading ? 'Archiving...' : 'Submit to Archive →'}
                </button>
            </div>

            {status && (
                <p style={{
                    marginTop: '16px',
                    fontSize: '13px',
                    color: status.includes('successfully') ? '#2d6a2e' : status.includes('failed') ? 'var(--red)' : 'var(--graphite)',
                    fontFamily: 'var(--font-accent)'
                }}>
                    {status}
                </p>
            )}

            {/* Archived materials list */}
            {materials.length > 0 && (
                <div style={{ marginTop: '40px' }}>
                    <div style={{ borderTop: '1px solid var(--manila-dark)', paddingTop: '24px' }}>
                        <h2 className="font-stamp" style={{
                            fontSize: '16px',
                            color: 'var(--ink)',
                            marginBottom: '16px',
                            letterSpacing: '2px'
                        }}>
                            Archived Materials ({materials.length})
                        </h2>

                        {materials.map((material) => (
                            <div key={material._id} style={{
                                borderLeft: '3px solid var(--red)',
                                padding: '12px 16px',
                                marginBottom: '12px',
                                background: 'var(--manila-light)'
                            }}>
                                <p style={{
                                    fontSize: '14px',
                                    fontWeight: '700',
                                    color: 'var(--ink)',
                                    marginBottom: '4px'
                                }}>
                                    {material.filename}
                                </p>
                                <span style={{
                                    fontSize: '11px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    color: material.materialType === 'previous_paper' ? 'var(--red)' : 'var(--graphite)',
                                    fontFamily: 'var(--font-body)'
                                }}>
                                    {material.materialType === 'previous_paper' ? '◆ Previous Year Paper' : '◆ Study Notes'}
                                </span>

                                {/* Display tags */}
                                {material.topics && material.topics.length > 0 && (
                                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
                                        {material.topics.map(t => (
                                            <span key={t} style={{
                                                fontSize: '10px',
                                                padding: '2px 8px',
                                                border: '1px solid var(--manila-dark)',
                                                color: 'var(--graphite)',
                                                fontFamily: 'var(--font-body)',
                                                letterSpacing: '0.5px'
                                            }}>
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <p style={{
                                    fontSize: '12px',
                                    color: 'var(--graphite)',
                                    marginTop: '6px',
                                    lineHeight: '1.5'
                                }}>
                                    {material.originalText?.substring(0, 120)}...
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Upload