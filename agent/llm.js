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

// Cleans common LLM JSON mistakes before parsing
const cleanJSON = (text) => {
    let cleaned = text.trim()

    // Remove markdown code fences
    cleaned = cleaned.replace(/```json\s*/g, '').replace(/```\s*/g, '')

    // Remove any text before the first [ or { and after the last ] or }
    const arrayStart = cleaned.indexOf('[')
    const objectStart = cleaned.indexOf('{')
    const arrayEnd = cleaned.lastIndexOf(']')
    const objectEnd = cleaned.lastIndexOf('}')

    // Determine if it's an array or object
    let start, end
    if (arrayStart !== -1 && (objectStart === -1 || arrayStart < objectStart)) {
        start = arrayStart
        end = arrayEnd
    } else {
        start = objectStart
        end = objectEnd
    }

    if (start === -1 || end === -1) return cleaned

    cleaned = cleaned.substring(start, end + 1)

    // Fix trailing commas before } or ]
    cleaned = cleaned.replace(/,\s*([}\]])/g, '$1')

    // Fix unescaped newlines inside strings
    cleaned = cleaned.replace(/(?<=:\s*")([\s\S]*?)(?=")/g, (match) => {
        return match.replace(/\n/g, '\\n').replace(/\r/g, '\\r')
    })

    // Remove control characters (except \n \r \t which are handled above)
    cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')

    return cleaned
}

// Try parsing, and if it fails, attempt progressively aggressive repairs
const robustParse = (text) => {
    const cleaned = cleanJSON(text)

    // Attempt 1: direct parse
    try {
        return JSON.parse(cleaned)
    } catch (e) {
        // continue to repairs
    }

    // Attempt 2: fix truncated JSON — close any open brackets/braces
    try {
        let repaired = cleaned
        const openBrackets = (repaired.match(/\[/g) || []).length
        const closeBrackets = (repaired.match(/\]/g) || []).length
        const openBraces = (repaired.match(/\{/g) || []).length
        const closeBraces = (repaired.match(/\}/g) || []).length

        // Remove trailing partial entry (after last complete object)
        const lastCompleteObj = repaired.lastIndexOf('}')
        if (lastCompleteObj !== -1) {
            // Check if there's junk after the last complete object
            const afterLast = repaired.substring(lastCompleteObj + 1).trim()
            if (afterLast && !afterLast.startsWith(']') && !afterLast.startsWith(',')) {
                repaired = repaired.substring(0, lastCompleteObj + 1)
            }
        }

        // Remove trailing comma
        repaired = repaired.replace(/,\s*$/, '')

        // Close unclosed brackets
        for (let i = 0; i < (openBraces - closeBraces); i++) repaired += '}'
        for (let i = 0; i < (openBrackets - closeBrackets); i++) repaired += ']'

        return JSON.parse(repaired)
    } catch (e) {
        // continue
    }

    // Attempt 3: extract individual objects from broken array
    try {
        const objects = []
        const objectRegex = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g
        let match
        while ((match = objectRegex.exec(cleaned)) !== null) {
            try {
                // Fix trailing commas inside this object
                let obj = match[0].replace(/,\s*([}\]])/g, '$1')
                objects.push(JSON.parse(obj))
            } catch {
                // skip malformed individual object
            }
        }
        if (objects.length > 0) return objects
    } catch {
        // continue
    }

    throw new Error('Could not parse LLM response as JSON after all repair attempts')
}

// Parses JSON array from LLM response
const parseJSONResponse = (text) => {
    const result = robustParse(text)
    // Ensure it's an array
    if (Array.isArray(result)) return result
    // If single object returned, wrap in array
    if (typeof result === 'object' && result !== null) return [result]
    throw new Error('LLM response is not a JSON array or object')
}

// Parses a single JSON object from LLM response
const parseJSONObject = (text) => {
    const result = robustParse(text)
    // If array, return first element
    if (Array.isArray(result)) return result[0]
    if (typeof result === 'object' && result !== null) return result
    throw new Error('LLM response is not a JSON object')
}

module.exports = { generate, parseJSONResponse, parseJSONObject }