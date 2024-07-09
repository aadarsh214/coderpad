import React, { useState, useEffect } from 'react';
import 'tailwindcss/tailwind.css';
import { useAuth0 } from '@auth0/auth0-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import queryString from 'query-string';

const fetchQuestions = async () => {
    const response = await fetch('https://server.datasenseai.com/quizadmin/python-mcq-questions');
    const data = await response.json();
    return data;
};

const Quiz = () => {
    const { loginWithPopup, loginWithRedirect, logout, user, isAuthenticated, getAccessTokenSilently } = useAuth0();

    const parsed = queryString.parse(window.location.search);
    const userID = parsed.userID;
    const quizID = parsed.quizID;

    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [userAnswers, setUserAnswers] = useState([]);
    const [score, setScore] = useState(0);
    const [timer, setTimer] = useState(30);
    const [quizCompleted, setQuizCompleted] = useState(false);

    useEffect(() => {
        // Check if quiz has already been completed for this quizID
        const quizCompletionStatus = localStorage.getItem(`quizCompleted_${quizID}`);
        if (quizCompletionStatus) {
            setQuizCompleted(true);
            showQuizAttemptedPopup();
            return;
        }

        const loadQuestions = async () => {
            const data = await fetchQuestions();
            setQuestions(data);
        };
        loadQuestions();
    }, []);

    useEffect(() => {
        if (questions.length > 0 && !quizCompleted) {
            const timerInterval = setInterval(() => {
                setTimer(prevTimer => {
                    if (prevTimer <= 1) {
                        clearInterval(timerInterval);
                        handleTimeUp();
                        return 30;
                    }
                    return prevTimer - 1;
                });
            }, 1000);
            return () => clearInterval(timerInterval);
        }
    }, [currentQuestionIndex, questions, quizCompleted]);

    const handleTimeUp = () => {
        if (currentQuestionIndex < questions.length - 1) {
            nextQuestion();
        } else {
            submitQuiz();
        }
    };

    const loadQuestion = () => {
        setSelectedOption(null);
        setTimer(30);
    };

    useEffect(() => {
        if (questions.length > 0) {
            loadQuestion();
        }
    }, [currentQuestionIndex, questions]);

    const selectOption = (optionKey) => {
        setSelectedOption(optionKey);
    };

    const prevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
            setSelectedOption(userAnswers[currentQuestionIndex - 1] || null);
        }
    };

    const nextQuestion = () => {
        const newAnswers = [...userAnswers];
        newAnswers[currentQuestionIndex] = selectedOption || null;
        setUserAnswers(newAnswers);

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedOption(userAnswers[currentQuestionIndex + 1] || null);
        }
    };

    const submitQuiz = async () => {
        const newAnswers = [...userAnswers];
        newAnswers[currentQuestionIndex] = selectedOption || null;
        setUserAnswers(newAnswers);

        const calculatedScore = newAnswers.reduce((total, userAnswer, index) => {
            return userAnswer && questions[index].options[userAnswer] === questions[index].answer ? total + 1 : total;
        }, 0);

        setScore(calculatedScore);
        setQuizCompleted(true);

        // Save quiz completion status for this quizID
        localStorage.setItem(`quizCompleted_${quizID}`, true);

        // Show attempt popup
        showQuizAttemptedPopup();

        // Prepare data for the API call
        const userInfo = {
            quizID: quizID,
            userID: `${user.email},  ${user.name}, ${user.phone_number}`,
            score: calculatedScore,
        };

        try {
            const response = await fetch('https://server.datasenseai.com/quizadmin/update-scores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userInfo),
            });

            if (response.ok) {
                console.log('Score updated successfully!');
            } else {
                console.error('Failed to update score:', response.statusText);
            }
        } catch (error) {
            console.error('Error updating score:', error.message);
        }
    };

    const showQuizAttemptedPopup = () => {
        toast.info('You have already attempted this quiz.', {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 3000,
            hideProgressBar: true,
        });
    };

    const resetQuiz = () => {
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setUserAnswers([]);
        setScore(0);
        setTimer(30);
        setQuizCompleted(false);
    };

    if (questions.length === 0) {
        return <div className="h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
    }

    if (quizCompleted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
                    <h1 className="text-3xl font-semibold mb-6 text-gray-800">Quiz Completed</h1>
                    <p className="text-2xl mb-6 text-gray-700">
                        Your Score: <span className="font-semibold">{score}</span> / {questions.length}
                    </p>
                    <div className="mb-6 space-y-4">
                        {questions.map((question, index) => (
                            <div key={index} className="border-b pb-4">
                                <h2 className="text-lg font-medium mb-2 text-gray-800">{question.question}</h2>
                                <p
                                    className={`p-2 rounded ${
                                        userAnswers[index] &&
                                        questions[index].options[userAnswers[index]] === questions[index].answer
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}
                                >
                                    Your answer: {questions[index].options[userAnswers[index]] || 'Not answered'}
                                </p>
                                <p className="p-2 rounded bg-blue-100 text-blue-800 mt-2">
                                    Correct answer: {questions[index].answer}
                                </p>
                            </div>
                        ))}
                    </div>
                    <button
                        className="bg-blue-500 text-white w-full py-2 rounded hover:bg-blue-600 transition duration-300"
                        onClick={resetQuiz}
                    >
                        Restart Quiz
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-sm text-gray-500">
                        Question {currentQuestionIndex + 1} of {questions.length}
                    </span>
                    <span className="text-sm font-semibold text-blue-500">{timer}s</span>
                </div>
                <h1 className="text-2xl font-semibold mb-6 text-gray-800">{questions[currentQuestionIndex].question}</h1>
                <div className="space-y-4 mb-8">
                    {Object.entries(questions[currentQuestionIndex].options).map(([key, value]) => (
                        <div
                            key={key}
                            className={`p-3 rounded border cursor-pointer transition-colors duration-300
                                ${selectedOption === key
                                    ? 'bg-blue-500 text-white border-blue-600'
                                    : 'bg-white text-gray-800 border-gray-300 hover:border-blue-500'
                                }`}
                            onClick={() => selectOption(key)}
                        >
                            {value}
                        </div>
                    ))}
                </div>
                <div className="flex justify-between">
                    {currentQuestionIndex === questions.length - 1 ? (
                        <button
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300"
                            onClick={submitQuiz}
                        >
                            Submit
                        </button>
                    ) : (
                        <button
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
                            onClick={nextQuestion}
                        >
                            Next
                        </button>
                    )}
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default Quiz;
