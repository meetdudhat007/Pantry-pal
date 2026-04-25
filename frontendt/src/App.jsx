import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import ChatBot from './components/ChatBot'
import SavedRecipes from './components/SavedRecipes'
import About from './components/About'
import Footer from './components/Footer'
import Login from './components/Login'
import Register from './components/Register'

export default function App() {
  const [user, setUser] = useState(null)
  const [authMode, setAuthMode] = useState('login')
  const [currentPage, setCurrentPage] = useState('generate') // 'generate', 'recipes', 'about'

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (err) {
        console.error('Failed to parse user data:', err)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setCurrentPage('generate')
  }

  const handleLoginSuccess = (userData) => {
    setUser(userData)
    setAuthMode('login')
  }

  const handleRegisterSuccess = (userData) => {
    setUser(userData)
    setAuthMode('login')
  }

  // Show auth screens if not logged in
  if (!user) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-white font-[Inter] text-gray-900 min-h-screen flex flex-col">
        <Header user={null} onLogout={handleLogout} currentPage={currentPage} onNavigate={setCurrentPage} />
        <main className="max-w-7xl mx-auto px-8 py-16 flex-1 w-full flex items-center justify-center">
          {authMode === 'login' ? (
            <Login
              onLoginSuccess={handleLoginSuccess}
              onSwitchToRegister={() => setAuthMode('register')}
            />
          ) : (
            <Register
              onRegisterSuccess={handleRegisterSuccess}
              onSwitchToLogin={() => setAuthMode('login')}
            />
          )}
        </main>
        <Footer />
      </div>
    )
  }

  // Show main app if logged in
  return (
    <div className="bg-gradient-to-br from-green-50 to-white font-[Inter] text-gray-900 min-h-screen flex flex-col">
      <Header user={user} onLogout={handleLogout} currentPage={currentPage} onNavigate={setCurrentPage} />

      <main className="flex-1 w-full">
        {currentPage === 'generate' && (
          <div className="max-w-7xl mx-auto px-8 py-16">
            <ChatBot user={user} />
          </div>
        )}
        {currentPage === 'recipes' && <SavedRecipes />}
        {currentPage === 'about' && <About />}
      </main>
      
      <Footer />
    </div>
  )
}
