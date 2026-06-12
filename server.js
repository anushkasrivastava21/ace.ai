const express = require('express')
const cors = require('cors')
require('dotenv').config()

const connectDB = require('./config/db')
const logger = require('./middleware/logger')
const validateJSON = require('./middleware/validateJSON')
const materialsRoute = require('./routes/materials')
const generateRoute = require('./routes/generate')
const reviewRoute = require('./routes/review')
const authRoute = require('./routes/auth')

// Connect to MongoDB first
connectDB()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(logger)
app.use(validateJSON)

// Routes
app.use('/api/materials', materialsRoute)
app.use('/api/generate', generateRoute)
app.use('/api/review', reviewRoute)
app.use('/api/auth', authRoute)

// Health check
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Ace.ai server is running 🃏' })
})

// Error middleware
app.use((err, req, res, next) => {
    console.error(err.message)
    res.status(500).json({ error: 'Something went wrong' })
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})