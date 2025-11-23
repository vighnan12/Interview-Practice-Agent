import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY?.trim(),
});

// Log configuration (without exposing full API key)
if (!process.env.GROQ_API_KEY) {
  console.error('ERROR: GROQ_API_KEY is not set in environment variables');
  console.error('Get your free API key at: https://console.groq.com/keys');
} else {
  console.log('Groq API Key configured:', process.env.GROQ_API_KEY.substring(0, 10) + '...');
  console.log('Groq Model:', process.env.GROQ_MODEL || 'llama-3.1-8b-instant');
}

const SYSTEM_PROMPT = `You are an AI Interview Practice Partner.

Your job is to:
- Conduct mock interviews for a specific job role.
- Ask ONE question at a time.
- Read the conversation history and ask relevant follow-ups.
- Stop asking questions when phase is "final_feedback".
- Produce structured, helpful feedback at the end.

=== PHASE RULES ===

1) idle phase:
   - Greet candidate briefly.
   - Ask what role + experience they have (if not known).
   - Move phase to in_progress.
   - Ask the FIRST interview question (intro/background).

2) in_progress phase:
   - Ask ONE question per response.
   - Use conversation history to make smarter follow-ups.
   - Mix question types:
       intro / background / project / technical / behavioral
   - No explanations, no long paragraphs.
   - Just ask the next question.

3) final_feedback phase:
   - DO NOT ask questions.
   - DO NOT ask for more information.
   - Provide comprehensive structured feedback based on the entire conversation history.
   - Your feedback MUST include:
       - Overall performance assessment
       - Key strengths demonstrated
       - Areas that need improvement
       - Communication and clarity evaluation
       - Technical / role-specific knowledge assessment
       - Specific suggestions for practice
   - Provide an overall rating from 1 to 10 (where 10 is excellent).
   - Format your feedback with clear section headings using this format:
       "=== OVERALL PERFORMANCE ===
        [content]
        
        === STRENGTHS ===
        [content]
        
        === AREAS FOR IMPROVEMENT ===
        [content]
        
        === COMMUNICATION & CLARITY ===
        [content]
        
        === TECHNICAL KNOWLEDGE ===
        [content]
        
        === PRACTICE SUGGESTIONS ===
        [content]"
   - Make the feedback constructive and actionable.
   - Set expect_candidate_answer = false.
   - Set question_type = "feedback".
   - Set phase = "final_feedback".

=== OUTPUT FORMAT (MANDATORY JSON) ===

Always respond with ONLY this strict JSON format:

{
  "reply": "<text to show in chat>",
  "phase": "idle" | "in_progress" | "final_feedback",
  "question_type": "intro" | "background" | "project" | "technical" | "behavioral" | "closing" | "feedback",
  "expect_candidate_answer": true | false,
  "rating": <number 1-10> (only for feedback phase)
}

Never include extra text, markdown, or commentary outside the JSON.

Examples:

Intro:
{
  "reply": "Hi, great to meet you! Let's begin. Could you introduce yourself and explain why you're interested in the Frontend Developer role?",
  "phase": "in_progress",
  "question_type": "intro",
  "expect_candidate_answer": true
}

Technical:
{
  "reply": "Earlier you mentioned React Hooks. Can you explain the difference between useState and useEffect?",
  "phase": "in_progress",
  "question_type": "technical",
  "expect_candidate_answer": true
}

Feedback:
{
  "reply": "=== OVERALL PERFORMANCE ===\n[detailed feedback with sections]\n\n=== STRENGTHS ===\n[content]\n\n=== AREAS FOR IMPROVEMENT ===\n[content]\n\n=== COMMUNICATION & CLARITY ===\n[content]\n\n=== TECHNICAL KNOWLEDGE ===\n[content]\n\n=== PRACTICE SUGGESTIONS ===\n[content]",
  "phase": "final_feedback",
  "question_type": "feedback",
  "expect_candidate_answer": false,
  "rating": 7
}`;

