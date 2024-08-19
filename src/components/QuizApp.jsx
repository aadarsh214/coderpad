import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MonacoEditor from './ResizableMonacoEditor' // Assuming you have a Monaco Editor wrapper component
import queryString from 'query-string';
import {useAuth0} from '@auth0/auth0-react'
import Split from 'react-split';

const QuizApp = () => {
  const {loginWithPopup, loginWithRedirect, logout, user, isAuthenticated, getAccessTokenSilently} = useAuth0();

  const [quizData, setQuizData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userQuery, setUserQuery] = useState('');
  const [feedback, setFeedback] = useState('');
  const [saveStatus, setSaveStatus] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [buttonText, setButtonText] = useState('Save Results');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isRunning, setIsRunning] = useState(false);

  const parsed = queryString.parse(window.location.search);
  const userID = parsed.userID;
  const quizID = parsed.quizID;
 
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const response = await axios.get(`https://server.datasenseai.com/sql-quiz/${quizID}/${userID}`);
        setQuizData(response.data);
      } catch (error) {
        console.error('Error fetching quiz data:', error);
      }
    };

    fetchQuizData();
  }, []);

  const handleRunCode = async () => {
    setIsRunning(true);
    try {
      const response = await axios.get(`https://server.datasenseai.com/execute-sql/query?q=${encodeURIComponent(userQuery)}`);
      const userAnswer = response.data;
  
      const expectedOutput = quizData.questions[currentQuestionIndex].expected_output;
      const isCorrect = compareResults(userAnswer, expectedOutput);
  
      if (isCorrect) {
        setFeedback({ text: 'Correct!', isCorrect: true, userAnswer: userAnswer });
      } else {
        setFeedback({
          isCorrect: false,
          expected: expectedOutput.map(row => Object.values(row).join(', ')).join(' | '),
          userAnswer: Array.isArray(userAnswer) 
            ? userAnswer.map(row => Object.values(row).join(', ')).join(' | ')
            : 'No data returned'
        });
      }
  
      setShowFeedback(true);
    } catch (error) {
      setFeedback('Your query is incorrect');
      setShowFeedback(true);
    } finally {
      setIsRunning(false);
    }
  };
  
  const compareResults = (userResults, expectedOutput) => {
    if (userResults.length !== expectedOutput.length) {
      return false;
    }
  
    const expectedString = JSON.stringify(expectedOutput.map(row => Object.values(row)));
    const userResultString = JSON.stringify(userResults.map(row => Object.values(row)));

    return userResultString === expectedString;
  };
  
  const handleQuestionSelect = (index) => {
    setCurrentQuestionIndex(index);
    setFeedback('');  
    setShowFeedback(false);
  };

  if (!quizData) return <div className='animate-ping w-full h-screen flex items-center justify-center text-7xl font-thin'>STARTING....</div>;

  const currentQuestion = quizData.questions[currentQuestionIndex];

  const handleSaveResults = async () =>{
    try{
      setButtonText('Submitting...');
      const response = await axios.post('https://server.datasenseai.com/sql-quiz/update-scores',{
        quizID: parsed.quizID,
        userID: parsed.userID,
        score : 1 
      });

      console.log('Results saved successfully:', response.data);
      setSaveStatus('Results saved successfully!');
      setButtonText('Submitted');
      window.location.href = '/?userID=' + userID;
    } catch(error) {
      window.location.href = '/?userID=' + userID;
      console.error('Error saving quiz results:', error);
      setSaveStatus('Failed to save results. Please try again.');
      setButtonText('Submitted');
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#262626] text-white' : 'bg-white text-black'}`}>
      <nav className={`${isDarkMode ? 'bg-[#403f3f]' : 'bg-gray-200'} p-4 flex justify-between items-center`}>
        <h1 className="mb-4 text-xl font-bold">SQL Quiz</h1>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`px-4 py-2 rounded-full ${isDarkMode ? 'bg-white text-black' : 'bg-[#262626] text-white'}`}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </nav>
      <Split
        className="flex h-[calc(100vh-4rem)]"
        sizes={[50, 50]}
        minSize={300}
        expandToMin={false}
        gutterSize={20}
        gutterAlign="center"
        snapOffset={30}
        dragInterval={1}
        direction="horizontal"
        cursor="col-resize"
      >
        {/* Left side: Question List and Details */}
        <div className="flex flex-col overflow-hidden">
          {/* Question List */}
          <div className={`flex gap-10 ${isDarkMode ? 'bg-[#262626]' : 'bg-gray-200'} px-4 h-1/8 relative`}>
            <div className="overflow-x-auto whitespace-nowrap scrollbar-container">
              <ul className="flex flex-nowrap gap-4 py-2">
                {quizData.questions.map((question, index) => (
                  <li
                    key={index}
                    className={`cursor-pointer py-2 px-4 rounded border ${
                      index === currentQuestionIndex
                        ? 'bg-teal-500 text-white'
                        : isDarkMode
                        ? 'bg-[#262626] text-white hover:bg-gray-600'
                        : 'bg-gray-300 text-gray-900 hover:bg-gray-400'
                    }`}
                    onClick={() => handleQuestionSelect(index)}
                  >
                    {index + 1}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Question Details */}
          <div className={`${isDarkMode ? 'bg-[#403f3f]' : 'bg-gray-100'} p-4 flex-grow overflow-y-auto`}>
            <div className={`${isDarkMode ? 'bg-[#262626]' : 'bg-white'} rounded-lg p-4 mb-4 shadow-md`}>
              <div 
                className="question-text"
                dangerouslySetInnerHTML={{ __html: currentQuestion.question_text }}
              />
              <div className="border-t border-gray-300 my-4 w-full"></div>
              <h4 className='text-xl font-bold mb-2'>Table Names: {currentQuestion.table_names.join(', ')}</h4>
              <h4 className='text-xl font-bold mb-2'>Table Data:</h4>
              {currentQuestion.table_data.map((table, tableIndex) => (
                <div key={tableIndex} className="table-container mb-4">
                  <h5 className='text-lg font-bold mb-2'>Table Name: {table.table_name}</h5>
                  <table className="w-full mb-2">
                    <thead>
                      <tr className={isDarkMode ? 'bg-[#403f3f]' : 'bg-gray-200'}>
                        {table.columns.map((column, columnIndex) => (
                          <th key={columnIndex} className="border px-4 py-2">{column}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className={isDarkMode ? 'bg-[#262626]' : 'bg-gray-50'}>
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="border px-4 py-2">
                              {typeof cell === 'object' ? JSON.stringify(cell) : cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
            <div className={`${isDarkMode ? 'bg-[#262626]' : 'bg-white'} rounded-lg p-4 mb-4 shadow-md`}>
              <h3 className="text-lg font-bold mb-2">Expected Answer</h3>
              <table className="w-full mb-2">
                <tbody>
                  {currentQuestion.expected_output.map((row, rowIndex) => (
                    <tr key={rowIndex} className={isDarkMode ? 'bg-[#262626]' : 'bg-gray-50'}>
                      {row.map((value, cellIndex) => (
                        <td key={cellIndex} className="border px-4 py-2">{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
  
        {/* Right side: Code Editor and Results */}
        <div className={`${isDarkMode ? 'bg-[#403f3f]' : 'bg-gray-200'} px-4 flex flex-col`}>
          <div className={`${isDarkMode ? 'bg-[#262626]' : 'bg-white'} rounded-t-lg p-2`}>
            <span className="font-semibold">SQL</span>
          </div>
          <Split
            className="flex-grow"
            direction="vertical"
            sizes={[70, 30]}
            minSize={100}
            gutterSize={15}
            gutterAlign="center"
          >
            <MonacoEditor
              width="auto"
              height="auto"
              language="sql"
              theme={isDarkMode ? "vs-dark" : "light"}
              value={userQuery}
              onChange={setUserQuery}
            />
            <div className="flex flex-col">
              <div className="flex mt-2 space-x-2">
                <button
                  className={`flex-1 ${isRunning ? 'bg-teal-500' : 'bg-teal-600'} text-white px-4 py-2 rounded hover:bg-teal-700 focus:outline-none flex items-center justify-center`}
                  onClick={handleRunCode}
                  disabled={isRunning}
                >
                  {isRunning ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Running...
                    </>
                  ) : 'Run Code'}
                </button>
                <button 
                  onClick={handleSaveResults} 
                  className="flex-1 bg-white text-cyan-500 border border-cyan-500 px-4 py-2 rounded hover:bg-cyan-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50"
                >
                  {buttonText}
                </button>
              </div>
              <div className={`mt-4 ${isDarkMode ? 'bg-[#262626]' : 'bg-white'} rounded p-4 flex-grow overflow-y-auto`}>
                {showFeedback && (  
                  <div className="mt-2 flex flex-col space-y-4">
                    <div className='font-semibold'>OUTPUT</div>
                    {feedback.isCorrect ? (
                      <span className="text-green-400 text-3xl font-semibold">Correct!</span>
                    ) : (
                      <>
                        <span className="text-red-400 text-xl font-semibold">Incorrect code!</span>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <tbody>
                              {feedback.userAnswer && typeof feedback.userAnswer === 'string' ? (
                                feedback.userAnswer.split(' | ').map((row, rowIndex) => (
                                  <tr key={rowIndex}>
                                    {row.split(',').map((cell, cellIndex) => (
                                      <td key={cellIndex} className="border px-4 py-2 whitespace-nowrap">{cell.trim()}</td>
                                    ))}
                                  </tr>
                                ))
                              ) : Array.isArray(feedback.userAnswer) ? (
                                feedback.userAnswer.map((row, rowIndex) => (
                                  <tr key={rowIndex}>
                                    {(typeof row === 'object' ? Object.values(row) : [row]).map((cell, cellIndex) => (
                                      <td key={cellIndex} className="border px-4 py-2 whitespace-nowrap">{cell}</td>
                                    ))}
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td className="border px-4 py-2">No data available or invalid format</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Split>
        </div>
      </Split>
    </div>
  );
};

export default QuizApp;