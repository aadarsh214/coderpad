import React, { useState, useEffect } from 'react';
import axios from 'axios';
import queryString from 'query-string';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Video, FileText, Sun, Moon } from 'lucide-react';

const skills = ['Excel', 'SQL', 'Python', 'PowerBI', 'Tableau'];

const DataSkillsDashboard = () => {
  const { isAuthenticated, user, loginWithRedirect, logout } = useAuth0();
  const navigateTo = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const parsed = queryString.parse(window.location.search);
  const userID = parsed.userID;

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const removeQuizTypePrefix = (quizName) => {
    return quizName.replace(/^(sql:|python:|mcq:)\s*/i, '');
  };

  const getQuizType = (quizName) => {
    const lowerCaseQuizName = quizName.toLowerCase();
    if (lowerCaseQuizName.startsWith('sql:')) return 'SQL';
    if (lowerCaseQuizName.startsWith('python:')) return 'Python';
    if (lowerCaseQuizName.startsWith('mcq:')) return 'MCQ';
    return 'Unknown';
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
      return 'bg-cyan-600 hover:bg-gray-800';
    } else {
      return 'bg-gray-700 hover:bg-gray-700';
    }
  };

  const filteredQuizzes = selectedSkill
    ? quizzes.filter(quiz => quiz.quizName.toLowerCase().includes(selectedSkill.toLowerCase()))
    : quizzes;

  return (
    <div className={`font-sans min-h-screen ${isDarkMode ? 'bg-[#262626] text-white' : 'bg-gray-100 text-black'}`}>
      <header className={`${isDarkMode ? 'bg-[#403f3f]' : 'bg-cyan-700'} p-2 flex justify-between items-center`}>
        <h1 className="text-3xl text-white">Datasense</h1>
        <div className="flex items-center">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`mr-4 p-2 rounded-full ${isDarkMode ? 'bg-yellow-400 text-[#262626]' : 'bg-[#262626] text-yellow-400'}`}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          {isAuthenticated ? (
            <div className="flex items-center">
              <span className="mr-4 text-white">Welcome, {user.name}</span>
              <button
                onClick={() => logout({ returnTo: window.location.origin })}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Log Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => loginWithRedirect()}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Log In
            </button>
          )}
        </div>
      </header>

      <main className="container mx-auto p-4">
        <div className="flex flex-wrap justify-center gap-2 my-6">
          {skills.map((skill) => (
            <button
              key={skill}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 
                ${selectedSkill === skill 
                  ? 'bg-cyan-600 text-white' 
                  : isDarkMode
                    ? 'bg-[#403f3f] text-white border border-gray-600 hover:bg-[#4a4a4a]'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'}`}
              onClick={() => setSelectedSkill(skill === selectedSkill ? null : skill)}
            >
              {skill}
            </button>
          ))}
        </div>

        <div className={`${isDarkMode ? 'bg-[#403f3f]' : 'bg-white'} shadow-md rounded-lg overflow-x-auto`}>
          <table className="w-full">
            <thead className={isDarkMode ? 'bg-[#262626]' : 'bg-gray-50'}>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solution</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className={`${isDarkMode ? 'bg-[#403f3f]' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filteredQuizzes.map((quiz, index) => (
                <tr key={quiz._id} className={index % 2 === 0 ? (isDarkMode ? 'bg-[#333333]' : 'bg-gray-50') : (isDarkMode ? 'bg-[#403f3f]' : 'bg-white')}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    {getQuizType(quiz.quizName)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    {removeQuizTypePrefix(quiz.quizName)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button className="text-blue-400 hover:text-blue-600">
                        <FileText size={20} />
                      </button>
                      <button className="text-blue-400 hover:text-blue-600">
                        <Video size={20} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${quiz.difficulty ? 
                        (quiz.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : 
                        quiz.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800') 
                        : 'bg-green-100 text-green-800'}`}>
                      {quiz.difficulty || 'Easy'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        if (determineButtonLabel(quiz) === 'Register') {
                          handleRegisterQuiz(quiz._id, userID);
                        } else if (determineButtonLabel(quiz) === 'Start') {
                          handleStartQuiz(quiz._id, userID, quiz.quizName);
                        }
                      }}
                      className={`text-white font-bold py-2 px-5 rounded-xl ${determineButtonColor(quiz)}`}
                      disabled={determineButtonLabel(quiz) === 'Ended'}
                    >
                      {determineButtonLabel(quiz)}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default DataSkillsDashboard;