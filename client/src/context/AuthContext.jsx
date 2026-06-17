import { createContext, useState, useContext } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token') || null)
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null)

    const signup = async (name, email, password) => {
        const response = await axios.post('http://localhost:3000/api/auth/signup', {
            name, email, password
        })
        const { token: newToken, user: newUser } = response.data
        setToken(newToken)
        setUser(newUser)
        localStorage.setItem('token', newToken)
        localStorage.setItem('user', JSON.stringify(newUser))
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    }

    const login = async (email, password) => {
        const response = await axios.post('http://localhost:3000/api/auth/login', {
            email, password
        })
        const { token: newToken, user: newUser } = response.data
        setToken(newToken)
        setUser(newUser)
        localStorage.setItem('token', newToken)
        localStorage.setItem('user', JSON.stringify(newUser))
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    }

    const logout = () => {
        setToken(null)
        setUser(null)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        delete axios.defaults.headers.common['Authorization']
    }

    // Set token on initial load if it exists
    if (token && !axios.defaults.headers.common['Authorization']) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }

    return (
        <AuthContext.Provider value={{ token, user, signup, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)