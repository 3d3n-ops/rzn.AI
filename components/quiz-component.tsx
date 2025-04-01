'use client';

import React, { useState, useEffect } from "react";

interface QuizQuestion {
  id: string;
  text: string;
  equation: string;
  answers: string[];
  correctAnswer: number;
}

const QuizComponent = () => {
  const [quizData, setQuizData] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuizData() {
      try {
        const response = await fetch('/api/quiz');
        if (!response.ok) {
          throw new Error('Failed to fetch quiz data');
        }
        const data = await response.json();
        setQuizData(data);
        setUserAnswers(Array(data.length).fill(null));
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setIsLoading(false);
      }
    }

    fetchQuizData();
  }, []);

  const handleAnswerSelect = (answerIndex: number) => {
    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentQuestion] = answerIndex;
    setUserAnswers(updatedAnswers);
  };

  const handleNextQuestion = () => {
    setCurrentQuestion(currentQuestion + 1);
  };

  const calculateScore = () => {
    let score = 0;
    userAnswers.forEach((answerIndex, questionIndex) => {
      if (answerIndex === quizData[questionIndex].correctAnswer) {
        score++;
      }
    });
    return score;
  };

  const renderAnswers = (answers: string[], questionIndex: number) => {
    return answers.map((answer: string, index: number) => (
      <div key={index} className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
        <input
          type="radio"
          id={`answer_${index}`}
          name={`question_${questionIndex}`}
          checked={userAnswers[questionIndex] === index}
          onChange={() => handleAnswerSelect(index)}
          className="h-4 w-4 text-blue-600"
        />
        <label htmlFor={`answer_${index}`} className="cursor-pointer">
          {answer}
        </label>
      </div>
    ));
  };

  if (isLoading) {
    return <div className="text-center p-4">Loading quiz...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  }

  if (quizData.length === 0) {
    return <div className="text-center p-4">No quiz questions available.</div>;
  }

  const renderQuiz = () => {
    if (currentQuestion >= quizData.length) {
      return (
        <div className="text-center p-4">
          <h2 className="text-2xl font-bold mb-4">Quiz Completed!</h2>
          <p className="text-xl">
            Your Score: {calculateScore()} / {quizData.length}
          </p>
        </div>
      );
    }

    const currentQuizQuestion = quizData[currentQuestion];

    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{currentQuizQuestion.text}</h2>
        <p className="text-gray-600 dark:text-gray-300">{currentQuizQuestion.equation}</p>
        <form className="space-y-2">
          {renderAnswers(currentQuizQuestion.answers, currentQuestion)}
        </form>
        <button 
          onClick={handleNextQuestion}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Next Question
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Quiz</h1>
      {renderQuiz()}
    </div>
  );
};

export default QuizComponent;
