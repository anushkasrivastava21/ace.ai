const Layout = ({ children }) => {
    return (
        <div className="vignette" style={{ minHeight: '100vh', padding: '32px 16px' }}>
            <div
                className="paper-texture"
                style={{
                    maxWidth: 'var(--content-max)',
                    margin: '0 auto',
                    minHeight: 'calc(100vh - 64px)',
                    padding: '40px 36px',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                    borderRadius: 'var(--radius)',
                    position: 'relative',
                    zIndex: 1
                }}
            >
                {children}
            </div>
        </div>
    )
}

export default Layout