import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MonacoEditor from './components/ResizableMonacoEditor' // Assuming you have a Monaco Editor wrapper component

const QuizApp = () => {
  const [quizData, setQuizData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userQuery, setUserQuery] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const response = await axios.get('http://13.239.62.23:4000/sql-quiz/66812db556ad4c59e0efa49c/somemail@gmail.com');
        setQuizData(response.data);
      } catch (error) {
        console.error('Error fetching quiz data:', error);
      }
    };

    fetchQuizData();
  }, []);

  const handleRunCode = async () => {
    try {
      const response = await axios.get(`http://13.239.62.23:4000/execute-sql/query?q=${encodeURIComponent(userQuery)}`);
      const userAnswer = response.data;

      const expectedOutput = quizData.questions[currentQuestionIndex].expected_output;
      const isCorrect = compareResults(userAnswer, expectedOutput);

      if (isCorrect) {
        setFeedback('Correct!');
      } else {
        setFeedback(`Incorrect. Expected: ${expectedOutput.map(row => Object.values(row).join(', ')).join(' | ')}. Your answer: ${userAnswer.map(row => Object.values(row).join(', ')).join(' | ')}`);
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

  if (!quizData) return <div>Loading...</div>;

  const currentQuestion = quizData.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3 bg-gray-200 p-4">
              <h3 className="text-lg font-bold mb-4">Questions</h3>
              <ul>
                {quizData.questions.map((question, index) => (
                  <li
                    key={index}
                    className={`cursor-pointer py-2 px-4 rounded ${index === currentQuestionIndex ? 'bg-blue-500 text-white' : 'hover:bg-gray-300'}`}
                    onClick={() => handleQuestionSelect(index)}
                  >
                    Question {index + 1}
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-6 p-4">
              <div className="bg-white shadow-md rounded-lg p-4 mb-4">
          
                <h3 className="text-xl font-bold mb-2">{currentQuestion.question_text}</h3>
                <br />
                <table className="w-full mb-2">
                  <thead>
                    <tr className="bg-gray-100">
                      {currentQuestion.table_data.columns.map((column, index) => (
                        <th key={index} className="border px-4 py-2">{column}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentQuestion.table_data.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="border px-4 py-2">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-white shadow-md rounded-lg p-4 mb-4">
                <h3 className="text-lg font-bold mb-2">Expected Answer</h3>
                <table className="w-full mb-2">
                  {/* <thead>
                    <tr className="bg-gray-100">
                      {Object.keys(currentQuestion.expected_output[0]).map((key, index) => (
                        <th key={index} className="border px-4 py-2">{key}</th>
                      ))}
                    </tr>
                  </thead> */}
                  <tbody>
                    {currentQuestion.expected_output.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {Object.values(row).map((value, cellIndex) => (
                          <td key={cellIndex} className="border px-4 py-2">{value}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-white shadow-md rounded-lg p-4">
                <MonacoEditor
                  width="100%"
                  height="400"
                  language="sql"
                  value={userQuery}
                  onChange={setUserQuery}
                  options={{ fontSize: 14 }}
                />
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded mt-2 hover:bg-blue-600 focus:outline-none"
                  onClick={handleRunCode}
                >
                  Run Code
                </button>
                {showFeedback && <p className="mt-2">{feedback}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

};

export default QuizApp;
