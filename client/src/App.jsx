import { useState } from 'react'
import ChatWindow from './components/ChatWindow'
import ControlPanel from './components/ControlPanel'
import IDEPanel from './components/IDEPanel'
import Home from './components/Home'

function App() {
  const [showHome, setShowHome] = useState(true)
  const [messages, setMessages] = useState([])
  const [phase, setPhase] = useState('idle')
  const [role, setRole] = useState('Frontend Developer')
  const [experienceYears, setExperienceYears] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('chat') // 'chat' or 'coding'

  const handleGetStarted = () => {
    setShowHome(false)
  }

  const handleStartInterview = async () => {
    setMessages([])
    setPhase('idle')
    setIsLoading(true)

    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phase: 'idle',
          role,
          experienceYears,
          history: [],
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      const data = await response.json()
      setMessages([{ 
        from: 'bot', 
        text: data.reply,
        rating: data.rating 
      }])
      setPhase(data.phase)
    } catch (error) {
      console.error('Error starting interview:', error)
      let errorMessage = 'Sorry, there was an error starting the interview. Please check your API key and try again.'
      
      if (error.message.includes('quota') || error.message.includes('billing')) {
        errorMessage = 'Your OpenAI API key has exceeded its quota or billing is not set up. Please check your OpenAI account billing and add credits.'
      } else if (error.message.includes('API key') || error.message.includes('model')) {
        errorMessage = error.message
      }
      
      setMessages([{ from: 'bot', text: errorMessage }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleEndInterview = async () => {
    if (phase === 'idle' || messages.length === 0) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phase: 'final_feedback',
          role,
          experienceYears,
          history: messages,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      const data = await response.json()
      setMessages((prev) => [...prev, { 
        from: 'bot', 
        text: data.reply,
        rating: data.rating 
      }])
      setPhase(data.phase)
    } catch (error) {
      console.error('Error getting feedback:', error)
      let errorMessage = 'Sorry, there was an error generating feedback.'
      if (error.message) {
        errorMessage = `Error: ${error.message}`
      }
      setMessages((prev) => [...prev, { from: 'bot', text: errorMessage }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async (text) => {
    if (!text.trim() || isLoading) return

    const newMessage = { from: 'user', text: text.trim() }
    const updatedMessages = [...messages, newMessage]
    setMessages(updatedMessages)
    setIsLoading(true)

    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phase,
          role,
          experienceYears,
          history: updatedMessages,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      const data = await response.json()
      setMessages((prev) => [...prev, { 
        from: 'bot', 
        text: data.reply,
        rating: data.rating 
      }])
      setPhase(data.phase)
    } catch (error) {
      console.error('Error sending message:', error)
      let errorMessage = 'Sorry, there was an error. Please try again.'
      
      if (error.message.includes('quota') || error.message.includes('billing')) {
        errorMessage = 'Your OpenAI API key has exceeded its quota or billing is not set up. Please check your OpenAI account billing and add credits.'
      } else if (error.message.includes('API key') || error.message.includes('model')) {
        errorMessage = error.message
      }
      
      setMessages((prev) => [...prev, { from: 'bot', text: errorMessage }])
    } finally {
      setIsLoading(false)
    }
  }

  if (showHome) {
    return <Home onGetStarted={handleGetStarted} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Interview Practice Partner
            </h1>
            <p className="text-gray-600">
              Practice your interview skills with AI-powered mock interviews
            </p>
          </div>
          <button
            onClick={() => setShowHome(true)}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <ControlPanel
            role={role}
            experienceYears={experienceYears}
            onRoleChange={setRole}
            onExperienceChange={setExperienceYears}
            onStartInterview={handleStartInterview}
            onEndInterview={handleEndInterview}
            phase={phase}
            isLoading={isLoading}
          />

          {/* Tabs */}
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="flex">
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-6 py-3 font-medium text-sm transition-colors ${
                  activeTab === 'chat'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                💬 Chat
              </button>
              <button
                onClick={() => setActiveTab('coding')}
                className={`px-6 py-3 font-medium text-sm transition-colors ${
                  activeTab === 'coding'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                💻 Coding
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'chat' ? (
            <ChatWindow
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              phase={phase}
            />
          ) : (
            <IDEPanel />
          )}
        </div>
      </div>
    </div>
  )
}

export default App

