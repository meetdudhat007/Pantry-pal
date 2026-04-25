import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'

const API_BASE = 'http://localhost:4000/api'

export default function ChatBot({ user }) {
  const [generatedRecipe, setGeneratedRecipe] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [input, setInput] = useState('')
  const [chatInput, setChatInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [chatLoading, setChatLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedDiet, setSelectedDiet] = useState('Any')
  const [isListening, setIsListening] = useState(false)
  const [isChatListening, setIsChatListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const chatEndRef = useRef(null)
  const recognitionRef = useRef(null)
  const chatRecognitionRef = useRef(null)

  // Initialize speech recognition for ingredients input
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      
      // Recognition for ingredients input
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onstart = () => setIsListening(true)
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
        setIsListening(false)
      }
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setError(`Voice error: ${event.error}`)
        setIsListening(false)
      }
      recognitionRef.current.onend = () => setIsListening(false)

      // Recognition for chat input
      chatRecognitionRef.current = new SpeechRecognition()
      chatRecognitionRef.current.continuous = false
      chatRecognitionRef.current.interimResults = false
      chatRecognitionRef.current.lang = 'en-US'

      chatRecognitionRef.current.onstart = () => setIsChatListening(true)
      chatRecognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setChatInput(transcript)
        setIsChatListening(false)
      }
      chatRecognitionRef.current.onerror = (event) => {
        console.error('Chat speech recognition error:', event.error)
        setError(`Voice error: ${event.error}`)
        setIsChatListening(false)
      }
      chatRecognitionRef.current.onend = () => setIsChatListening(false)
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop()
      if (chatRecognitionRef.current) chatRecognitionRef.current.stop()
    }
  }, [])

  useEffect(() => {
    if (chatMessages.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages])

  // Text-to-speech function
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
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

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  // Start/stop listening for ingredients
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
    } else {
      try {
        recognitionRef.current?.start()
      } catch (err) {
        console.error('Failed to start recognition:', err)
        setError('Failed to start voice recognition')
      }
    }
  }

  // Start/stop listening for chat
  const toggleChatListening = () => {
    if (isChatListening) {
      chatRecognitionRef.current?.stop()
    } else {
      try {
        chatRecognitionRef.current?.start()
      } catch (err) {
        console.error('Failed to start chat recognition:', err)
        setError('Failed to start voice recognition')
      }
    }
  }

  useEffect(() => {
    if (chatMessages.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages])

  // Generate recipe
  const generateRecipe = async () => {
    setError('')

    if (!input.trim()) {
      setError('⚠️ Please enter some ingredients')
      return
    }

    if (!user) {
      setError('⚠️ Please login to generate recipes')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${API_BASE}/generate-recipe`,
        { ingredients: input, diet: selectedDiet },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setGeneratedRecipe(response.data.recipe)
      setChatMessages([])
      setInput('')
      setError('')
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to generate recipe. Please try again.'
      
      // Handle auth errors specifically
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError(`❌ ${errorMsg}. Please logout and login again.`)
      } else {
        setError(`❌ ${errorMsg}`)
      }
      console.error('Generate recipe error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Chat about recipe
  const sendChatMessage = async () => {
    if (!chatInput.trim() || !generatedRecipe) return

    setChatMessages(prev => [...prev, { role: 'user', content: chatInput }])
    setChatInput('')
    setChatLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${API_BASE}/recipe-chat`,
        {
          generatedRecipeId: generatedRecipe._id,
          message: chatInput
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const message = response.data.message
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: message.content
      }])

      // Speak the AI response
      speakText(message.content)

      // Update recipe if modified
      if (response.data.updatedRecipe) {
        setGeneratedRecipe(prev => ({
          ...prev,
          ...response.data.updatedRecipe
        }))
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to send message'
      
      // Handle auth errors specifically
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError(`❌ ${errorMsg}. Please logout and login again.`)
      } else {
        setError(`❌ ${errorMsg}`)
      }
      console.error('Chat error:', err)
    } finally {
      setChatLoading(false)
    }
  }

  const handleDietClick = (selectedDiet) => {
    setSelectedDiet(selectedDiet)
    window.dispatchEvent(new CustomEvent('dietChange', { detail: selectedDiet }))
  }

  const resetRecipe = () => {
    setGeneratedRecipe(null)
    setChatMessages([])
    setInput('')
    setChatInput('')
    setError('')
  }

  return (
    <section className="mb-16">
      <h2 className="text-5xl font-extrabold leading-tight mb-6">
        Cook Smart 🍳 <br />
        With <span className="text-green-600">AI Suggestions</span>
      </h2>

      <p className="text-gray-600 text-lg mb-8">
        Enter ingredients you have and get instant, healthy recipe ideas.
      </p>

      <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
        {/* Error/Warning Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm font-medium flex items-start gap-3">
            <span className="text-lg">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Recipe Display */}
        {generatedRecipe && (
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-bold text-lg">{generatedRecipe.name}</h4>
              <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full font-semibold">✨ AI Generated</span>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
              <div className="bg-white rounded p-3">
                <span className="text-gray-600 block text-xs font-semibold">⏱️ Time</span>
                <span className="font-bold text-green-700">{generatedRecipe.time}</span>
              </div>
              <div className="bg-white rounded p-3">
                <span className="text-gray-600 block text-xs font-semibold">📊 Level</span>
                <span className="font-bold text-green-700">{generatedRecipe.level}</span>
              </div>
              <div className="bg-white rounded p-3">
                <span className="text-gray-600 block text-xs font-semibold">🍽️ Diet</span>
                <span className="font-bold text-green-700">{generatedRecipe.diet}</span>
              </div>
            </div>

            <div className="text-sm">
              <p className="font-bold mb-2 text-green-900">🥘 Ingredients:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 bg-white rounded p-3">
                {generatedRecipe.ingredients?.map((ing, idx) => (
                  <li key={idx}>{ing}</li>
                ))}
              </ul>
            </div>

            <div className="text-sm mt-4">
              <p className="font-bold mb-2 text-green-900">👨‍🍳 Steps:</p>
              <ol className="list-decimal list-inside text-gray-700 space-y-2 bg-white rounded p-3">
                {generatedRecipe.steps?.map((step, idx) => (
                  <li key={idx} className="text-sm">{step}</li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className="space-y-4 min-h-[300px] max-h-[500px] overflow-y-auto border border-gray-200 rounded-2xl p-4 bg-gray-50">
          {!generatedRecipe && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-6xl mb-4">🍳</div>
              <p className="text-gray-600 text-sm font-medium">
                Select a diet type and enter your ingredients<br />
                to generate a delicious recipe!
              </p>
            </div>
          )}

          {generatedRecipe && chatMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-5xl mb-3">💬</div>
              <p className="text-gray-600 text-sm font-medium">
                Ask questions about the recipe<br />
                or request modifications!
              </p>
              <p className="text-gray-500 text-xs mt-3 italic">
                e.g., "change tomato to onion", "make it vegan"
              </p>
            </div>
          )}

          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
            >
              <div
                className={`px-5 py-3 rounded-2xl text-sm max-w-md shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white'
                    : 'bg-gradient-to-r from-green-50 to-green-100 text-gray-800 border border-green-200'
                }`}
              >
                <div className="whitespace-pre-wrap break-words">{msg.content}</div>
              </div>
            </div>
          ))}

          {chatLoading && (
            <div className="flex justify-start animate-fadeIn">
              <div className="bg-gradient-to-r from-green-50 to-green-100 text-gray-800 px-5 py-3 rounded-2xl text-sm flex items-center gap-2 border border-green-200 shadow-sm">
                <span className="animate-spin">⏳</span> 
                <span className="font-medium">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Section */}
        {!generatedRecipe ? (
          <>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700">Select Diet Type</label>
                {selectedDiet !== 'Any' && <span className="text-green-600 text-xs font-bold">✓ Selected: {selectedDiet}</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                {['Any', 'Veg', 'Vegan', 'Keto', 'Protein'].map(d => (
                  <button
                    key={d}
                    onClick={() => handleDietClick(d)}
                    type="button"
                    className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                      selectedDiet === d
                        ? 'bg-green-600 text-white shadow-lg scale-105 ring-2 ring-green-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                    }`}
                  >
                    {d === 'Any' && '🍴'} {d === 'Veg' && '🥗'} {d === 'Vegan' && '🌱'} {d === 'Keto' && '🥩'} {d === 'Protein' && '💪'} {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Ingredients Input */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700">Enter Ingredients *</label>
              <div className="flex gap-3 items-center flex-wrap">
                <div className="flex-1 relative min-w-[200px]">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value)
                      setError('')
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        generateRecipe()
                      }
                    }}
                    placeholder="e.g. eggs, paneer, onion, tomato..."
                    className="w-full px-6 py-4 rounded-full border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-400 outline-none text-sm transition"
                    disabled={isListening || loading}
                  />
                  {isListening && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <span className="text-red-500 text-xs font-medium">Listening...</span>
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>

                <button
                  onClick={toggleListening}
                  disabled={loading}
                  className={`px-5 py-4 rounded-full font-semibold transition-all ${
                    isListening
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={isListening ? 'Stop listening' : 'Start voice input'}
                >
                  {isListening ? '🛑' : '🎤'}
                </button>

                <button
                  onClick={generateRecipe}
                  type="button"
                  disabled={loading || isListening}
                  className={`px-6 py-4 rounded-full font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                    loading || isListening
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-600 text-white hover:shadow-lg active:scale-95'
                  }`}
                >
                  {loading ? (
                    <>
                      <span className="animate-spin">⏳</span> Generating...
                    </>
                  ) : (
                    <>
                      <span>Generate</span> 🍳
                    </>
                  )}
                </button>
              </div>
              {!loading && !isListening && <p className="text-xs text-gray-500 text-center">💡 Example: "eggs, tomato, cheese" or click 🎤 to speak</p>}
              {!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) && (
                <p className="text-xs text-yellow-600 text-center">⚠️ Voice input not supported. Use Chrome/Edge/Safari for voice features.</p>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-3 items-center flex-wrap">
              <div className="flex-1 relative min-w-[200px]">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => {
                    setChatInput(e.target.value)
                    setError('')
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && chatInput.trim()) {
                      e.preventDefault()
                      sendChatMessage()
                    }
                  }}
                  placeholder="Ask about recipe or request changes..."
                  className="w-full px-6 py-4 rounded-full border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-400 outline-none text-sm transition"
                  disabled={isChatListening || chatLoading}
                />
                {isChatListening && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <span className="text-red-500 text-xs font-medium">Listening...</span>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>

              <button
                onClick={toggleChatListening}
                disabled={chatLoading}
                className={`px-5 py-4 rounded-full font-semibold transition-all ${
                  isChatListening
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={isChatListening ? 'Stop listening' : 'Start voice input'}
              >
                {isChatListening ? '🛑' : '🎤'}
              </button>

              <button
                onClick={sendChatMessage}
                type="button"
                disabled={chatLoading || !chatInput.trim() || isChatListening}
                className={`px-6 py-4 rounded-full font-semibold whitespace-nowrap transition-all ${
                  chatLoading || !chatInput.trim() || isChatListening
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 text-white hover:shadow-lg active:scale-95'
                }`}
              >
                {chatLoading ? '⏳ Thinking...' : 'Chat 💬'}
              </button>

              <button
                onClick={isSpeaking ? stopSpeaking : () => speakText(chatMessages[chatMessages.length - 1]?.content)}
                disabled={chatLoading || chatMessages.length === 0 || chatMessages[chatMessages.length - 1]?.role === 'user'}
                className={`px-5 py-4 rounded-full font-semibold transition-all ${
                  isSpeaking
                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={isSpeaking ? 'Stop speaking' : 'Repeat last response'}
              >
                {isSpeaking ? '🔇' : '🔊'}
              </button>

              <button
                onClick={resetRecipe}
                type="button"
                className="px-6 py-4 rounded-full font-semibold whitespace-nowrap bg-gray-500 hover:bg-gray-600 text-white transition-all hover:shadow-lg active:scale-95"
              >
                New Recipe ✨
              </button>
            </div>
            <p className="text-xs text-gray-500">💡 Tip: Click 🎤 to speak or type "change tomato to onion" or "make it spicy"</p>
          </div>
        )}
      </div>
    </section>
  )
}