app.post('/api/interview', async (req, res) => {
  try {
    const { phase, role, experienceYears, history } = req.body;

    if (!role || experienceYears === undefined) {
      return res.status(400).json({ error: 'role and experienceYears are required' });
    }

    // Build messages array for Groq
    const messages = [
      {
        role: 'system',
        content: `${SYSTEM_PROMPT}\n\nCurrent interview context:\n- Role: ${role}\n- Experience: ${experienceYears} years\n- Current phase: ${phase}`,
      },
    ];

    // Convert history to Groq format
    history.forEach((msg) => {
      messages.push({
        role: msg.from === 'user' ? 'user' : 'assistant',
        content: msg.text,
      });
    });

    // Add instruction to return JSON
    // For final_feedback phase, emphasize feedback generation
    if (phase === 'final_feedback') {
      messages.push({
        role: 'user',
        content: 'IMPORTANT: You are now in final_feedback phase. Generate comprehensive interview feedback based on the entire conversation. Provide detailed, structured feedback with clear section headings (=== SECTION NAME ===). Include an overall rating from 1-10. Format feedback with sections: OVERALL PERFORMANCE, STRENGTHS, AREAS FOR IMPROVEMENT, COMMUNICATION & CLARITY, TECHNICAL KNOWLEDGE, and PRACTICE SUGGESTIONS. Return ONLY valid JSON in the specified format with question_type="feedback", phase="final_feedback", expect_candidate_answer=false, and rating (number 1-10).',
      });
    } else {
      messages.push({
        role: 'user',
        content: 'Please respond with the JSON format as specified. Only return valid JSON, no additional text.',
      });
    }

    // Call Groq
    const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
    
    // Groq API call - note: some models may not support response_format
    let completion;
    try {
      completion = await groq.chat.completions.create({
        model: model,
        messages: messages,
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });
    } catch (formatError) {
      // If JSON mode fails, try without it and parse manually
      console.log('JSON mode not supported, trying without response_format...');
      completion = await groq.chat.completions.create({
        model: model,
        messages: messages,
        temperature: 0.7,
      });
    }

    let responseData;
    try {
      responseData = JSON.parse(completion.choices[0].message.content);
    } catch (parseError) {
      // Fallback if JSON parsing fails
      const content = completion.choices[0].message.content;
      // Try to extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        responseData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse JSON response from LLM');
      }
    }

    // Validate response structure
    if (!responseData.reply || !responseData.phase || !responseData.question_type) {
      return res.status(500).json({ error: 'Invalid response format from LLM' });
    }

    // For feedback phase, ensure rating is included
    if (phase === 'final_feedback' && !responseData.rating) {
      // If rating is missing, try to extract or set default
      responseData.rating = 5; // Default rating if not provided
    }

    res.json(responseData);
  } catch (error) {
    console.error('Error in /api/interview:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      response: error.response?.data,
      error: error.error
    });
    
    // Extract more detailed error message
    let errorMessage = error.message || 'Internal server error';
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.response?.data?.error?.message) {
      errorMessage = error.response.data.error.message;
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

app.post('/api/validate-code', async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({ error: 'code and language are required' });
    }

    const VALIDATION_PROMPT = `You are an expert code reviewer and validator. Your task is to analyze and validate the provided code.

Code Language: ${language}
Code:
\`\`\`${language}
${code}
\`\`\`

Please provide a comprehensive code validation that includes:
1. Syntax correctness
2. Logic errors (if any)
3. Best practices adherence
4. Potential bugs or issues
5. Code quality assessment
6. Suggestions for improvement (if needed)
7. Overall rating (1-10)

Format your response as JSON with the following structure:
{
  "isValid": true/false,
  "rating": <number 1-10>,
  "syntaxCheck": "<syntax validation result>",
  "logicCheck": "<logic validation result>",
  "bestPractices": "<best practices assessment>",
  "issues": ["<issue1>", "<issue2>", ...],
  "suggestions": ["<suggestion1>", "<suggestion2>", ...],
  "summary": "<overall summary>"
}

Be thorough but concise. If the code is perfect, say so. If there are issues, be specific and helpful.`;

    const messages = [
      {
        role: 'system',
        content: VALIDATION_PROMPT,
      },
      {
        role: 'user',
        content: 'Please analyze and validate this code. Return ONLY valid JSON in the specified format.',
      },
    ];

    const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
    
    let completion;
    try {
      completion = await groq.chat.completions.create({
        model: model,
        messages: messages,
        temperature: 0.3, // Lower temperature for more consistent validation
        response_format: { type: 'json_object' },
      });
    } catch (formatError) {
      console.log('JSON mode not supported, trying without response_format...');
      completion = await groq.chat.completions.create({
        model: model,
        messages: messages,
        temperature: 0.3,
      });
    }

    let responseData;
    try {
      responseData = JSON.parse(completion.choices[0].message.content);
    } catch (parseError) {
      const content = completion.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        responseData = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: create a basic validation response
        responseData = {
          isValid: false,
          rating: 5,
          syntaxCheck: 'Unable to parse AI response',
          logicCheck: 'Unable to parse AI response',
          bestPractices: 'Unable to parse AI response',
          issues: ['Failed to parse validation response'],
          suggestions: ['Please check the code manually'],
          summary: 'Validation service encountered an error. Please review the code manually.',
        };
      }
    }

    // Ensure all required fields exist
    if (!responseData.isValid === undefined) {
      responseData.isValid = responseData.rating >= 7;
    }
    if (!responseData.issues) responseData.issues = [];
    if (!responseData.suggestions) responseData.suggestions = [];

    res.json(responseData);
  } catch (error) {
    console.error('Error in /api/validate-code:', error);
    
    let errorMessage = error.message || 'Internal server error';
    if (error.error?.message) {
      errorMessage = error.error.message;
    }
    
    res.status(500).json({ 
      error: errorMessage,
      isValid: false,
      summary: 'An error occurred during code validation. Please try again.',
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

