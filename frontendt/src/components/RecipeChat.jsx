import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'

const API_BASE = 'http://localhost:4000/api'

export default function RecipeChat({ recipe }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentRecipe, setCurrentRecipe] = useState(recipe)
  const chatEndRef = useRef(null)

  useEffect(() => {
    if (recipe) {
      setCurrentRecipe(recipe)
      loadChatMessages()
    }
  }, [recipe])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadChatMessages = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${API_BASE}/recipe-chat/${recipe._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMessages(response.data.messages || [])
    } catch (err) {
      console.error('Failed to load chat messages:', err)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || !recipe) return

    setError('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${API_BASE}/recipe-chat`,
        {
          generatedRecipeId: recipe._id,
          message: input
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const newMessage = response.data.message
      setMessages(prev => [...prev, newMessage])

      // If recipe was modified, update it
      if (response.data.updatedRecipe) {
        setCurrentRecipe(prev => ({
          ...prev,
          ...response.data.updatedRecipe
        }))
      }

      setInput('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  if (!recipe) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
        <p className="text-gray-600">Generate a recipe first to chat about it</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8">
      <h3 className="text-2xl font-bold mb-6">Recipe Chat 💬</h3>

      {/* Current Recipe Display */}
      <div className="bg-green-50 rounded-lg p-4 mb-6 border border-green-200">
        <h4 className="font-bold text-lg mb-3">{currentRecipe.name}</h4>
        
        <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
          <div>
            <span className="text-gray-600">Time: </span>
            <span className="font-medium">{currentRecipe.time}</span>
          </div>
          <div>
            <span className="text-gray-600">Level: </span>
            <span className="font-medium">{currentRecipe.level}</span>
          </div>
          <div>
            <span className="text-gray-600">Diet: </span>
            <span className="font-medium">{currentRecipe.diet}</span>
          </div>
        </div>

        <div className="text-sm">
          <p className="font-medium mb-2">Ingredients:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {currentRecipe.ingredients?.map((ing, idx) => (
              <li key={idx}>{ing}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="border border-gray-200 rounded-lg p-4 mb-4 max-h-[400px] overflow-y-auto bg-gray-50">
        {messages.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-8">
            Ask questions about the recipe or request modifications
          </p>
        )}
        
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`px-4 py-2 rounded-lg max-w-xs text-sm ${
                msg.role === 'user'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-900'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg text-sm">
              Thinking...
            </div>
          </div>
        )}
        
        <div ref={chatEndRef} />
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about recipe or request changes..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
        >
          Send
        </button>
      </form>

      <p className="text-xs text-gray-500 mt-2">
        💡 Tip: Ask to "change", "modify", or "replace" ingredients/steps
      </p>
    </div>
  )
}
