import { useState, useMemo } from 'react'
import axios from 'axios'
import { useExam } from '../context/ExamContext'

const Configure = () => {
    const { materials, examConfig, setExamConfig, setGeneratedPaper } = useExam()
    const [status, setStatus] = useState('')
    const [loading, setLoading] = useState(false)
    const [selectedTags, setSelectedTags] = useState([])

    // Separate notes and PYQs
    const notesMaterials = materials.filter(m => m.materialType !== 'previous_paper')
    const hasPYQs = materials.some(m => m.materialType === 'previous_paper')

    // Get all unique tags from notes materials
    const allTags = useMemo(() => {
        const tags = notesMaterials.flatMap(m => m.topics || [])
        return [...new Set(tags)].sort()
    }, [notesMaterials])

    // Filter notes materials by selected tags
    const filteredMaterials = useMemo(() => {
        if (selectedTags.length === 0) return notesMaterials
        return notesMaterials.filter(m =>
            selectedTags.some(tag => (m.topics || []).includes(tag))
        )
    }, [notesMaterials, selectedTags])

    const toggleTag = (tag) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        )
    }

    const toggleMaterial = (materialId) => {
        setExamConfig(prev => {
            const ids = prev.materialIds || []
            const updated = ids.includes(materialId)
                ? ids.filter(id => id !== materialId)
                : [...ids, materialId]
            return { ...prev, materialIds: updated }
        })
    }

    const selectAllFiltered = () => {
        const allIds = filteredMaterials.map(m => m._id)
        setExamConfig(prev => ({ ...prev, materialIds: allIds }))
    }

    const clearSelection = () => {
        setExamConfig(prev => ({ ...prev, materialIds: [] }))
    }

    const handleChange = (field, value) => {
        if (field === 'paperStrategy' && value === 'follow_pattern') {
            setExamConfig(prev => ({ ...prev, [field]: value, type: 'auto', mode: 'single' }))
        } else if (field === 'paperStrategy' && value !== 'follow_pattern' && examConfig.type === 'auto') {
            setExamConfig(prev => ({ ...prev, [field]: value, type: 'mcq' }))
        } else if (field === 'mode' && value === 'mixed') {
            setExamConfig(prev => ({ ...prev, mode: 'mixed' }))
        } else if (field === 'mode' && value === 'single') {
            setExamConfig(prev => ({ ...prev, mode: 'single' }))
        } else {
            setExamConfig(prev => ({ ...prev, [field]: value }))
        }
    }

    const handleTypeCount = (qType, value) => {
        const num = Math.max(0, Math.min(50, Number(value) || 0))
        setExamConfig(prev => ({
            ...prev,
            typeCounts: { ...prev.typeCounts, [qType]: num }
        }))
    }

    const totalMixed = (examConfig.typeCounts?.mcq || 0) +
        (examConfig.typeCounts?.short || 0) +
        (examConfig.typeCounts?.long || 0)

    const handleGenerate = async (e) => {
        e.preventDefault()

        if (!examConfig.materialIds || examConfig.materialIds.length === 0) {
            setStatus('Select at least one material.')
            return
        }

        if (examConfig.mode === 'mixed' && totalMixed === 0) {
            setStatus('Set at least one question count.')
            return
        }

        setLoading(true)
        setStatus('Compiling operation brief... this may take 1-2 minutes.')

        try {
            const response = await axios.post('http://localhost:3000/api/generate/paper', examConfig)
            setGeneratedPaper(response.data.paper)
            setStatus('Dossier compiled. Proceed to the Exam.')
        } catch (error) {
            setStatus(error.response?.data?.error || 'Compilation failed. Try again.')
        }

        setLoading(false)
    }

    const labelStyle = {
        display: 'block',
        fontSize: '11px',
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        color: 'var(--graphite)',
        marginBottom: '6px'
    }

    const isFollowPattern = examConfig.paperStrategy === 'follow_pattern'

    return (
        <div style={{ maxWidth: '560px' }}>

            <div className="stamp stamp-red" style={{ fontSize: '11px', marginBottom: '28px' }}>
                Mission Setup
            </div>

            <h1 className="font-stamp" style={{
                fontSize: '28px',
                color: 'var(--ink)',
                marginBottom: '8px'
            }}>
                Operation Parameters
            </h1>

            <p className="font-accent" style={{
                fontSize: '14px',
                color: 'var(--graphite)',
                marginBottom: '32px'
            }}>
                Configure the scope and difficulty of your intelligence assessment.
            </p>

            <div style={{ borderTop: '1px solid var(--manila-dark)', paddingTop: '28px' }}>

                {/* ── TAG FILTER ── */}
                {allTags.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>Filter by Tags</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {allTags.map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => toggleTag(tag)}
                                    style={{
                                        padding: '4px 12px',
                                        fontSize: '12px',
                                        fontFamily: 'var(--font-body)',
                                        letterSpacing: '0.5px',
                                        border: '1px solid',
                                        borderColor: selectedTags.includes(tag) ? 'var(--ink)' : 'var(--manila-dark)',
                                        background: selectedTags.includes(tag) ? 'var(--ink)' : 'transparent',
                                        color: selectedTags.includes(tag) ? 'var(--manila)' : 'var(--graphite)',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease'
                                    }}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── MATERIAL SELECTION (multi-select checkboxes) ── */}
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label style={{ ...labelStyle, marginBottom: 0 }}>
                            Source Materials ({(examConfig.materialIds || []).length} selected)
                        </label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button type="button" onClick={selectAllFiltered} style={{
                                fontSize: '10px', background: 'none', border: 'none',
                                color: 'var(--graphite)', cursor: 'pointer', textDecoration: 'underline',
                                fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '1px'
                            }}>
                                All
                            </button>
                            <button type="button" onClick={clearSelection} style={{
                                fontSize: '10px', background: 'none', border: 'none',
                                color: 'var(--graphite)', cursor: 'pointer', textDecoration: 'underline',
                                fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '1px'
                            }}>
                                Clear
                            </button>
                        </div>
                    </div>

                    {filteredMaterials.length === 0 ? (
                        <p style={{ fontSize: '13px', color: 'var(--graphite)', fontFamily: 'var(--font-accent)' }}>
                            {notesMaterials.length === 0
                                ? 'No study materials uploaded yet.'
                                : 'No materials match the selected tags.'}
                        </p>
                    ) : (
                        <div style={{
                            border: '1px solid var(--manila-dark)',
                            maxHeight: '200px',
                            overflowY: 'auto'
                        }}>
                            {filteredMaterials.map(material => {
                                const isSelected = (examConfig.materialIds || []).includes(material._id)
                                return (
                                    <label
                                        key={material._id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            padding: '10px 12px',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid var(--manila-dark)',
                                            background: isSelected ? 'var(--manila-light)' : 'transparent',
                                            transition: 'background 0.1s ease'
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleMaterial(material._id)}
                                            style={{ accentColor: 'var(--red)' }}
                                        />
                                        <div>
                                            <span style={{ fontSize: '13px', color: 'var(--ink)', fontWeight: isSelected ? '700' : '400' }}>
                                                {material.filename}
                                            </span>
                                            {material.topics && material.topics.length > 0 && (
                                                <div style={{ display: 'flex', gap: '3px', marginTop: '2px', flexWrap: 'wrap' }}>
                                                    {material.topics.map(t => (
                                                        <span key={t} style={{
                                                            fontSize: '9px', padding: '1px 5px',
                                                            border: '1px solid var(--manila-dark)',
                                                            color: 'var(--graphite)', fontFamily: 'var(--font-body)'
                                                        }}>
                                                            {t}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </label>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* ── QUESTION MODE (hidden for follow_pattern) ── */}
                {!isFollowPattern && (
                    <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>Question Mode</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {['single', 'mixed'].map(m => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => handleChange('mode', m)}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        fontFamily: 'var(--font-body)',
                                        fontSize: '13px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        border: '2px solid',
                                        borderColor: examConfig.mode === m ? 'var(--ink)' : 'var(--manila-dark)',
                                        background: examConfig.mode === m ? 'var(--ink)' : 'transparent',
                                        color: examConfig.mode === m ? 'var(--manila)' : 'var(--graphite)',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                        fontWeight: examConfig.mode === m ? '700' : '400'
                                    }}
                                >
                                    {m === 'single' ? 'Single Type' : 'Mixed Types'}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── SINGLE MODE: type + count ── */}
                {!isFollowPattern && examConfig.mode === 'single' && (
                    <>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle}>Question Format</label>
                            <select
                                value={examConfig.type}
                                onChange={(e) => handleChange('type', e.target.value)}
                                className="select-field"
                            >
                                <option value="mcq">Multiple Choice</option>
                                <option value="short">Short Answer</option>
                                <option value="long">Long Answer</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle}>Number of Questions</label>
                            <input
                                type="number"
                                value={examConfig.count}
                                onChange={(e) => handleChange('count', Number(e.target.value))}
                                min="1"
                                max="50"
                                className="input"
                            />
                        </div>
                    </>
                )}

                {/* ── MIXED MODE: per-type counts ── */}
                {!isFollowPattern && examConfig.mode === 'mixed' && (
                    <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>Questions per Type (Total: {totalMixed})</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {[
                                { key: 'mcq', label: 'MCQ' },
                                { key: 'short', label: 'Short' },
                                { key: 'long', label: 'Long' }
                            ].map(({ key, label }) => (
                                <div key={key} style={{ flex: 1 }}>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '10px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        color: 'var(--graphite)',
                                        marginBottom: '4px',
                                        textAlign: 'center'
                                    }}>
                                        {label}
                                    </label>
                                    <input
                                        type="number"
                                        value={examConfig.typeCounts?.[key] || 0}
                                        onChange={(e) => handleTypeCount(key, e.target.value)}
                                        min="0"
                                        max="50"
                                        className="input"
                                        style={{ textAlign: 'center' }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── DIFFICULTY ── */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={labelStyle}>Threat Level</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {['easy', 'medium', 'hard'].map((level) => (
                            <button
                                key={level}
                                type="button"
                                onClick={() => handleChange('difficulty', level)}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    fontFamily: 'var(--font-body)',
                                    fontSize: '13px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    border: '2px solid',
                                    borderColor: examConfig.difficulty === level ? 'var(--red)' : 'var(--manila-dark)',
                                    background: examConfig.difficulty === level ? 'var(--red)' : 'transparent',
                                    color: examConfig.difficulty === level ? 'var(--manila)' : 'var(--graphite)',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    fontWeight: examConfig.difficulty === level ? '700' : '400'
                                }}
                            >
                                {level === 'easy' ? '◇ Easy' : level === 'medium' ? '◆ Medium' : '◆◆ Hard'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── PYQ STRATEGY ── */}
                {hasPYQs && (
                    <div style={{ marginBottom: '24px' }}>
                        <label style={labelStyle}>Previous Paper Strategy</label>
                        <select
                            value={examConfig.paperStrategy}
                            onChange={(e) => handleChange('paperStrategy', e.target.value)}
                            className="select-field"
                        >
                            <option value="material_only">Use as study material only</option>
                            <option value="follow_pattern">Follow same paper pattern</option>
                            <option value="similar_questions">Include similar style questions</option>
                            <option value="avoid_questions">Avoid these questions entirely</option>
                        </select>
                    </div>
                )}

                <button
                    onClick={handleGenerate}
                    className="btn btn-red"
                    style={{ width: '100%' }}
                    disabled={loading}
                >
                    {loading ? 'Compiling Dossier...' : 'Compile Dossier →'}
                </button>
            </div>

            {status && (
                <p style={{
                    marginTop: '16px',
                    fontSize: '13px',
                    color: status.includes('Proceed') ? '#2d6a2e' : status.includes('failed') ? 'var(--red)' : 'var(--graphite)',
                    fontFamily: 'var(--font-accent)'
                }}>
                    {status}
                </p>
            )}
        </div>
    )
}

export default Configure