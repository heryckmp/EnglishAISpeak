import { EnglishLevel } from "./english-training";

export function createWritingAnalysisPrompt(text: string, level: EnglishLevel) {
  return `As an English writing instructor, analyze the following text written by a ${level} level student. 
Provide a detailed analysis including:

1. Grammar and Structure (score out of 100)
2. Vocabulary Usage (score out of 100)
3. Coherence and Flow (score out of 100)
4. Overall Score (average of above)

Also provide:
- Specific corrections for any errors found
- Suggestions for improvement
- Positive feedback on what was done well

Text to analyze:
${text}

Format your response as JSON with the following structure:
{
  "grammarScore": number,
  "vocabularyScore": number,
  "coherenceScore": number,
  "overallScore": number,
  "corrections": [
    {
      "original": "incorrect text",
      "suggestion": "corrected text",
      "explanation": "why this correction is needed"
    }
  ],
  "suggestions": [
    {
      "category": "grammar/vocabulary/style",
      "text": "suggestion for improvement"
    }
  ],
  "feedback": "positive feedback and general comments"
}`;
}

export function createWritingPromptSuggestion(topic: string, level: EnglishLevel) {
  return `As an English writing instructor, create a writing prompt for a ${level} level student on the topic of "${topic}".
The prompt should:
1. Be appropriate for their level
2. Encourage creative thinking
3. Practice relevant grammar and vocabulary
4. Include a clear writing goal or objective
5. Suggest a word count range

Format your response as a clear, encouraging prompt that motivates the student to write.`;
}

export function createWritingFeedback(text: string, level: EnglishLevel) {
  return `As an English writing instructor, provide constructive feedback for the following text written by a ${level} level student.
Focus on:
1. What they did well
2. Areas for improvement
3. Specific suggestions for making the text better
4. Encouragement for future writing

Text:
${text}

Provide your feedback in a clear, encouraging manner that motivates the student to keep improving.`;
} 