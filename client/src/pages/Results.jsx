import { useExam } from '../context/ExamContext'

const Results = () => {
    const { attempts } = useExam()

    if (attempts.length === 0) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h1>Results</h1>
                <p>No attempts yet. Take an exam first!</p>
            </div>
        )
    }

    const latestAttempt = attempts[attempts.length - 1]

    return (
        <div style={{ padding: '20px', maxWidth: '600px' }}>
            <h1>Your Results</h1>

            <div style={{ border: '1px solid white', padding: '20px', marginBottom: '20px', textAlign: 'center' }}>
                <h2>Total Score</h2>
                <h1>{latestAttempt.totalScore || 0}</h1>
                <p>Paper ID: {latestAttempt.paperId}</p>
            </div>

            <h2>Question Review</h2>
            {latestAttempt.answers?.map((answer, index) => (
                <div key={index} style={{ border: '1px solid white', padding: '15px', margin: '10px 0' }}>
                    <p><strong>Question {index + 1}</strong></p>
                    <p>Your Answer: {answer.userAnswer || 'No answer given'}</p>
                    <p>Score: {answer.score || 0}</p>
                    <p>Feedback: {answer.feedback || 'Awaiting AI review (Stage 6)'}</p>
                </div>
            ))}
        </div>
    )
}

export default Results