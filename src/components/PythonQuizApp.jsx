import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MonacoEditor from './ResizableMonacoEditor'; 
import queryString from 'query-string';
import { useAuth0 } from '@auth0/auth0-react';

const PythonQuizApp = () => {
  const { loginWithPopup, loginWithRedirect, logout, user, isAuthenticated, getAccessTokenSilently } = useAuth0();

  const [quizData, setQuizData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userCode, setUserCode] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [score, setScore] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [userOutput, setUserOutput] = useState(''); // Add state to store user output

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
          'https://emkc.org/api/v2/piston/execute',
          {
            language: 'python',
            version: '3.10',
            files: [
              {
                name: 'main.py',
                content: fullCode
              }
            ]
          },
          { headers: { 'Content-Type': 'application/json' } }
        );
        
        let userOutput = response.data.run.output;
        userOutput = userOutput.trim();
  
        if (userOutput !== testCase.expected_output) {
          setUserOutput(userOutput); // Update user output state
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
      setUserOutput('');
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

  if (!quizData) return <div className='animate-ping w-full h-screen flex items-center justify-center text-7xl font-thin'>STARTING....</div>;

  const currentQuestion = quizData.questions[currentQuestionIndex];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <nav className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 flex justify-between items-center shadow-md`}>
        <h1 className="text-2xl font-bold">Python Quiz</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm">Score: {score}</span>
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors duration-200`}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>
      <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
        {/* Left side: Question List and Details */}
        <div className="w-full lg:w-1/2 flex flex-col overflow-hidden">
          {/* Question List */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} p-4 overflow-x-auto`}>
            <div className="flex items-center space-x-4 mb-2">
              <h3 className="text-lg font-bold">Questions</h3>
              <button 
                onClick={toggleSolution} 
                className={`text-sm px-3 py-1 rounded ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'}`}
              >
                {showSolution ? 'Hide Solution' : 'Show Solution'}
              </button>
            </div>
            <ul className="flex space-x-2">
              {quizData.questions.map((question, index) => (
                <li
                  key={index}
                  className={`cursor-pointer py-2 px-4 rounded transition-colors duration-200 ${
                    index === currentQuestionIndex 
                      ? 'bg-blue-500 text-white' 
                      : isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600' 
                        : 'bg-gray-300 hover:bg-gray-400'
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
              <ul className="space-y-2">
                {currentQuestion.test_cases.map((testCase, index) => (
                  <li key={index} className={`p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <strong>Input:</strong> <code className="text-sm">{testCase.input}</code> <br />
                    <strong>Expected Output:</strong> <code className="text-sm">{testCase.expected_output}</code>
                  </li>
                ))}
              </ul>
            </div>
            {showSolution && (
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 mb-4 shadow-md`}>
                <h3 className="text-lg font-bold mb-2">Solution</h3>
                <pre className={`p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <code>{currentQuestion.solution}</code>
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Right side: Code Editor and Results */}
        <div className={`w-full lg:w-1/2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} p-4 flex flex-col`}>
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-white'} rounded-t-lg p-2 flex justify-between items-center`}>
            <span className="font-semibold">Python</span>
            <div className="flex space-x-2">
              <button
                className={`px-3 py-1 rounded text-white ${isSubmitting ? 'bg-gray-500' : 'bg-blue-500 hover:bg-blue-600'} focus:outline-none transition-colors duration-200`}
                onClick={handleRunCode}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Running...' : 'Run Code'}
              </button>
              <button 
                onClick={handleSubmitQuiz}
                className="px-3 py-1 rounded text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors duration-200"
              >
                Submit Quiz
              </button>
            </div>
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
          <div className={`mt-4 ${isDarkMode ? 'bg-gray-700' : 'bg-white'} rounded p-4 flex-grow overflow-y-auto`}>
            {showFeedback && (
              <div className={`p-2 rounded mb-2 ${feedback.includes('All test cases passed') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {feedback}
              </div>
            )}
            {userOutput && (
              <div>
                <h3 className="text-lg font-bold mb-2">Your Output:</h3>
                <pre className={`p-2 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                  <code>{userOutput}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PythonQuizApp;