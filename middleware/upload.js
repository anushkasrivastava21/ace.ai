const multer = require('multer')

// Store files in memory (we'll extract text immediately, don't need to keep the file)
const storage = multer.memoryStorage()

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },  // 10MB max
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true)
        } else {
            cb(new Error('Only PDF files are allowed'))
        }
    }
})

module.exports = upload