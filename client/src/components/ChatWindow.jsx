import { useState, useRef, useEffect } from 'react'
import MessageBubble from './MessageBubble'

function ChatWindow({ messages, onSendMessage, isLoading, phase }) {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [inputText, setInputText] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)
  const transcriptRef = useRef('')
  const finalTranscriptRef = useRef('')

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Update refs when transcript changes
  useEffect(() => {
    transcriptRef.current = transcript
  }, [transcript])

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (SpeechRecognition) {
      setIsSupported(true)
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        setIsRecording(true)
        setTranscript('')
        transcriptRef.current = ''
        finalTranscriptRef.current = ''
      }

      recognition.onresult = (event) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' '
          } else {
            interimTranscript += transcript
          }
        }

        if (finalTranscript) {
          finalTranscriptRef.current += finalTranscript
          setTranscript(prev => prev + finalTranscript)
        } else {
          setTranscript(prev => {
            // Remove previous interim results and add new ones
            const base = finalTranscriptRef.current
            return base + interimTranscript
          })
        }
      }

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        if (event.error === 'no-speech') {
          // User didn't speak, just stop recording
          recognition.stop()
        } else if (event.error !== 'aborted') {
          alert(`Speech recognition error: ${event.error}. Please try again.`)
          recognition.stop()
        }
      }

      recognition.onend = () => {
        setIsRecording(false)
        const finalText = finalTranscriptRef.current.trim()
        if (finalText) {
          onSendMessage(finalText)
        }
        setTranscript('')
        transcriptRef.current = ''
        finalTranscriptRef.current = ''
      }

      recognitionRef.current = recognition
    } else {
      setIsSupported(false)
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [onSendMessage])

  const startRecording = () => {
    if (recognitionRef.current && !isRecording && !isLoading && phase !== 'final_feedback') {
      try {
        recognitionRef.current.start()
      } catch (error) {
        console.error('Error starting recognition:', error)
      }
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop()
    }
  }

  const handleTextSubmit = (e) => {
    e.preventDefault()
    if (inputText.trim() && !isLoading && phase !== 'final_feedback') {
      onSendMessage(inputText.trim())
      setInputText('')
    }
  }

  return (
    <div className="flex flex-col h-[600px]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <p className="text-lg mb-2">👋 Welcome!</p>
              <p>Configure your role and experience, then click "Start Interview" to begin.</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <MessageBubble key={index} message={message} />
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2 max-w-xs">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */} 
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        {phase === 'final_feedback' ? (
          <div className="text-center text-gray-500 text-sm py-2">
            Interview completed. You can start a new interview to practice again.
          </div>
        ) : phase === 'idle' ? (
          <div className="text-center text-gray-500 text-sm py-2">
            Click "Start Interview" to begin.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Transcript Display (only shown when recording) */}
            {transcript && (
              <div className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 min-h-[40px]">
                {transcript || 'Listening...'}
              </div>
            )}

            {/* Input Options: Text Input and Microphone */}
            <div className="flex gap-2 items-end">
              {/* Text Input */}
              <form onSubmit={handleTextSubmit} className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your answer here..."
                  disabled={isLoading || phase === 'final_feedback' || isRecording}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isLoading || phase === 'final_feedback' || isRecording}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </form>

              {/* Microphone Button */}
              {isSupported ? (
                <div className="flex items-center gap-2">
                  {isRecording ? (
                    <button
                      onClick={stopRecording}
                      disabled={isLoading}
                      className="flex items-center justify-center w-14 h-14 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg relative"
                      title="Stop Recording"
                    >
                      <div className="absolute inset-0 rounded-full bg-red-600 animate-ping opacity-75"></div>
                      <svg className="w-6 h-6 relative z-10" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012 0v4a1 1 0 11-2 0V7zM12 9a1 1 0 10-2 0v2a1 1 0 102 0V9z" clipRule="evenodd" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      onClick={startRecording}
                      disabled={isLoading || phase === 'final_feedback'}
                      className="flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg"
                      title="Start Voice Recording"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-xs text-gray-500 px-2">
                  Voice not supported
                </div>
              )}
            </div>

            {/* Recording Status */}
            {isRecording && (
              <div className="text-center text-sm text-red-600 font-medium">
                🎤 Recording... Speak your answer
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatWindow


