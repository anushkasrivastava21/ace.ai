const buildGenerationPrompt = (chunks, config, strategy = 'material_only', pyqChunks = []) => {
    const { type, difficulty, count } = config

    const context = chunks.map((c, i) => `[Chunk ${i + 1}]\n${c.text}`).join('\n\n')

    let formatInstructions = ''
    let example = ''

    if (type === 'mcq') {
        formatInstructions = `Each question must have:
- "question": the question text
- "options": an array of EXACTLY 4 distinct answer choices
- "answer": the correct option (must be copied exactly from one of the 4 options)

IMPORTANT: Every question MUST have exactly 4 options. The correct answer MUST appear as one of the 4 options.`

        example = `[
  { "question": "What is X?", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": "Option B" }
]`
    } else if (type === 'short') {
        formatInstructions = `Each question must have:
- "question": the question text
- "answer": a brief 1-2 sentence model answer`

        example = `[
  { "question": "What is X?", "answer": "X is..." }
]`
    } else if (type === 'long') {
        formatInstructions = `Each question must have:
- "question": the question text
- "answer": a detailed model answer (3-5 sentences)`

        example = `[
  { "question": "Explain X.", "answer": "X is a concept that..." }
]`
    } else if (type === 'auto') {
        formatInstructions = `Decide the question types yourself based on the previous year paper's pattern. Use a mix of MCQ, short answer, and long answer as appropriate.
For MCQ questions, include:
- "question": the question text
- "options": an array of EXACTLY 4 distinct answer choices
- "answer": the correct option (must be copied exactly from one of the 4 options)

For short/long answer questions, include:
- "question": the question text
- "answer": the model answer`

        example = `[
  { "question": "What is X?", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": "Option B" },
  { "question": "Explain Y.", "answer": "Y is..." }
]`
    }

    // Build strategy-specific instructions
    let strategyBlock = ''

    if (strategy === 'follow_pattern' && pyqChunks.length > 0) {
        const pyqContext = pyqChunks.map((c, i) => `[PYQ ${i + 1}]\n${c.text}`).join('\n\n')

        strategyBlock = `
PREVIOUS YEAR PAPER (for reference):
${pyqContext}

STRATEGY: Analyze the structure, format, and style of the previous year paper above. Generate NEW questions that follow the SAME pattern — similar question types, similar phrasing style, similar difficulty distribution. Do NOT copy questions directly; create new ones from the study material that match the paper's format.`
    } else if (strategy === 'similar_questions' && pyqChunks.length > 0) {
        const pyqContext = pyqChunks.map((c, i) => `[PYQ ${i + 1}]\n${c.text}`).join('\n\n')

        strategyBlock = `
PREVIOUS YEAR PAPER (for reference):
${pyqContext}

STRATEGY: Use the previous year paper above as inspiration. Generate NEW questions that cover similar topics and test similar concepts at a similar difficulty level, but with different wording and angles. Do NOT copy questions directly.`
    }

    return `You are an exam paper generator. Based ONLY on the study material context below, generate ${count} ${difficulty} difficulty ${type === 'auto' ? '' : type} questions.

STUDY MATERIAL:
${context}
${strategyBlock}

${formatInstructions}

Respond with ONLY a valid JSON array, no other text, no markdown formatting, no code blocks. Example format:
${example}

Generate exactly ${count} questions now:`
}

const buildReviewPrompt = (question, correctAnswer, userAnswer) => {
    return `You are an exam evaluator. Compare the student's answer to the correct answer and grade it.

QUESTION: ${question}

CORRECT ANSWER: ${correctAnswer}

STUDENT'S ANSWER: ${userAnswer || '(no answer provided)'}

Evaluate the student's answer on a scale of 0-10 based on accuracy and completeness compared to the correct answer.

Respond with ONLY a valid JSON object, no other text, no markdown. Example format:
{ "score": 7, "feedback": "Good understanding of the core concept, but missed mentioning..." }

Respond now:`
}

module.exports = { buildGenerationPrompt, buildReviewPrompt }