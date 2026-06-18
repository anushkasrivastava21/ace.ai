import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'

const Layout = ({ children }) => {
    const location = useLocation()

    return (
        <div className="vignette" style={{
            minHeight: '100vh',
            padding: '32px 16px'
        }}>
            <div
                className="paper-texture"
                style={{
                    maxWidth: 'var(--content-max)',
                    margin: '0 auto',
                    minHeight: 'calc(100vh - 64px)',
                    padding: 'clamp(20px, 4vw, 40px) clamp(16px, 4vw, 36px)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                    borderRadius: 'var(--radius)',
                    position: 'relative',
                    zIndex: 1,
                    overflow: 'hidden'
                }}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}

export default Layout