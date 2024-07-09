import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MonacoEditor from './ResizableMonacoEditor' // Assuming you have a Monaco Editor wrapper component
import queryString from 'query-string';

const QuizApp = () => {
  const [quizData, setQuizData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userQuery, setUserQuery] = useState('');
  const [feedback, setFeedback] = useState('');
  const [saveStatus, setSaveStatus] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [buttonText, setButtonText] = useState('Save Results');
  const [isDarkMode, setIsDarkMode] = useState(true);

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
    try {
      const response = await axios.get(`https://server.datasenseai.com/execute-sql/query?q=${encodeURIComponent(userQuery)}`);
      const userAnswer = response.data;

      const expectedOutput = quizData.questions[currentQuestionIndex].expected_output;
      const isCorrect = compareResults(userAnswer, expectedOutput);

      if (isCorrect) {
        setFeedback({ text: 'Correct!', isCorrect: true });
      } else {
        setFeedback({
          isCorrect: false,
          expected: expectedOutput.map(row => Object.values(row).join(', ')).join(' | '),
          userAnswer: userAnswer.map(row => Object.values(row).join(', ')).join(' | ')
        });
      }

      setShowFeedback(true); // Show feedback after running code
    } catch (error) {
      console.error('Error executing query:', error);
      setFeedback('Error executing query.');
      setShowFeedback(true); // Show feedback on error
    }
  };
  

  const compareResults = (userResults, expectedOutput) => {
    // Check if lengths are the same
    if (userResults.length !== expectedOutput.length) {
      return false;
    }
  
    // Prepare a function to convert rows for comparison
    const prepareRowsForComparison = (rows) => {
      return rows.map(row => {
        const keys = Object.keys(row);
        return keys.map(key => row[key]);
      });
    };
  
    // Convert expected output to string for direct comparison
    const expectedString = JSON.stringify(expectedOutput.map(row => Object.values(row)));
  
    // Convert user results to expected format for comparison
    const userResultString = JSON.stringify(userResults.map(row => Object.values(row)));
  
    // Compare both strings
    return userResultString === expectedString;
  };
  
  const handleQuestionSelect = (index) => {
    setCurrentQuestionIndex(index);
    setFeedback('');  
    setShowFeedback(false); // Reset feedback when selecting new question
  };


  if (!quizData) return <div className='animate-bounce w-full h-screen flex items-center justify-center text-7xl font-bold'>STARTING....</div>;

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
      setSavesStatus('Results saved succesfully!');
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
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <nav className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} p-4 flex justify-between items-center`}>
        <h1 className=" mb-4 text-xl font-bold">SQL Quiz</h1>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`px-4 py-2 rounded-full ${isDarkMode ? 'bg-white text-black' : 'bg-gray-800 text-white'}`}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </nav>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left side: Question List and Details */}
        <div className="w-1/2 flex flex-col overflow-hidden">
          {/* Question List */}
          <div className={`flex gap-10 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} px-4 h-1/8`}>
            <h3 className="text-lg font-semibold mb-1 cursor-pointer ">Question</h3>
            <h3 className="text-lg font-semibold mb-1 cursor-pointer">Solution</h3>
            <ul className="flex">
              {quizData.questions.map((question, index) => (
                <li
                  key={index}
                  className={`cursor-pointer py-1 px-1 rounded ${
                    index === currentQuestionIndex 
                      ? ' text-white' 
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
              <br />
              <table className="w-full mb-2">
                <thead>
                  <tr className={isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}>
                    {currentQuestion.table_data.columns.map((column, index) => (
                      <th key={index} className="border px-4 py-2">{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentQuestion.table_data.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className={isDarkMode ? 'bg-gray-600' : 'bg-gray-50'}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="border px-4 py-2">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 mb-4 shadow-md`}>
              <h3 className="text-lg font-bold mb-2">Expected Answer</h3>
              <table className="w-full mb-2">
                <tbody>
                  {currentQuestion.expected_output.map((row, rowIndex) => (
                    <tr key={rowIndex} className={isDarkMode ? 'bg-gray-600' : 'bg-gray-50'}>
                      {Object.values(row).map((value, cellIndex) => (
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
        <div className={`w-1/2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} p-4 flex flex-col`}>
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-white'} rounded-t-lg p-2`}>
            <span className="font-semibold">SQL</span>
          </div>
          <MonacoEditor
            width="100%"
            height="400"
            language="sql"
            theme={isDarkMode ? "vs-dark" : "light"}
            value={userQuery}
            onChange={setUserQuery}
            options={{ fontSize: 16 }}
          />
          <div className="flex mt-2 space-x-2">
            <button
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none"
              onClick={handleRunCode}
            >
              Run Code
            </button>
            <button 
              onClick={handleSaveResults} 
              className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            >
              {buttonText}
            </button>
          </div>
          <div className={`mt-4 ${isDarkMode ? 'bg-gray-700' : 'bg-white'} rounded p-4 flex-grow overflow-y-auto`}>
            {showFeedback && (
              <div className="mt-2 flex flex-col space-y-4">
                {feedback.isCorrect ? (
                  <span className="text-green-400 text-3xl font-semibold">Correct!</span>
                ) : (
                  <>
                    <span className="text-red-400 text-xl font-semibold">Incorrect code!</span>
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          <th className={`border px-4 py-2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} text-left`}>Expected Output</th>
                          <th className={`border px-4 py-2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} text-left`}>Your Output</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border px-4 py-2 whitespace-pre-wrap">{feedback.expected}</td>
                          <td className="border px-4 py-2 whitespace-pre-wrap">{feedback.userAnswer}</td>
                        </tr>
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

};

export default QuizApp;
