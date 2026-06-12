const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

// SIGNUP
const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' })
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' })
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10)

        // Create user
        const user = new User({ name, email, passwordHash })
        await user.save()

        // Create token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

        res.status(201).json({
            message: 'User created!',
            token,
            user: { id: user._id, name: user.name, email: user.email }
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// LOGIN
const login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' })
        }

        // Find user
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' })
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.passwordHash)
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' })
        }

        // Create token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

        res.status(200).json({
            message: 'Login successful!',
            token,
            user: { id: user._id, name: user.name, email: user.email }
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = { signup, login }