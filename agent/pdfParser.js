const { PDFParse } = require('pdf-parse')

const extractText = async (buffer) => {
    try {
        const pdf = new PDFParse({ data: buffer })
        const result = await pdf.getText()
        return result.text
    } catch (error) {
        throw new Error('Failed to parse PDF: ' + error.message)
    }
}

module.exports = { extractText }
