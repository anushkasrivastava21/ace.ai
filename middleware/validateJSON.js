const validateJSON = (req, res, next) => {
    // Skip this check for file uploads (multipart/form-data)
    const contentType = req.headers['content-type'] || ''
    if (contentType.includes('multipart/form-data')) {
        return next()
    }

    if (req.method === 'POST' && !req.body) {
        return res.status(400).json({ error: 'Request body is empty' })
    }
    next()
}

module.exports = validateJSON