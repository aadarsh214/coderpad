import React, { useEffect, useState } from 'react';
import axios from 'axios';
import queryString from 'query-string';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Navbar from './Navbar';
import '../App.css'

const Home = () => {
  const { isAuthenticated, user } = useAuth0();
  const navigateTo = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [filterType, setFilterType] = useState('all'); // 'all', 'sql', 'python', 'mcq'
  const parsed = queryString.parse(window.location.search);
  const userID = parsed.userID;

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const removeQuizTypePrefix = (quizName) => {
    return quizName.replace(/^(sql:|python:|mcq:)\s*/i, '');
  };

  const fetchQuizzes = async () => {
    try {
      const response = await axios.get('https://server.datasenseai.com/quiz/quizzes');
      setQuizzes(response.data);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }
  };
  
  const handleStartQuiz = (quizID, userID, quizName) => {
    if (!isAuthenticated) {
      alert('You need to log in to start the quiz.');
      return;
    }
  
    const lowerCaseQuizName = quizName.toLowerCase();
  
    if (lowerCaseQuizName.includes('sql:')) {
      navigateTo(`/quiz?quizID=${quizID}&userID=${userID}`);
    } else if (lowerCaseQuizName.includes('python:')) {
      navigateTo(`/pyQuiz?quizID=${quizID}&userID=${userID}`);
    } else if (lowerCaseQuizName.includes('mcq:')) {
      navigateTo(`/mcqQuiz?quizID=${quizID}&userID=${userID}`);
    } else {
      alert('Unknown quiz type.');
    }
  };

  const handleRegisterQuiz = async (quizID, userID) => {
    if (!isAuthenticated) {
      alert('You need to log in to register for the quiz.');
      return;
    }
    try {
      const response = await axios.post('https://server.datasenseai.com/sql-quiz/register', {
        userID: userID,
        quizID: quizID,
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Quiz registration successful:', response.data);
      alert('Quiz registration successful');
    } catch (error) {
      console.error('Error registering quiz:', error);
      alert('Failed to register for quiz');
    }
  };

  const determineButtonLabel = (quiz) => {
    const now = new Date();
    const startDate = new Date(quiz.start);
    const endDate = new Date(quiz.end);

    if (now < startDate) {
      return 'Register';
    } else if (now >= startDate && now <= endDate) {
      return 'Start';
    } else {
      return 'Ended';
    }
  };

  const determineButtonColor = (quiz) => {
    const now = new Date();
    const startDate = new Date(quiz.start);
    const endDate = new Date(quiz.end);

    if (now < startDate) {
      return 'bg-blue-600 hover:bg-blue-700';
    } else if (now >= startDate && now <= endDate) {
      return 'bg-custom-blue  hover:bg-gray-800';
    } else {
      return 'bg-gray-700 hover:bg-gray-700';
    }
  };

  const filteredQuizzes = quizzes.filter((quiz) => {
    if (filterType === 'all') {
      return true;
    } else if (filterType === 'sql') {
      return quiz.quizName.toLowerCase().includes('sql');
    } else if (filterType === 'python') {
      return quiz.quizName.toLowerCase().includes('python');
    } else if (filterType === 'mcq') {
      return quiz.quizName.toLowerCase().includes('mcq');
    }
    return true;
  });

    return (
      <div>
        <Navbar />
        <div className="flex flex-col items-center bg-gradient-to-br from-gray-900 to-gray-700">
          
          <div className="my-6 bg-gray-100 p-3 rounded-lg shadow-md bg-gradient-to-br from-gray-900 to-gray-700">
            <button
              onClick={() => setFilterType('all')}
              className={`mx-1 px-5 py-2 rounded-md font-semibold transition-all duration-300 ease-in-out glow-effect ${
                filterType === 'all'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white text-gray-800 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('sql')}
              className={`mx-1 px-5 py-2 rounded-md font-semibold transition-all duration-300 ease-in-out glow-effect ${
                filterType === 'sql'
                  ? 'bg-blue-500  text-white shadow-md'
                  : 'bg-white text-gray-800 hover:bg-gray-200'
              }`}
            >
              SQL
            </button>
            <button
              onClick={() => setFilterType('python')}
              className={`mx-1 px-5 py-2 rounded-md font-semibold transition-all duration-300 ease-in-out glow-effect ${
                filterType === 'python'
                  ? 'bg-blue-500  text-white shadow-md'
                  : 'bg-white text-gray-800 hover:bg-gray-200'
              }`}
            >
              Python
            </button>
            <button
              onClick={() => setFilterType('mcq')}
              className={`mx-1 px-5 py-2 rounded-md font-semibold transition-all duration-300 ease-in-out glow-effect ${
                filterType === 'mcq'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white text-gray-800 hover:bg-gray-200'
              }`}
            >
              MCQ
            </button>
          </div>

          <div className="flex flex-wrap justify-center bg">
            {filteredQuizzes.map((quiz) => (
              <div key={quiz._id} className="max-w-sm w-full sm:w-1/2 md:w-1/3 lg:w-1/4 rounded overflow-hidden shadow-xl m-4 bg-white text-gray-800">
                <div className="flex flex-col h-full">
                  <div className="px-6 py-4 flex-1">
                    <div className="text-xl mb-2 line-clamp-3">{removeQuizTypePrefix(quiz.quizName)}</div>
                  </div>
                  <div className="px-6 py-4">
                    <button
                      onClick={() => {
                        if (determineButtonLabel(quiz) === 'Register') {
                          handleRegisterQuiz(quiz._id, userID);
                        } else if (determineButtonLabel(quiz) === 'Start') {
                          handleStartQuiz(quiz._id, userID, quiz.quizName);
                        }
                      }}
                      className={`text-white font-bold py-2 px-5 rounded-xl glow-effect ${determineButtonColor(quiz)}`}
                      disabled={determineButtonLabel(quiz) === 'Ended'}
                    >
                      {determineButtonLabel(quiz)}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  export default Home;