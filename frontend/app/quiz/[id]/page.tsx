'use client'

import { useParams } from 'next/navigation'

export default function QuizPage() {
  const { id } = useParams()

  // This would typically come from an API or database
  const quizData = {
    "intro-quiz": { title: "Quiz: Introduction to Python", questions: 5 },
    "variables-quiz": { title: "Quiz: Variables and Data Types", questions: 7 },
    "control-quiz": { title: "Quiz: Control Flow", questions: 6 },
    "functions-quiz": { title: "Quiz: Functions", questions: 8 },
  }

  const quiz = quizData[id as keyof typeof quizData]

  if (!quiz) {
    return <div>Quiz not found</div>
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">{quiz.title}</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <p className="text-lg mb-4">This quiz contains {quiz.questions} questions.</p>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Answer all questions to the best of your ability. Good luck!</p>
        <button className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors">
          Start Quiz
        </button>
      </div>
    </div>
  )
}
