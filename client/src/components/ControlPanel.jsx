function ControlPanel({
  role,
  experienceYears,
  onRoleChange,
  onExperienceChange,
  onStartInterview,
  onEndInterview,
  phase,
  isLoading,
}) {
  return (
    <div className="bg-gray-50 border-b border-gray-200 p-6">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Role
          </label>
          <input
            type="text"
            value={role}
            onChange={(e) => onRoleChange(e.target.value)}
            disabled={phase !== 'idle'}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="e.g., Frontend Developer"
          />
        </div>

        <div className="w-full md:w-32">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Experience (Years)
          </label>
          <input
            type="number"
            value={experienceYears}
            onChange={(e) => onExperienceChange(parseInt(e.target.value) || 0)}
            disabled={phase !== 'idle'}
            min="0"
            max="50"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onStartInterview}
            disabled={phase !== 'idle' || isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400"
          >
            Start Interview
          </button>

          <button
            onClick={onEndInterview}
            disabled={phase === 'idle' || phase === 'final_feedback' || isLoading}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400"
          >
            End & Feedback
          </button>
        </div>
      </div>

      {phase !== 'idle' && (
        <div className="mt-4 text-sm text-gray-600">
          <span className="font-medium">Status:</span>{' '}
          <span className="capitalize">{phase.replace('_', ' ')}</span>
        </div>
      )}
    </div>
  )
}

export default ControlPanel




