const buildGenerationPrompt = (chunks, config) => {
    const { type, difficulty, count } = config

    const context = chunks.map((c, i) => `[Chunk ${i + 1}]\n${c.text}`).join('\n\n')

    let formatInstructions = ''

    if (type === 'mcq') {
        formatInstructions = `Each question must have:
- "question": the question text
- "options": an array of exactly 4 strings
- "answer": the correct option (must match one of the options exactly)`
    } else if (type === 'short') {
        formatInstructions = `Each question must have:
- "question": the question text
- "answer": a brief 1-2 sentence model answer`
    } else {
        formatInstructions = `Each question must have:
- "question": the question text
- "answer": a detailed model answer (3-5 sentences)`
    }

    return `You are an exam paper generator. Based ONLY on the context below, generate ${count} ${difficulty} difficulty ${type} questions.

CONTEXT:
${context}

${formatInstructions}

Respond with ONLY a valid JSON array, no other text, no markdown formatting, no code blocks. Example format:
[
  { "question": "...", "answer": "..." }
]

Generate exactly ${count} questions now:`
}

module.exports = { buildGenerationPrompt }

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