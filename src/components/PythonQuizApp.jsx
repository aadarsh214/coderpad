import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MonacoEditor from './ResizableMonacoEditor'; // Assuming you have a Monaco Editor wrapper component
import queryString from 'query-string';

const PythonQuizApp = () => {
  const [quizData, setQuizData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userCode, setUserCode] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [score, setScore] = useState(0);

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
          {
            pyCode: fullCode
          },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
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
  };

  const handleSubmitQuiz = async () => {
    window.location.href = '/?userID='+userID;
    // try {
    //   const response = await axios.post(
    //     'http://13.239.62.23/python-quiz/update-scores',
    //     {
    //       userID,
    //       quizID,
    //       score: Math.min(score, quizData.questions.length),
    //     },
    //     {
    //       headers: {
    //         'Content-Type': 'application/json'
    //       }
    //     }
    //   );      

   
    //   if (response.status === 200) {
       
    //   }
    // } catch (error) {
    //   console.error('Error submitting quiz:', error);
    // }
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
              </div>
              <div className="bg-white shadow-md rounded-lg p-4 mb-4">
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
              <div className="bg-white shadow-md rounded-lg p-4">
                <MonacoEditor
                  width="100%"
                  height="400"
                  language="python"
                  value={userCode}
                  onChange={setUserCode}
                  options={{ fontSize: 16 }}
                />
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded mt-2 hover:bg-blue-600 focus:outline-none"
                  onClick={handleRunCode}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Running...' : 'Run Code'}
                </button>
                {showFeedback && <p className="mt-2">{feedback}</p>}
              </div>
            </div>
          </div>
          <div className="p-4">
            <button
              className="bg-green-500 text-white px-4 py-2 rounded mt-2 hover:bg-green-600 focus:outline-none"
              onClick={handleSubmitQuiz}
              disabled={isSubmitting}
            >
              Submit Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PythonQuizApp;
