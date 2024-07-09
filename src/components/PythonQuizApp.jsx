import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MonacoEditor from './ResizableMonacoEditor';
import queryString from 'query-string';
import {useAuth0} from '@auth0/auth0-react'

const PythonQuizApp = () => {

  const {loginWithPopup, loginWithRedirect, logout, user, isAuthenticated, getAccessTokenSilently} = useAuth0();
  
  const [quizData, setQuizData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userCode, setUserCode] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [score, setScore] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const parsed = queryString.parse(window.location.search);
  const userID = parsed.userID;
  const quizID = parsed.quizID;

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const response = await axios.get(`https://server.datasenseai.com/python-quiz/${quizID}/${userID}`);
        setQuizData(response.data);
        setUserCode(response.data.questions[currentQuestionIndex].boilerplate_code || '');
      } catch (error) {
        console.error('Error fetching quiz data:', error);
      }
    };

    fetchQuizData();
  }, [quizID, userID, currentQuestionIndex]);

  const checkAllTestCases = async (userCode, testCases) => {
    for (let testCase of testCases) {
      const fullCode = `${userCode}\nprint(${testCase.input})`;
      try {
        const response = await axios.post(
          'https://server.datasenseai.com/execute-python',
          { pyCode: fullCode },
          { headers: { 'Content-Type': 'application/json' } }
        );
        let userOutput = response.data;
        if (typeof userOutput !== 'string') {
          userOutput = userOutput.toString().trim();
        } else {
          userOutput = userOutput.trim();
        }

        if (userOutput !== testCase.expected_output) {
          return false;
        }
      } catch (error) {
        console.error('Error executing test case:', error);
        return false;
      }
    }
    return true;
  };

  const handleRunCode = async () => {
    setShowFeedback(false);
    setFeedback('Running test cases...');
    setIsSubmitting(true);

    const currentQuestion = quizData.questions[currentQuestionIndex];
    const allTestCasesPassed = await checkAllTestCases(userCode, currentQuestion.test_cases);

    if (allTestCasesPassed) {
      setFeedback('All test cases passed!');
      setScore(score + 1);
    } else {
      setFeedback('Some test cases failed.');
    }

    setShowFeedback(true);
    setIsSubmitting(false);
  };

  const handleQuestionSelect = (index) => {
    setCurrentQuestionIndex(index);
    setUserCode(quizData.questions[index].boilerplate_code || '');
    setFeedback('');
    setShowFeedback(false);
    setShowSolution(false);
  };

  const handleSubmitQuiz = () => {
    window.location.href = '/?userID=' + userID;
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleSolution = () => {
    setShowSolution(!showSolution);
  };

  if (!quizData) return <div className='animate-bounce w-full h-screen flex items-center justify-center text-7xl font-bold'>STARTING....</div>;

  const currentQuestion = quizData.questions[currentQuestionIndex];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <nav className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} p-4 flex justify-between items-center`}>
        <h1 className="text-xl font-bold">Python Quiz</h1>
        <button
          onClick={toggleDarkMode}
          className={`px-4 py-2 rounded-full ${isDarkMode ? 'bg-white text-black' : 'bg-gray-800 text-white'}`}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </nav>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left side: Question List and Details */}
        <div className="w-1/2 flex flex-col overflow-hidden">
          {/* Question List */}
          <div className={`flex gap-10 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} p-4 h-1/8 overflow-y-auto`}>
            <h3 className="text-lg font-bold mb-4">Question</h3>
            <h3 className="text-lg font-bold mb-4 cursor-pointer" onClick={toggleSolution}>Solution</h3>
            <ul className="flex">
              {quizData.questions.map((question, index) => (
                <li
                  key={index}
                  className={`cursor-pointer py-2 px-4 rounded ${
                    index === currentQuestionIndex 
                      ? 'bg-blue-500 text-white' 
                      : isDarkMode 
                        ? 'hover:bg-gray-700' 
                        : 'hover:bg-gray-300'
                  }`}
                  onClick={() => handleQuestionSelect(index)}
                >
                  {index + 1}
                </li>
              ))}
            </ul>
          </div>

          {/* Question Details */}
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 flex-grow overflow-y-auto`}>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 mb-4 shadow-md`}>
              <h3 className="text-xl font-bold mb-2">{currentQuestion.question_text}</h3>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 mb-4 shadow-md`}>
              <h3 className="text-lg font-bold mb-2">Test Cases</h3>
              <ul>
                {currentQuestion.test_cases.map((testCase, index) => (
                  <li key={index} className="mb-2">
                    <strong>Input:</strong> {testCase.input} <br />
                    <strong>Expected Output:</strong> {testCase.expected_output}
                  </li>
                ))}
              </ul>
            </div>
            {showSolution && (
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 mb-4 shadow-md`}>
                <h3 className="text-lg font-bold mb-2">Solution</h3>
                <pre>{currentQuestion.solution}</pre>
              </div>
            )}
          </div>
        </div>

        {/* Right side: Code Editor and Results */}
        <div className={`w-1/2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} p-4 flex flex-col`}>
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-white'} rounded-t-lg p-2`}>
            <span className="font-semibold">Python</span>
          </div>
          <MonacoEditor
            width="100%"
            height="400"
            language="python"
            theme={isDarkMode ? "vs-dark" : "light"}
            value={userCode}
            onChange={setUserCode}
            options={{ fontSize: 16 }}
          />
          <div className="flex mt-2 space-x-2">
            <button
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none"
              onClick={handleRunCode}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Running...' : 'Run Code'}
            </button>
            <button 
              onClick={handleSubmitQuiz} 
              className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            >
              Submit
            </button>
          </div>
          <div className={`mt-4 ${isDarkMode ? 'bg-gray-700' : 'bg-white'} rounded p-4 flex-grow overflow-y-auto`}>
            {showFeedback && (
               <p className={feedback.includes('All test cases passed') ? 'text-green-500' : 'text-red-500'}>
               {feedback}
             </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PythonQuizApp;