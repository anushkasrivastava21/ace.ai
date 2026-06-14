const generate = async (prompt) => {
    try {
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama3.2',
                prompt: prompt,
                stream: false
            })
        })

        const data = await response.json()
        return data.response
    } catch (error) {
        console.error('LLM Error:', error.message)
        throw new Error('Failed to generate response from AI')
    }
}

// Parses JSON from LLM response, handling common formatting issues
const parseJSONResponse = (text) => {
    let cleaned = text.trim()
    cleaned = cleaned.replace(/```json\s*/g, '').replace(/```\s*/g, '')

    const start = cleaned.indexOf('[')
    const end = cleaned.lastIndexOf(']')

    if (start === -1 || end === -1) {
        throw new Error('No JSON array found in LLM response')
    }

    const jsonString = cleaned.substring(start, end + 1)
    return JSON.parse(jsonString)
}

// Parses a single JSON object from LLM response
const parseJSONObject = (text) => {
    let cleaned = text.trim()
    cleaned = cleaned.replace(/```json\s*/g, '').replace(/```\s*/g, '')

    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')

    if (start === -1 || end === -1) {
        throw new Error('No JSON object found in LLM response')
    }

    const jsonString = cleaned.substring(start, end + 1)
    return JSON.parse(jsonString)
}

module.exports = { generate, parseJSONResponse, parseJSONObject }