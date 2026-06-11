const validateJSON = (req, res, next) => {
    if (req.method === 'POST' && !req.body) {
        return res.status(400).json({ error: 'Request body is empty' })
    }
    next()
}

module.exports = validateJSON