import { useState, useEffect } from 'react'
import Editor from '@monaco-editor/react'

function IDEPanel() {
  const [selectedLanguage, setSelectedLanguage] = useState('python')
  const [code, setCode] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState(null)
  const [showResults, setShowResults] = useState(false)

  const getDefaultCode = (lang) => {
    const defaults = {
      python: '# Write your Python code here\nprint("Hello, World!")',
      java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
      cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}',
      c: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
      javascript: '// Write your JavaScript code here\nconsole.log("Hello, World!");',
      typescript: '// Write your TypeScript code here\nconsole.log("Hello, World!");',
      sql: '-- Write your SQL queries here\nSELECT * FROM users;',
      html: '<!DOCTYPE html>\n<html>\n<head>\n    <title>Hello World</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>',
      css: '/* Write your CSS here */\nbody {\n    font-family: Arial, sans-serif;\n}',
      json: '{\n    "key": "value"\n}',
      xml: '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n    <item>Hello, World!</item>\n</root>',
      go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}',
      rust: 'fn main() {\n    println!("Hello, World!");\n}',
      php: '<?php\n    echo "Hello, World!";\n?>',
      ruby: 'puts "Hello, World!"',
    }
    return defaults[lang] || ''
  }

  // Initialize code with default Python code on mount
  useEffect(() => {
    setCode(getDefaultCode(selectedLanguage))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const languages = [
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'c', label: 'C' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'sql', label: 'SQL' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'json', label: 'JSON' },
    { value: 'xml', label: 'XML' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
  ]

  const handleLanguageChange = (e) => {
    const newLang = e.target.value
    setSelectedLanguage(newLang)
    setCode(getDefaultCode(newLang))
  }

  const handleEditorChange = (value) => {
    setCode(value || '')
    // Clear validation results when code changes
    if (validationResult) {
      setValidationResult(null)
      setShowResults(false)
    }
  }

  const handleValidateCode = async () => {
    if (!code.trim()) {
      alert('Please write some code before validating.')
      return
    }

    setIsValidating(true)
    setValidationResult(null)
    setShowResults(true)

    try {
      const response = await fetch('/api/validate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          language: selectedLanguage,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      const data = await response.json()
      setValidationResult(data)
    } catch (error) {
      console.error('Error validating code:', error)
      setValidationResult({
        isValid: false,
        rating: 0,
        summary: `Error: ${error.message}`,
        syntaxCheck: 'Validation failed',
        logicCheck: 'Validation failed',
        bestPractices: 'Validation failed',
        issues: [error.message],
        suggestions: ['Please check your connection and try again'],
      })
    } finally {
      setIsValidating(false)
    }
  }

  const getRatingColor = (rating) => {
    if (rating >= 8) return 'text-green-500'
    if (rating >= 6) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <div className="flex flex-col h-[600px] bg-gray-900">
      {/* IDE Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-300">Language:</label>
          <select
            value={selectedLanguage}
            onChange={handleLanguageChange}
            className="px-3 py-1.5 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleValidateCode}
            disabled={isValidating || !code.trim()}
            className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed disabled:hover:bg-gray-600 flex items-center gap-2"
          >
            {isValidating ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Validating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Validate Code
              </>
            )}
          </button>
          <span className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-400">IDE</span>
        </div>
      </div>

      {/* Code Editor and Validation Results */}
      <div className="flex-1 overflow-hidden flex">
        {/* Code Editor */}
        <div className={`${showResults && validationResult ? 'w-1/2' : 'w-full'} transition-all duration-300 border-r ${showResults && validationResult ? 'border-gray-700' : 'border-transparent'}`}>
          <Editor
            height="100%"
            language={selectedLanguage}
            value={code || getDefaultCode(selectedLanguage)}
            onChange={handleEditorChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              readOnly: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
            }}
          />
        </div>

        {/* Validation Results Panel */}
        {showResults && validationResult && (
          <div className="w-1/2 bg-gray-800 overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Validation Results</h3>
              <button
                onClick={() => setShowResults(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Rating and Status */}
            <div className="mb-4 p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">Status:</span>
                <span className={`font-semibold ${validationResult.isValid ? 'text-green-400' : 'text-red-400'}`}>
                  {validationResult.isValid ? '✓ Valid' : '✗ Issues Found'}
                </span>
              </div>
              {validationResult.rating !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Rating:</span>
                  <span className={`text-xl font-bold ${getRatingColor(validationResult.rating)}`}>
                    {validationResult.rating}/10
                  </span>
                </div>
              )}
            </div>

            {/* Syntax Check */}
            {validationResult.syntaxCheck && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-blue-400 mb-2">Syntax Check</h4>
                <p className="text-sm text-gray-300 bg-gray-700 p-2 rounded">{validationResult.syntaxCheck}</p>
              </div>
            )}

            {/* Logic Check */}
            {validationResult.logicCheck && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-purple-400 mb-2">Logic Check</h4>
                <p className="text-sm text-gray-300 bg-gray-700 p-2 rounded">{validationResult.logicCheck}</p>
              </div>
            )}

            {/* Best Practices */}
            {validationResult.bestPractices && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-yellow-400 mb-2">Best Practices</h4>
                <p className="text-sm text-gray-300 bg-gray-700 p-2 rounded">{validationResult.bestPractices}</p>
              </div>
            )}

            {/* Issues */}
            {validationResult.issues && validationResult.issues.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-red-400 mb-2">Issues Found</h4>
                <ul className="list-disc list-inside text-sm text-gray-300 bg-gray-700 p-2 rounded space-y-1">
                  {validationResult.issues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            {validationResult.suggestions && validationResult.suggestions.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-green-400 mb-2">Suggestions</h4>
                <ul className="list-disc list-inside text-sm text-gray-300 bg-gray-700 p-2 rounded space-y-1">
                  {validationResult.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Summary */}
            {validationResult.summary && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-white mb-2">Summary</h4>
                <p className="text-sm text-gray-300 bg-gray-700 p-2 rounded">{validationResult.summary}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* IDE Footer */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-2 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-4">
          <span>Lines: {code.split('\n').length}</span>
          <span>Characters: {code.length}</span>
        </div>
        <div className="text-gray-500">
          {selectedLanguage.toUpperCase()} • Ready
        </div>
      </div>
    </div>
  )
}

export default IDEPanel

