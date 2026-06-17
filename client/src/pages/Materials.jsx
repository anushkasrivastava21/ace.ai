import { useExam } from '../context/ExamContext'

const Materials = () => {
    const { materials } = useExam()

    const notesMaterials = materials.filter(m => m.materialType !== 'previous_paper')
    const pyqMaterials = materials.filter(m => m.materialType === 'previous_paper')

    if (materials.length === 0) {
        return (
            <div style={{ textAlign: 'center', paddingTop: '80px' }}>
                <div className="stamp stamp-red" style={{ fontSize: '11px', marginBottom: '32px' }}>
                    Empty Archive
                </div>
                <h1 className="font-stamp" style={{ fontSize: '28px', color: 'var(--ink)', marginBottom: '12px' }}>
                    No Materials Found
                </h1>
                <p className="font-accent" style={{ fontSize: '14px', color: 'var(--graphite)', marginBottom: '32px' }}>
                    Upload study materials to begin building your archive.
                </p>
                <a href="/upload" style={{ textDecoration: 'none' }}>
                    <button className="btn" style={{ padding: '12px 32px' }}>Upload Material →</button>
                </a>
            </div>
        )
    }

    const MaterialCard = ({ material }) => (
        <div style={{
            borderLeft: `3px solid ${material.materialType === 'previous_paper' ? 'var(--red)' : 'var(--graphite)'}`,
            padding: '14px 18px',
            marginBottom: '12px',
            background: 'var(--manila-light)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <p style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    color: 'var(--ink)',
                    marginBottom: '4px'
                }}>
                    {material.filename}
                </p>
                <span style={{
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    padding: '2px 8px',
                    border: '1px solid',
                    borderColor: material.materialType === 'previous_paper' ? 'var(--red)' : 'var(--manila-dark)',
                    color: material.materialType === 'previous_paper' ? 'var(--red)' : 'var(--graphite)',
                    fontFamily: 'var(--font-body)',
                    flexShrink: 0
                }}>
                    {material.materialType === 'previous_paper' ? 'PYQ' : 'Notes'}
                </span>
            </div>

            {material.topics && material.topics.length > 0 && (
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {material.topics.map(t => (
                        <span key={t} style={{
                            fontSize: '10px',
                            padding: '2px 8px',
                            background: 'var(--ink)',
                            color: 'var(--manila)',
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
                marginTop: '8px',
                lineHeight: '1.5'
            }}>
                {material.originalText?.substring(0, 150)}...
            </p>

            {material.chunkCount && (
                <p style={{
                    fontSize: '10px',
                    color: 'var(--graphite)',
                    marginTop: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                }}>
                    {material.chunkCount} chunks processed
                </p>
            )}
        </div>
    )

    return (
        <div style={{ maxWidth: '600px' }}>

            <div className="stamp stamp-red" style={{ fontSize: '11px', marginBottom: '28px' }}>
                Archive
            </div>

            <h1 className="font-stamp" style={{
                fontSize: '28px',
                color: 'var(--ink)',
                marginBottom: '8px'
            }}>
                My Materials
            </h1>

            <p className="font-accent" style={{
                fontSize: '14px',
                color: 'var(--graphite)',
                marginBottom: '32px'
            }}>
                {materials.length} document{materials.length !== 1 ? 's' : ''} in your classified archive.
            </p>

            {/* Study Notes section */}
            {notesMaterials.length > 0 && (
                <div style={{ marginBottom: '32px' }}>
                    <div style={{ borderTop: '1px solid var(--manila-dark)', paddingTop: '20px' }}>
                        <h2 className="font-stamp" style={{
                            fontSize: '14px',
                            color: 'var(--ink)',
                            letterSpacing: '2px',
                            marginBottom: '16px'
                        }}>
                            Study Materials ({notesMaterials.length})
                        </h2>
                        {notesMaterials.map(m => <MaterialCard key={m._id} material={m} />)}
                    </div>
                </div>
            )}

            {/* PYQ section */}
            {pyqMaterials.length > 0 && (
                <div style={{ marginBottom: '32px' }}>
                    <div style={{ borderTop: '1px solid var(--manila-dark)', paddingTop: '20px' }}>
                        <h2 className="font-stamp" style={{
                            fontSize: '14px',
                            color: 'var(--red)',
                            letterSpacing: '2px',
                            marginBottom: '16px'
                        }}>
                            Previous Year Papers ({pyqMaterials.length})
                        </h2>
                        {pyqMaterials.map(m => <MaterialCard key={m._id} material={m} />)}
                    </div>
                </div>
            )}

            <div style={{
                borderTop: '1px solid var(--manila-dark)',
                paddingTop: '24px',
                textAlign: 'center'
            }}>
                <a href="/upload" style={{ textDecoration: 'none' }}>
                    <button className="btn" style={{ padding: '12px 32px' }}>
                        Upload More Material →
                    </button>
                </a>
            </div>
        </div>
    )
}

export default Materials