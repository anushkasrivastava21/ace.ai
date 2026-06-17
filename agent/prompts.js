const buildGenerationPrompt = (chunks, config, strategy = 'material_only', pyqChunks = []) => {
    const { type, difficulty, count, mode, typeCounts } = config

    const context = chunks.map((c, i) => `[Chunk ${i + 1}]\n${c.text}`).join('\n\n')

    let formatInstructions = ''
    let example = ''
    let countInstruction = ''

    // Mixed mode: multiple question types in one paper
    if (mode === 'mixed' && typeCounts) {
        const parts = []
        if (typeCounts.mcq > 0) parts.push(`${typeCounts.mcq} MCQ`)
        if (typeCounts.short > 0) parts.push(`${typeCounts.short} short answer`)
        if (typeCounts.long > 0) parts.push(`${typeCounts.long} long answer`)

        const totalCount = (typeCounts.mcq || 0) + (typeCounts.short || 0) + (typeCounts.long || 0)
        countInstruction = `Generate exactly ${totalCount} questions: ${parts.join(' + ')}.`

        formatInstructions = `Each question MUST include a "type" field: "mcq", "short", or "long".

For MCQ questions:
- "type": "mcq"
- "question": the question text
- "options": an array of EXACTLY 4 distinct answer choices
- "answer": the correct option (must be copied exactly from one of the 4 options)

For short answer questions:
- "type": "short"
- "question": the question text
- "answer": a brief 1-2 sentence model answer

For long answer questions:
- "type": "long"
- "question": the question text
- "answer": a detailed model answer (3-5 sentences)`

        example = `[
  { "type": "mcq", "question": "What is X?", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": "Option B" },
  { "type": "short", "question": "Define Y.", "answer": "Y is..." },
  { "type": "long", "question": "Explain Z in detail.", "answer": "Z is a concept that..." }
]`

        // Single mode or auto
    } else {
        countInstruction = `Generate exactly ${count} questions.`

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
Each question MUST include a "type" field: "mcq", "short", or "long".

For MCQ questions, include:
- "type": "mcq"
- "question": the question text
- "options": an array of EXACTLY 4 distinct answer choices
- "answer": the correct option (must be copied exactly from one of the 4 options)

For short/long answer questions, include:
- "type": "short" or "type": "long"
- "question": the question text
- "answer": the model answer`

            example = `[
  { "type": "mcq", "question": "What is X?", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": "Option B" },
  { "type": "short", "question": "Explain Y.", "answer": "Y is..." }
]`
        }
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

    } else if (strategy === 'avoid_questions' && pyqChunks.length > 0) {
        const pyqContext = pyqChunks.map((c, i) => `[PYQ ${i + 1}]\n${c.text}`).join('\n\n')

        strategyBlock = `
PREVIOUS YEAR PAPER (do NOT repeat these):
${pyqContext}

STRATEGY: The questions above have already appeared in previous exams. Do NOT generate any questions that are similar to, overlap with, or test the same specific concepts as these previous questions. Instead, create entirely NEW questions from the study material that cover DIFFERENT topics, angles, and concepts not already tested above.`
    }

    const typeLabel = mode === 'mixed' ? '' : (type === 'auto' ? '' : type)

    return `You are an exam paper generator. Based ONLY on the study material context below, generate ${difficulty} difficulty questions.

STUDY MATERIAL:
${context}
${strategyBlock}

${countInstruction}

${formatInstructions}

Respond with ONLY a valid JSON array, no other text, no markdown formatting, no code blocks. Example format:
${example}

Generate the questions now:`
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