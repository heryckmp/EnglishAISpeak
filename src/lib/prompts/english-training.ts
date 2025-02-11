export const ENGLISH_LEVELS = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
} as const;

export type EnglishLevel = keyof typeof ENGLISH_LEVELS;

export function createSystemPrompt(level: EnglishLevel = "intermediate") {
  const levelInstructions = {
    beginner: `
      - Use simple vocabulary and basic grammar structures
      - Speak slowly and clearly
      - Use short sentences and common expressions
      - Explain any potentially unfamiliar words
      - Be very patient and encouraging
    `,
    intermediate: `
      - Use moderate vocabulary and varied grammar structures
      - Maintain a natural conversational pace
      - Introduce some idiomatic expressions
      - Correct major grammar mistakes politely
      - Encourage more complex responses
    `,
    advanced: `
      - Use rich vocabulary and complex grammar structures
      - Speak at a natural native pace
      - Use sophisticated idiomatic expressions
      - Provide subtle corrections and refinements
      - Challenge the student with complex topics
    `,
  };

  return `You are a professional English teacher and conversation partner.
Your goal is to help the student practice and improve their English through natural conversation.

Level-specific instructions:
${levelInstructions[level]}

General guidelines:
- Maintain a friendly and encouraging tone
- Keep the conversation flowing naturally
- Provide corrections when appropriate for the level
- Ask follow-up questions to encourage deeper discussion
- Share relevant cultural insights when appropriate
- Adapt your language to match the student's proficiency level
`;
}

export function createConversationContext(topic: string, level: EnglishLevel = "intermediate") {
  return `Let's have a conversation about ${topic}. I'll adjust my language to your ${ENGLISH_LEVELS[level]} level. Feel free to ask questions and share your thoughts!`;
}

export function createWritingPrompt(topic: string, level: EnglishLevel = "intermediate") {
  return `Write about ${topic}. I'll provide feedback appropriate for your ${ENGLISH_LEVELS[level]} level.`;
}

export function createCorrectionPrompt(text: string, level: EnglishLevel = "intermediate") {
  return `Please review this text and provide corrections appropriate for a ${ENGLISH_LEVELS[level]} level student:

${text}

Please provide:
1. Corrected version
2. Explanation of major errors
3. Suggestions for improvement
4. Positive feedback on what was done well`;
}

export function createPronunciationPrompt(word: string) {
  return `Please help me pronounce the word "${word}" correctly. Include:
1. Phonetic transcription
2. Syllable breakdown
3. Common pronunciation mistakes to avoid
4. Example sentences using the word`;
}

export function createVocabularyPrompt(context: string, level: EnglishLevel = "intermediate") {
  return `Based on this context: "${context}"
Please suggest relevant vocabulary appropriate for a ${ENGLISH_LEVELS[level]} level student.
Include:
1. Key words and phrases
2. Definitions
3. Example sentences
4. Collocations or common expressions`;
} 