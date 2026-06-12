const { generate } = require('./llm')

const test = async () => {
    console.log('Asking Ollama...')
    const answer = await generate('What is bubble sort? Explain in 2 sentences.')
    console.log('Answer:', answer)
}

test()