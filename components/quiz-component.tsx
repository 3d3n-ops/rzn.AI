// QuizComponent.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabase"; // Assuming you named your Supabase client file as 'supabase.js'

const QuizComponent = () => {
  const [quizData, setQuizData] = useState([]);

  useEffect(() => {
    async function fetchQuizData() {
      try {
        const { data, error } = await supabase.from("quiz_data").select("*");
        if (error) {
          throw error;
        }
        setQuizData(data);
      } catch (error) {
        console.error("Error fetching quiz data:", error.message);
      }
    }

    fetchQuizData();
  }, []);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState(
    Array(quizData.length).fill(null)
  );

  const handleAnswerSelect = (answerIndex) => {
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

  const renderAnswers = (answers, questionIndex) => {
    return answers.map((answer, index) => (
      <div key={index}>
        <input
          type="radio"
          id={`answer_${index}`}
          name={`question_${questionIndex}`}
          checked={userAnswers[questionIndex] === index}
          onChange={() => handleAnswerSelect(index)}
        />
        <label htmlFor={`answer_${index}`}>{answer}</label>
      </div>
    ));
  };

  const renderQuiz = () => {
    if (currentQuestion >= quizData.length) {
      return (
        <div>
          <h2>Quiz Completed!</h2>
          <p>
            Your Score: {calculateScore()} / {quizData.length}
          </p>
        </div>
      );
    }

    const currentQuizQuestion = quizData[currentQuestion];

    return (
      <div>
        <h2>{currentQuizQuestion.text}</h2>
        <p>{currentQuizQuestion.equation}</p>
        <form>
          {renderAnswers(currentQuizQuestion.answers, currentQuestion)}
        </form>
        <button onClick={handleNextQuestion}>Next Question</button>
      </div>
    );
  };

  return (
    <div>
      <h1>Quiz Component</h1>
      {renderQuiz()}
    </div>
  );
};

export default QuizComponent;
