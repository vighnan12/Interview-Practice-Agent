function MessageBubble({ message }) {
  const isUser = message.from === 'user'
  const isFeedback = message.rating !== undefined

  // Parse feedback sections if it's a feedback message
  const renderFeedback = (text) => {
    if (!isFeedback) return text

    const sections = text.split(/=== (.+?) ===/g)
    const result = []

    for (let i = 0; i < sections.length; i++) {
      if (i % 2 === 1) {
        // This is a section header
        const sectionName = sections[i].trim()
        const sectionColor = getSectionColor(sectionName)
        result.push(
          <h3 key={`header-${i}`} className={`font-bold text-lg mt-4 mb-2 ${sectionColor}`}>
            {sectionName}
          </h3>
        )
      } else if (sections[i].trim()) {
        // This is section content
        result.push(
          <p key={`content-${i}`} className="mb-3 whitespace-pre-wrap">
            {sections[i].trim()}
          </p>
        )
      }
    }

    return result.length > 0 ? result : text
  }

  const getSectionColor = (sectionName) => {
    const name = sectionName.toUpperCase()
    if (name.includes('OVERALL') || name.includes('PERFORMANCE')) {
      return 'text-blue-600'
    } else if (name.includes('STRENGTH')) {
      return 'text-green-600'
    } else if (name.includes('IMPROVEMENT') || name.includes('AREA')) {
      return 'text-orange-600'
    } else if (name.includes('COMMUNICATION') || name.includes('CLARITY')) {
      return 'text-purple-600'
    } else if (name.includes('TECHNICAL') || name.includes('KNOWLEDGE')) {
      return 'text-indigo-600'
    } else if (name.includes('PRACTICE') || name.includes('SUGGESTION')) {
      return 'text-teal-600'
    }
    return 'text-gray-700'
  }

  const getRatingColor = (rating) => {
    if (rating >= 8) return 'text-green-600'
    if (rating >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 ${
          isUser
            ? 'bg-blue-600 text-white'
            : isFeedback
            ? 'bg-white border-2 border-gray-200 shadow-md'
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        {isFeedback && message.rating && (
          <div className="mb-3 pb-3 border-b border-gray-300">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">Overall Rating:</span>
              <span className={`text-2xl font-bold ${getRatingColor(message.rating)}`}>
                {message.rating}/10
              </span>
            </div>
          </div>
        )}
        <div className={isFeedback ? 'text-gray-800' : ''}>
          {isFeedback ? renderFeedback(message.text) : <p className="whitespace-pre-wrap break-words">{message.text}</p>}
        </div>
      </div>
    </div>
  )
}

export default MessageBubble

