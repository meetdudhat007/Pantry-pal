import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'

const API_BASE = 'http://localhost:4000/api'

export default function AIChatBot() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Hi! I\'m Pantry Pal AI. I can help you with recipes, cooking tips, nutrition advice, and more! You can type your message or use the microphone button to speak to me.'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [error, setError] = useState('')
  const chatEndRef = useRef(null)
  const recognitionRef = useRef(null)

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onstart = () => {
        setIsListening(true)
        setError('')
      }

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
        setIsListening(false)
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setError(`Speech recognition error: ${event.error}`)
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    } else {
      console.warn('Speech recognition not supported')
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Text-to-speech function
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 1.0
      
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      
      window.speechSynthesis.speak(utterance)
    }
  }

  // Stop speaking
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  // Start listening
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start()
      } catch (err) {
        console.error('Failed to start recognition:', err)
        setError('Failed to start voice recognition. Please try again.')
      }
    }
  }

  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }

  // Send message
  const sendMessage = async (messageText = input) => {
    if (!messageText.trim() || loading) return

    const userMessage = messageText.trim()
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setInput('')
    setLoading(true)
    setError('')

    try {
      const response = await axios.post(`${API_BASE}/chat`, {
        message: userMessage
      })

      const aiResponse = response.data.response
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }])
      
      // Auto-speak the response
      speakText(aiResponse)
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to get response. Please try again.'
      setError(`❌ ${errorMsg}`)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-3xl">
            🤖
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Pantry Pal AI</h1>
            <p className="text-gray-600">Your intelligent cooking assistant with voice support</p>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Messages */}
        <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-5 py-3 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 rounded-2xl px-5 py-3">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-6 py-3 bg-red-50 border-t border-red-100">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Input Area */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="flex gap-3">
            {/* Text Input */}
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message or click the mic to speak..."
                className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                rows="2"
                disabled={loading || isListening}
              />
              {isListening && (
                <div className="absolute right-3 top-3 flex items-center gap-2">
                  <span className="text-red-500 text-sm font-medium">Listening...</span>
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>

            {/* Voice Input Button */}
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={loading}
              className={`px-5 rounded-xl font-semibold transition-all duration-200 ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? '🛑' : '🎤'}
            </button>

            {/* Send Button */}
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim() || isListening}
              className="px-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳' : '📤'}
            </button>

            {/* Speaker Button */}
            <button
              onClick={isSpeaking ? stopSpeaking : () => speakText(messages[messages.length - 1]?.content)}
              disabled={loading || messages.length < 2 || messages[messages.length - 1]?.role === 'user'}
              className={`px-5 rounded-xl font-semibold transition-all duration-200 ${
                isSpeaking
                  ? 'bg-orange-500 hover:bg-orange-600 text-white'
                  : 'bg-purple-500 hover:bg-purple-600 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={isSpeaking ? 'Stop speaking' : 'Repeat last response'}
            >
              {isSpeaking ? '🔇' : '🔊'}
            </button>
          </div>

          {/* Browser Support Info */}
          {!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) && (
            <p className="mt-3 text-sm text-yellow-600">
              ⚠️ Voice input not supported in your browser. Please use Chrome, Edge, or Safari.
            </p>
          )}
        </div>
      </div>

      {/* Features Info */}
      <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-3">✨ Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-start gap-2">
            <span>💬</span>
            <p><strong>Text Chat:</strong> Type your questions and get instant responses</p>
          </div>
          <div className="flex items-start gap-2">
            <span>🎤</span>
            <p><strong>Voice Input:</strong> Click the mic and speak your question</p>
          </div>
          <div className="flex items-start gap-2">
            <span>🔊</span>
            <p><strong>Voice Output:</strong> AI responses are automatically spoken aloud</p>
          </div>
          <div className="flex items-start gap-2">
            <span>🍳</span>
            <p><strong>Cooking Help:</strong> Get recipes, tips, and nutrition advice</p>
          </div>
        </div>
      </div>
    </div>
  )
}
