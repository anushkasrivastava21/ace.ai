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

module.exports = { generate }